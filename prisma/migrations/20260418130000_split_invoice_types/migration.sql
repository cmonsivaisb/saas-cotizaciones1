-- Transitional migration:
-- Add invoiceType to mixed invoices only when legacy schema is present.
-- Safe for shadow DB and idempotent for environments already beyond this step.

DO $$
DECLARE
  has_invoices BOOLEAN;
  has_subscription_id BOOLEAN;
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

  IF to_regtype('"InvoiceType"') IS NULL THEN
    EXECUTE 'CREATE TYPE "InvoiceType" AS ENUM (''operational'', ''subscription'')';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'invoices'
      AND column_name = 'invoiceType'
  ) THEN
    EXECUTE 'ALTER TABLE "invoices" ADD COLUMN "invoiceType" "InvoiceType" NOT NULL DEFAULT ''subscription''';
  END IF;

  EXECUTE '
    UPDATE "invoices"
    SET "invoiceType" = CASE
      WHEN "concept" LIKE ''FAC-%'' THEN ''operational''::"InvoiceType"
      ELSE ''subscription''::"InvoiceType"
    END
  ';

  EXECUTE 'ALTER TABLE "invoices" ALTER COLUMN "subscriptionId" DROP NOT NULL';

  EXECUTE '
    UPDATE "invoices"
    SET "subscriptionId" = NULL
    WHERE "invoiceType" = ''operational''
  ';

  EXECUTE 'CREATE INDEX IF NOT EXISTS "invoices_invoiceType_idx" ON "invoices"("invoiceType")';
  EXECUTE 'CREATE INDEX IF NOT EXISTS "invoices_companyId_invoiceType_idx" ON "invoices"("companyId", "invoiceType")';
END $$;
