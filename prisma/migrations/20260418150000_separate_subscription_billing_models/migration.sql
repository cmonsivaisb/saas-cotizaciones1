-- Transitional migration:
-- Split mixed invoices into:
-- - invoices (customer/operational only)
-- - subscription_invoices + subscription_payment_attempts (SaaS billing)
-- Runs only when legacy schema is detected (invoices.subscriptionId exists).

DO $$
DECLARE
  has_invoices BOOLEAN;
  has_subscription_id BOOLEAN;
  has_invoice_type BOOLEAN;
  has_payment_attempts BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'invoices'
  ) INTO has_invoices;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'invoices'
      AND column_name = 'subscriptionId'
  ) INTO has_subscription_id;

  IF NOT has_invoices OR NOT has_subscription_id THEN
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'invoices'
      AND column_name = 'invoiceType'
  ) INTO has_invoice_type;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'payment_attempts'
  ) INTO has_payment_attempts;

  EXECUTE '
    CREATE TABLE IF NOT EXISTS "subscription_invoices" (
      "id" TEXT NOT NULL,
      "companyId" TEXT NOT NULL,
      "subscriptionId" TEXT NOT NULL,
      "concept" TEXT NOT NULL,
      "amountMxn" DOUBLE PRECISION NOT NULL,
      "currency" TEXT NOT NULL DEFAULT ''MXN'',
      "status" "InvoiceStatus" NOT NULL DEFAULT ''pending'',
      "dueAt" TIMESTAMP(3) NOT NULL,
      "paidAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "subscription_invoices_pkey" PRIMARY KEY ("id")
    )
  ';

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscription_invoices_companyId_fkey'
  ) THEN
    EXECUTE '
      ALTER TABLE "subscription_invoices"
      ADD CONSTRAINT "subscription_invoices_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "companies"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
    ';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscription_invoices_subscriptionId_fkey'
  ) THEN
    EXECUTE '
      ALTER TABLE "subscription_invoices"
      ADD CONSTRAINT "subscription_invoices_subscriptionId_fkey"
      FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
    ';
  END IF;

  EXECUTE 'CREATE INDEX IF NOT EXISTS "subscription_invoices_companyId_idx" ON "subscription_invoices"("companyId")';
  EXECUTE 'CREATE INDEX IF NOT EXISTS "subscription_invoices_subscriptionId_idx" ON "subscription_invoices"("subscriptionId")';

  EXECUTE '
    CREATE TABLE IF NOT EXISTS "subscription_payment_attempts" (
      "id" TEXT NOT NULL,
      "subscriptionInvoiceId" TEXT NOT NULL,
      "provider" TEXT NOT NULL DEFAULT ''mercadopago'',
      "providerPreferenceId" TEXT,
      "providerPaymentId" TEXT,
      "externalReference" TEXT,
      "checkoutUrl" TEXT,
      "status" "PaymentAttemptStatus" NOT NULL DEFAULT ''created'',
      "rawResponseJson" JSONB,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "subscription_payment_attempts_pkey" PRIMARY KEY ("id")
    )
  ';

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscription_payment_attempts_subscriptionInvoiceId_fkey'
  ) THEN
    EXECUTE '
      ALTER TABLE "subscription_payment_attempts"
      ADD CONSTRAINT "subscription_payment_attempts_subscriptionInvoiceId_fkey"
      FOREIGN KEY ("subscriptionInvoiceId") REFERENCES "subscription_invoices"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
    ';
  END IF;

  EXECUTE 'CREATE INDEX IF NOT EXISTS "subscription_payment_attempts_subscriptionInvoiceId_idx" ON "subscription_payment_attempts"("subscriptionInvoiceId")';

  IF has_invoice_type THEN
    EXECUTE '
      INSERT INTO "subscription_invoices" (
        "id","companyId","subscriptionId","concept","amountMxn","currency","status","dueAt","paidAt","createdAt","updatedAt"
      )
      SELECT
        i."id", i."companyId", i."subscriptionId", i."concept", i."amountMxn", i."currency", i."status",
        i."dueAt", i."paidAt", i."createdAt", i."updatedAt"
      FROM "invoices" i
      WHERE i."invoiceType" = ''subscription''
        AND i."subscriptionId" IS NOT NULL
      ON CONFLICT ("id") DO NOTHING
    ';
  ELSE
    EXECUTE '
      INSERT INTO "subscription_invoices" (
        "id","companyId","subscriptionId","concept","amountMxn","currency","status","dueAt","paidAt","createdAt","updatedAt"
      )
      SELECT
        i."id", i."companyId", i."subscriptionId", i."concept", i."amountMxn", i."currency", i."status",
        i."dueAt", i."paidAt", i."createdAt", i."updatedAt"
      FROM "invoices" i
      WHERE i."concept" NOT LIKE ''FAC-%''
        AND i."subscriptionId" IS NOT NULL
      ON CONFLICT ("id") DO NOTHING
    ';
  END IF;

  IF has_payment_attempts THEN
    IF has_invoice_type THEN
      EXECUTE '
        INSERT INTO "subscription_payment_attempts" (
          "id","subscriptionInvoiceId","provider","providerPreferenceId","providerPaymentId",
          "externalReference","checkoutUrl","status","rawResponseJson","createdAt","updatedAt"
        )
        SELECT
          pa."id", pa."invoiceId", pa."provider", pa."providerPreferenceId", pa."providerPaymentId",
          pa."externalReference", pa."checkoutUrl", pa."status", pa."rawResponseJson", pa."createdAt", pa."updatedAt"
        FROM "payment_attempts" pa
        JOIN "invoices" i ON i."id" = pa."invoiceId"
        WHERE i."invoiceType" = ''subscription''
        ON CONFLICT ("id") DO NOTHING
      ';
    ELSE
      EXECUTE '
        INSERT INTO "subscription_payment_attempts" (
          "id","subscriptionInvoiceId","provider","providerPreferenceId","providerPaymentId",
          "externalReference","checkoutUrl","status","rawResponseJson","createdAt","updatedAt"
        )
        SELECT
          pa."id", pa."invoiceId", pa."provider", pa."providerPreferenceId", pa."providerPaymentId",
          pa."externalReference", pa."checkoutUrl", pa."status", pa."rawResponseJson", pa."createdAt", pa."updatedAt"
        FROM "payment_attempts" pa
        JOIN "invoices" i ON i."id" = pa."invoiceId"
        WHERE i."concept" NOT LIKE ''FAC-%''
        ON CONFLICT ("id") DO NOTHING
      ';
    END IF;
  END IF;

  EXECUTE 'ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "orderId" TEXT';

  IF has_invoice_type THEN
    EXECUTE '
      UPDATE "invoices" i
      SET "orderId" = matched."id"
      FROM LATERAL (
        SELECT o."id"
        FROM "orders" o
        WHERE o."companyId" = i."companyId"
          AND o."id" LIKE (substring(i."concept" from E''Pedido\\\\s+([A-Za-z0-9]+)'') || ''%'')
        ORDER BY o."createdAt" DESC
        LIMIT 1
      ) AS matched
      WHERE i."invoiceType" = ''operational''
        AND substring(i."concept" from E''Pedido\\\\s+([A-Za-z0-9]+)'') IS NOT NULL
    ';
    EXECUTE 'DELETE FROM "invoices" WHERE "invoiceType" = ''subscription''';
  ELSE
    EXECUTE '
      UPDATE "invoices" i
      SET "orderId" = matched."id"
      FROM LATERAL (
        SELECT o."id"
        FROM "orders" o
        WHERE o."companyId" = i."companyId"
          AND o."id" LIKE (substring(i."concept" from E''Pedido\\\\s+([A-Za-z0-9]+)'') || ''%'')
        ORDER BY o."createdAt" DESC
        LIMIT 1
      ) AS matched
      WHERE i."concept" LIKE ''FAC-%''
        AND substring(i."concept" from E''Pedido\\\\s+([A-Za-z0-9]+)'') IS NOT NULL
    ';
    EXECUTE 'DELETE FROM "invoices" WHERE "concept" NOT LIKE ''FAC-%''';
  END IF;

  EXECUTE 'ALTER TABLE "invoices" DROP COLUMN IF EXISTS "subscriptionId"';
  EXECUTE 'ALTER TABLE "invoices" DROP COLUMN IF EXISTS "invoiceType"';

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invoices_orderId_fkey'
  ) THEN
    EXECUTE '
      ALTER TABLE "invoices"
      ADD CONSTRAINT "invoices_orderId_fkey"
      FOREIGN KEY ("orderId") REFERENCES "orders"("id")
      ON DELETE SET NULL ON UPDATE CASCADE
    ';
  END IF;

  EXECUTE 'CREATE INDEX IF NOT EXISTS "invoices_orderId_idx" ON "invoices"("orderId")';

  EXECUTE 'DROP TABLE IF EXISTS "payment_attempts"';
  EXECUTE 'DROP INDEX IF EXISTS "invoices_invoiceType_idx"';
  EXECUTE 'DROP INDEX IF EXISTS "invoices_companyId_invoiceType_idx"';

  IF to_regtype('"InvoiceType"') IS NOT NULL THEN
    EXECUTE 'DROP TYPE "InvoiceType"';
  END IF;
END $$;
