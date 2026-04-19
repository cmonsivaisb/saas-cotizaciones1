import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export interface SessionData {
  userId: string
  email: string
  name: string
  role: 'owner' | 'admin'
  companyId?: string
  subscriptionStatus?: string
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Create a session object
 */
export function createSession(user: any): SessionData {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.ownedCompany?.id,
    subscriptionStatus: user.ownedCompany?.subscription?.status,
  }
}

/**
 * Validate session data
 */
export function validateSession(session: any): session is SessionData {
  return (
    session &&
    typeof session.userId === 'string' &&
    typeof session.email === 'string' &&
    typeof session.name === 'string' &&
    (session.role === 'owner' || session.role === 'admin')
  )
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      ownedCompany: {
        include: {
          subscription: true,
        },
      },
    },
  })
}

/**
 * Get user by ID
 */
export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      ownedCompany: {
        include: {
          subscription: true,
        },
      },
    },
  })
}

/**
 * Create a new user
 */
export async function createUser(data: {
  name: string
  email: string
  password: string
  role?: 'owner' | 'admin'
}) {
  const passwordHash = await hashPassword(data.password)

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role || 'owner',
    },
  })
}

/**
 * Create a new user with company
 */
export async function createUserWithCompany(data: {
  name: string
  email: string
  password: string
  companyName: string
  contactName: string
  phone: string
  city: string
  businessType: string
}) {
  const passwordHash = await hashPassword(data.password)

    return prisma.$transaction(async (tx: any) => {
    // Create user
    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: 'owner',
      },
    })

    // Create company
    const company = await tx.company.create({
      data: {
        ownerUserId: user.id,
        name: data.companyName,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        businessType: data.businessType,
        status: 'active',
      },
    })

    // Get cotizanet plan
    const cotizanetPlan = await tx.plan.findUnique({
      where: { code: 'cotizanet' },
    })

    if (!cotizanetPlan) {
      throw new Error('CotizaNet plan not found')
    }

    // Create subscription
    const subscription = await tx.subscription.create({
      data: {
        companyId: company.id,
        planId: cotizanetPlan.id,
        status: 'pilot',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        nextBillingAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
    })

    return {
      user,
      company,
      subscription,
    }
  })
}
