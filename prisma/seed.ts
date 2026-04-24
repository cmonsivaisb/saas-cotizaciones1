import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required to run seed.')
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const DEMO = {
  admin: {
    name: 'Admin CotizaNet',
    email: 'admin@cotizanet.com',
    password: 'admin123',
  },
  owner: {
    name: 'Juan Perez',
    email: 'test@empresa.com',
    password: 'test123',
  },
  company: {
    name: 'Taller Industrial de Prueba',
    contactName: 'Juan Perez',
    email: 'contacto@tallerprueba.com',
    phone: '+52 55 1234 5678',
    city: 'Ciudad de Mexico',
    businessType: 'Taller',
  },
  quoteFolio: 'COT-DEMO-001',
  orderMarker: 'SEED_DEMO_ORDER_001',
}

async function upsertCustomer(companyId: string, data: {
  businessName: string
  contactName: string
  phone: string
  email?: string
  source?: string
}) {
  const existing = await prisma.customer.findFirst({
    where: {
      companyId,
      businessName: data.businessName,
    },
  })

  if (existing) {
    return prisma.customer.update({
      where: { id: existing.id },
      data,
    })
  }

  return prisma.customer.create({
    data: {
      companyId,
      ...data,
    },
  })
}

async function upsertItem(companyId: string, data: {
  sku: string
  name: string
  description: string
  unit: string
  salePrice: number
  costPrice: number
  stockQuantity: number
  minimumStock: number
}) {
  const existing = await prisma.item.findFirst({
    where: {
      companyId,
      sku: data.sku,
    },
  })

  if (existing) {
    return prisma.item.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        description: data.description,
        unit: data.unit,
        salePrice: data.salePrice,
        costPrice: data.costPrice,
        stockQuantity: data.stockQuantity,
        minimumStock: data.minimumStock,
        isActive: true,
      },
    })
  }

  return prisma.item.create({
    data: {
      companyId,
      ...data,
      isActive: true,
    },
  })
}

