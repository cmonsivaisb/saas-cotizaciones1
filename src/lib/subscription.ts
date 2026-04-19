import { prisma } from './prisma'

const DEFAULT_PLAN_CODE = 'cotizanet'
const DEFAULT_PLAN_NAME = 'CotizaNet'
const DEFAULT_PLAN_PRICE_MXN = 500
const DEFAULT_TRIAL_DAYS = 15

async function getSubscriptionInvoicesCompat(companyId: string, subscriptionId: string): Promise<any[]> {
  const prismaAny = prisma as any

  if (prismaAny.subscriptionInvoice?.findMany) {
    try {
      return await prismaAny.subscriptionInvoice.findMany({
        where: {
          companyId,
          subscriptionId,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      })
    } catch (error) {
      console.warn('subscriptionInvoice.findMany failed, trying legacy fallback:', error)
    }
  }

  if (prismaAny.invoice?.findMany) {
    try {
      return await prismaAny.invoice.findMany({
        where: {
          companyId,
          subscriptionId,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      })
    } catch (error) {
      console.warn('legacy invoice.findMany with subscriptionId failed:', error)

      try {
        return await prismaAny.invoice.findMany({
          where: {
            companyId,
            concept: {
              contains: 'Suscrip',
              mode: 'insensitive',
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        })
      } catch (fallbackError) {
        console.warn('legacy invoice fallback by concept failed:', fallbackError)
      }
    }
  }

  return []
}

async function getCompanyWithSubscription(companyId: string): Promise<any> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
    },
  })

  if (!company || !company.subscription) {
    return company
  }

  const invoices = await getSubscriptionInvoicesCompat(company.id, company.subscription.id)

  const now = new Date()
  const graceUntil = company.subscription.graceUntil ? new Date(company.subscription.graceUntil) : null
  const hasPendingInvoices = invoices.some((invoice) => invoice.status === 'pending')

  if (
    company.subscription.status === 'grace_period' &&
    graceUntil &&
    graceUntil <= now &&
    hasPendingInvoices
  ) {
    await prisma.subscription.update({
      where: { id: company.subscription.id },
      data: {
        status: 'suspended',
        suspendedAt: now,
      },
    })

    await prisma.company.update({
      where: { id: company.id },
      data: {
        status: 'suspended',
      },
    })

    return {
      ...company,
      status: 'suspended',
      subscription: {
        ...company.subscription,
        status: 'suspended',
        suspendedAt: now,
        subscriptionInvoices: invoices,
      },
    }
  }

  return {
    ...company,
    subscription: {
      ...company.subscription,
      subscriptionInvoices: invoices,
    },
  }
}

export async function ensureCompanySubscription(companyId: string | undefined | null): Promise<any> {
  if (!companyId) {
    return null
  }

  const company = await getCompanyWithSubscription(companyId)

  if (!company) {
    return null
  }

  if (company.subscription) {
    return company
  }

  let plan = await prisma.plan.findUnique({
    where: { code: DEFAULT_PLAN_CODE },
  })

  if (!plan) {
    plan = await prisma.plan.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    })
  }

  if (!plan) {
    plan = await prisma.plan.create({
      data: {
        code: DEFAULT_PLAN_CODE,
        name: DEFAULT_PLAN_NAME,
        priceMxn: DEFAULT_PLAN_PRICE_MXN,
        durationDays: 30,
        isActive: true,
      },
    })
  }

  const now = new Date()
  const firstPeriodEnd = new Date(now.getTime() + DEFAULT_TRIAL_DAYS * 24 * 60 * 60 * 1000)

  await prisma.subscription.upsert({
    where: { companyId },
    update: {},
    create: {
      companyId,
      planId: plan.id,
      status: 'pilot',
      currentPeriodStart: now,
      currentPeriodEnd: firstPeriodEnd,
      nextBillingAt: firstPeriodEnd,
    },
  })

  return getCompanyWithSubscription(companyId)
}
