import { prisma } from '@/lib/prisma'

type NotificationType = 
  | 'quote_created'
  | 'quote_updated'
  | 'quote_approved'
  | 'quote_rejected'
  | 'order_created'
  | 'order_updated'
  | 'order_status_changed'
  | 'order_delivered'
  | 'client_created'
  | 'client_updated'
  | 'invoice_created'
  | 'invoice_paid'
  | 'inventory_low_stock'
  | 'subscription_new'
  | 'subscription_renewed'
  | 'subscription_suspended'
  | 'system'

interface CreateNotificationParams {
  companyId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  metadata?: Record<string, any>
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        companyId: params.companyId,
        type: params.type as any,
        title: params.title,
        message: params.message,
        link: params.link,
        metadata: params.metadata || undefined,
      },
    })
  } catch (error) {
    console.error('Failed to create notification:', error)
    return null
  }
}

export async function getUnreadNotifications(companyId: string, limit = 20) {
  return prisma.notification.findMany({
    where: {
      companyId,
      isRead: false,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function getAllNotifications(companyId: string, limit = 50) {
  return prisma.notification.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function markNotificationAsRead(notificationId: string, companyId: string) {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      companyId,
    },
    data: { isRead: true },
  })
}

export async function markAllNotificationsAsRead(companyId: string) {
  return prisma.notification.updateMany({
    where: {
      companyId,
      isRead: false,
    },
    data: { isRead: true },
  })
}

export async function getUnreadCount(companyId: string) {
  return prisma.notification.count({
    where: {
      companyId,
      isRead: false,
    },
  })
}

export async function deleteNotification(notificationId: string, companyId: string) {
  return prisma.notification.deleteMany({
    where: {
      id: notificationId,
      companyId,
    },
  })
}