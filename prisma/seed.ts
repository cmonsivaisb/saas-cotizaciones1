import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'Extremo1.',
  database: 'cotizanet',
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting seed...')

  // Create plans
  console.log('📦 Creating plans...')
  const cotizanetPlan = await prisma.plan.upsert({
    where: { code: 'cotizanet' },
    update: {},
    create: {
      code: 'cotizanet',
      name: 'CotizaNet',
      priceMxn: 500,
      durationDays: 30,
      isActive: true,
    },
  })

  console.log('✅ Plan created:', cotizanetPlan)

  // Create admin user
  console.log('👤 Creating admin user...')
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@cotizanet.com' },
    update: {},
    create: {
      name: 'Admin CotizaNet',
      email: 'admin@cotizanet.com',
      passwordHash: hashedPassword,
      role: 'admin',
    },
  })

  console.log('✅ Admin user created:', adminUser)

  // Create test company and user
  console.log('🏢 Creating test company...')
  const testUserPassword = await bcrypt.hash('test123', 10)
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@empresa.com' },
    update: {},
    create: {
      name: 'Juan Pérez',
      email: 'test@empresa.com',
      passwordHash: testUserPassword,
      role: 'owner',
    },
  })

  const testCompany = await prisma.company.upsert({
    where: { ownerUserId: testUser.id },
    update: {},
    create: {
      ownerUserId: testUser.id,
      name: 'Taller Industrial de Prueba',
      contactName: 'Juan Pérez',
      email: 'contacto@tallerprueba.com',
      phone: '+52 55 1234 5678',
      city: 'Ciudad de México',
      businessType: 'Taller',
      status: 'active',
    },
  })

  // Create subscription for test company
  const testSubscription = await prisma.subscription.upsert({
    where: { companyId: testCompany.id },
    update: {},
    create: {
      companyId: testCompany.id,
      planId: cotizanetPlan.id,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      nextBillingAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
  })

  console.log('✅ Test company created:', testCompany)
  console.log('✅ Test subscription created:', testSubscription)

  // Create test customers
  console.log('👥 Creating test customers...')
  const customer1 = await prisma.customer.create({
    data: {
      companyId: testCompany.id,
      businessName: 'Constructora ABC',
      contactName: 'María González',
      phone: '+52 55 9876 5432',
      email: 'maria@constructoraabc.com',
      source: 'Referido',
    },
  })

  const customer2 = await prisma.customer.create({
    data: {
      companyId: testCompany.id,
      businessName: 'Distribuidora XYZ',
      contactName: 'Carlos Rodríguez',
      phone: '+52 55 1111 2222',
      email: 'carlos@distribuidoraxyz.com',
      source: 'LinkedIn',
    },
  })

  console.log('✅ Test customers created:', { customer1, customer2 })

  // Create test items
  console.log('📦 Creating test items...')
  const item1 = await prisma.item.create({
    data: {
      companyId: testCompany.id,
      sku: 'TORN-001',
      name: 'Tornillo Hexagonal 1/2"',
      description: 'Tornillo hexagonal de acero inoxidable, 1/2 pulgadas',
      unit: 'pieza',
      salePrice: 15.50,
      costPrice: 8.00,
      stockQuantity: 500,
      minimumStock: 100,
      isActive: true,
    },
  })

  const item2 = await prisma.item.create({
    data: {
      companyId: testCompany.id,
      sku: 'TUER-002',
      name: 'Tuerca Hexagonal 1/2"',
      description: 'Tuerca hexagonal de acero inoxidable, 1/2 pulgadas',
      unit: 'pieza',
      salePrice: 5.00,
      costPrice: 2.50,
      stockQuantity: 1000,
      minimumStock: 200,
      isActive: true,
    },
  })

  const item3 = await prisma.item.create({
    data: {
      companyId: testCompany.id,
      sku: 'ARAN-003',
      name: 'Arandela Plana 1/2"',
      description: 'Arandela plana de acero inoxidable, 1/2 pulgadas',
      unit: 'pieza',
      salePrice: 3.00,
      costPrice: 1.50,
      stockQuantity: 1500,
      minimumStock: 300,
      isActive: true,
    },
  })

  console.log('✅ Test items created:', { item1, item2, item3 })

  // Create test quote
  console.log('📄 Creating test quote...')
  const testQuote = await prisma.quote.create({
    data: {
      companyId: testCompany.id,
      customerId: customer1.id,
      folio: 'COT-' + Date.now().toString(36).toUpperCase(),
      quoteDate: new Date(),
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'sent',
      subtotal: 2350.00,
      total: 2350.00,
      notes: 'Cotización válida por 15 días',
      items: {
        create: [
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
        ],
      },
    },
  })

  console.log('✅ Test quote created:', testQuote)

  // Create test order
  console.log('📦 Creating test order...')
  const testOrder = await prisma.order.create({
    data: {
      companyId: testCompany.id,
      customerId: customer2.id,
      quoteId: null,
      orderDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'in_progress',
      subtotal: 1550.00,
      total: 1550.00,
      notes: 'Entrega prioritaria',
      items: {
        create: [
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
        ],
      },
    },
  })

  console.log('✅ Test order created:', testOrder)

  // Create test lead
  console.log('📋 Creating test lead...')
  const testLead = await prisma.lead.create({
    data: {
      name: 'Roberto Sánchez',
      businessName: 'Metalmecánica RS',
      email: 'roberto@metalmecanicars.com',
      phone: '+52 55 3333 4444',
      businessType: 'Maquinado',
      message: 'Interesado en el sistema para gestionar cotizaciones y pedidos',
      status: 'new',
      source: 'Landing Page',
    },
  })

  console.log('✅ Test lead created:', testLead)

  console.log('🎉 Seed completed successfully!')
  console.log('\n📝 Test credentials:')
  console.log('   Admin: admin@cotizanet.com / admin123')
  console.log('   User:  test@empresa.com / test123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