async function main() {
  console.log('Starting seed...')

  const adminPasswordHash = await bcrypt.hash(DEMO.admin.password, 10)
  const ownerPasswordHash = await bcrypt.hash(DEMO.owner.password, 10)
  const now = new Date()
  const plus15Days = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)
  const plus7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const plan = await prisma.plan.upsert({
    where: { code: 'cotizanet' },
    update: {
      name: 'CotizaNet',
      priceMxn: 500,
      durationDays: 30,
      isActive: true,
    },
    create: {
      code: 'cotizanet',
      name: 'CotizaNet',
      priceMxn: 500,
      durationDays: 30,
      isActive: true,
    },
  })
  console.log('Plan ready:', plan.code)

  const adminUser = await prisma.user.upsert({
    where: { email: DEMO.admin.email },
    update: {
      name: DEMO.admin.name,
      passwordHash: adminPasswordHash,
      role: 'admin',
    },
    create: {
      name: DEMO.admin.name,
      email: DEMO.admin.email,
      passwordHash: adminPasswordHash,
      role: 'admin',
    },
  })
  console.log('Admin user ready:', adminUser.email)

  const ownerUser = await prisma.user.upsert({
    where: { email: DEMO.owner.email },
    update: {
      name: DEMO.owner.name,
      passwordHash: ownerPasswordHash,
      role: 'owner',
    },
    create: {
      name: DEMO.owner.name,
      email: DEMO.owner.email,
      passwordHash: ownerPasswordHash,
      role: 'owner',
    },
  })
  console.log('Owner user ready:', ownerUser.email)

  const company = await prisma.company.upsert({
    where: { ownerUserId: ownerUser.id },
    update: {
      name: DEMO.company.name,
      contactName: DEMO.company.contactName,
      email: DEMO.company.email,
      phone: DEMO.company.phone,
      city: DEMO.company.city,
      businessType: DEMO.company.businessType,
      status: 'active',
    },
    create: {
      ownerUserId: ownerUser.id,
      name: DEMO.company.name,
      contactName: DEMO.company.contactName,
      email: DEMO.company.email,
      phone: DEMO.company.phone,
      city: DEMO.company.city,
      businessType: DEMO.company.businessType,
      status: 'active',
    },
  })
  console.log('Company ready:', company.name)

  const subscription = await prisma.subscription.upsert({
    where: { companyId: company.id },
    update: {
      planId: plan.id,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: plus15Days,
      nextBillingAt: plus15Days,
      graceUntil: null,
      suspendedAt: null,
    },
    create: {
      companyId: company.id,
      planId: plan.id,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: plus15Days,
      nextBillingAt: plus15Days,
    },
  })
  console.log('Subscription ready:', subscription.id)

  const customerA = await upsertCustomer(company.id, {
    businessName: 'Constructora ABC',
    contactName: 'Maria Gonzalez',
    phone: '+52 55 9876 5432',
    email: 'maria@constructoraabc.com',
    source: 'Referido',
  })

  const customerB = await upsertCustomer(company.id, {
    businessName: 'Distribuidora XYZ',
    contactName: 'Carlos Rodriguez',
    phone: '+52 55 1111 2222',
    email: 'carlos@distribuidoraxyz.com',
    source: 'LinkedIn',
  })
  console.log('Customers ready:', customerA.businessName, customerB.businessName)

  const item1 = await upsertItem(company.id, {
    sku: 'TORN-001',
    name: 'Tornillo Hexagonal 1/2"',
    description: 'Tornillo hexagonal de acero inoxidable, 1/2 pulgadas',
    unit: 'pieza',
    salePrice: 15.5,
    costPrice: 8,
    stockQuantity: 500,
    minimumStock: 100,
  })

  const item2 = await upsertItem(company.id, {
    sku: 'TUER-002',
    name: 'Tuerca Hexagonal 1/2"',
    description: 'Tuerca hexagonal de acero inoxidable, 1/2 pulgadas',
    unit: 'pieza',
    salePrice: 5,
    costPrice: 2.5,
    stockQuantity: 1000,
    minimumStock: 200,
  })

  const item3 = await upsertItem(company.id, {
    sku: 'ARAN-003',
    name: 'Arandela Plana 1/2"',
    description: 'Arandela plana de acero inoxidable, 1/2 pulgadas',
    unit: 'pieza',
    salePrice: 3,
    costPrice: 1.5,
    stockQuantity: 1500,
    minimumStock: 300,
  })
  console.log('Items ready:', item1.sku, item2.sku, item3.sku)

  const existingQuote = await prisma.quote.findFirst({
    where: {
      companyId: company.id,
      customerId: customerA.id,
      status: 'sent',
    },
  })

  const quoteBaseData = {
    companyId: company.id,
    customerId: customerA.id,
    quoteDate: now,
    validUntil: plus15Days,
    status: 'sent' as const,
    subtotal: 2350,
    total: 2350,
    notes: 'Cotizacion valida por 15 dias',
  }

  const quoteItems = [
    {
      itemId: item1.id,
      description: item1.name,
      qty: 100,
      unitPrice: item1.salePrice,
      amount: item1.salePrice * 100,
    },
    {
      itemId: item2.id,
      description: item2.name,
      qty: 100,
      unitPrice: item2.salePrice,
      amount: item2.salePrice * 100,
    },
    {
      itemId: item3.id,
      description: item3.name,
      qty: 100,
      unitPrice: item3.salePrice,
      amount: item3.salePrice * 100,
    },
  ]

  const quote = existingQuote
    ? await prisma.quote.update({
        where: { id: existingQuote.id },
        data: {
          ...quoteBaseData,
          items: {
            deleteMany: {},
            create: quoteItems,
          },
        },
      })
    : await prisma.quote.create({
        data: {
          ...quoteBaseData,
          items: {
            create: quoteItems,
          },
        },
      })
  console.log('Quote ready:', quote.quoteNumber)

  const existingOrder = await prisma.order.findFirst({
    where: {
      companyId: company.id,
      notes: DEMO.orderMarker,
    },
  })

  const orderBaseData = {
    companyId: company.id,
    customerId: customerB.id,
    quoteId: null,
    orderDate: now,
    dueDate: plus7Days,
    status: 'in_progress' as const,
    subtotal: 1550,
    total: 1550,
    notes: DEMO.orderMarker,
  }

  const orderItems = [
    {
      itemId: item1.id,
      description: item1.name,
      qty: 50,
      unitPrice: item1.salePrice,
      amount: item1.salePrice * 50,
      affectsInventory: true,
    },
    {
      itemId: item2.id,
      description: item2.name,
      qty: 50,
      unitPrice: item2.salePrice,
      amount: item2.salePrice * 50,
      affectsInventory: true,
    },
  ]

  const order = existingOrder
    ? await prisma.order.update({
        where: { id: existingOrder.id },
        data: {
          ...orderBaseData,
          items: {
            deleteMany: {},
            create: orderItems,
          },
        },
      })
    : await prisma.order.create({
        data: {
          ...orderBaseData,
          items: {
            create: orderItems,
          },
        },
      })
  console.log('Order ready:', order.id)

  const existingInvoice = await prisma.invoice.findFirst({
    where: {
      companyId: company.id,
      concept: 'FAC-DEMO-001',
    },
  })

  const invoice = existingInvoice
    ? await prisma.invoice.update({
        where: { id: existingInvoice.id },
        data: {
          orderId: order.id,
          amountMxn: 1550,
          currency: 'MXN',
          status: 'pending',
          dueAt: plus7Days,
          paidAt: null,
        },
      })
    : await prisma.invoice.create({
        data: {
          companyId: company.id,
          orderId: order.id,
          concept: 'FAC-DEMO-001',
          amountMxn: 1550,
          currency: 'MXN',
          status: 'pending',
          dueAt: plus7Days,
        },
      })
  console.log('Customer invoice ready:', invoice.concept)

  const existingSubscriptionInvoice = await prisma.subscriptionInvoice.findFirst({
    where: {
      companyId: company.id,
      concept: 'Suscripcion CotizaNet DEMO',
    },
  })

  const subscriptionInvoice = existingSubscriptionInvoice
    ? await prisma.subscriptionInvoice.update({
        where: { id: existingSubscriptionInvoice.id },
        data: {
          subscriptionId: subscription.id,
          amountMxn: plan.priceMxn,
          currency: 'MXN',
          status: 'pending',
          dueAt: plus15Days,
          paidAt: null,
        },
      })
    : await prisma.subscriptionInvoice.create({
        data: {
          companyId: company.id,
          subscriptionId: subscription.id,
          concept: 'Suscripcion CotizaNet DEMO',
          amountMxn: plan.priceMxn,
          currency: 'MXN',
          status: 'pending',
          dueAt: plus15Days,
        },
      })
  console.log('Subscription invoice ready:', subscriptionInvoice.id)

  const existingAttempt = await prisma.subscriptionPaymentAttempt.findFirst({
    where: {
      subscriptionInvoiceId: subscriptionInvoice.id,
      providerPreferenceId: 'pref_demo_subscription',
    },
  })

  const paymentAttempt = existingAttempt
    ? await prisma.subscriptionPaymentAttempt.update({
        where: { id: existingAttempt.id },
        data: {
          provider: 'mercadopago',
          providerPaymentId: null,
          externalReference: subscriptionInvoice.id,
          checkoutUrl: `https://checkout.mercadopago.com/${subscriptionInvoice.id}`,
          status: 'created',
          rawResponseJson: { source: 'seed' },
        },
      })
    : await prisma.subscriptionPaymentAttempt.create({
        data: {
          subscriptionInvoiceId: subscriptionInvoice.id,
          provider: 'mercadopago',
          providerPreferenceId: 'pref_demo_subscription',
          externalReference: subscriptionInvoice.id,
          checkoutUrl: `https://checkout.mercadopago.com/${subscriptionInvoice.id}`,
          status: 'created',
          rawResponseJson: { source: 'seed' },
        },
      })
  console.log('Subscription payment attempt ready:', paymentAttempt.id)

  const existingLead = await prisma.lead.findFirst({
    where: { email: 'roberto@metalmecanicars.com' },
  })

  const lead = existingLead
    ? await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          name: 'Roberto Sanchez',
          businessName: 'Metalmecanica RS',
          phone: '+52 55 3333 4444',
          businessType: 'Maquinado',
          message: 'Interesado en gestionar cotizaciones y pedidos',
          status: 'new',
          source: 'Landing Page',
        },
      })
    : await prisma.lead.create({
        data: {
          name: 'Roberto Sanchez',
          businessName: 'Metalmecanica RS',
          email: 'roberto@metalmecanicars.com',
          phone: '+52 55 3333 4444',
          businessType: 'Maquinado',
          message: 'Interesado en gestionar cotizaciones y pedidos',
          status: 'new',
          source: 'Landing Page',
        },
      })
  console.log('Lead ready:', lead.email)

  console.log('Seed completed successfully.')
  console.log('Test credentials:')
  console.log(`  Admin: ${DEMO.admin.email} / ${DEMO.admin.password}`)
  console.log(`  User:  ${DEMO.owner.email} / ${DEMO.owner.password}`)
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
