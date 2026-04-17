import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency to Mexican Peso
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format date to locale string
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

/**
 * Format date and time to locale string
 */
export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

/**
 * Format date to short string (DD/MM/YYYY)
 */
export function formatShortDate(date: Date | string): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))
}

/**
 * Calculate days until a date
 */
export function daysUntil(date: Date | string): number {
  const target = new Date(date)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date | string): boolean {
  return new Date(date) < new Date()
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
  const target = new Date(date)
  const now = new Date()
  return (
    target.getDate() === now.getDate() &&
    target.getMonth() === now.getMonth() &&
    target.getFullYear() === now.getFullYear()
  )
}

/**
 * Generate a random folio number
 */
export function generateFolio(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (Mexican format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+52|52)?\s?(\d{3})\s?(\d{3})\s?(\d{4})$/
  return phoneRegex.test(phone.replace(/[\s-]/g, ''))
}

/**
 * Format phone number to Mexican format
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`
  }
  return phone
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Sleep function for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Get status badge variant based on status
 */
export function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const successStatuses = ['active', 'paid', 'approved', 'delivered', 'qualified', 'closed', 'won']
  const warningStatuses = ['pilot', 'grace_period', 'pending', 'follow_up', 'in_progress', 'partial_delivered', 'contacted', 'interested', 'waiting']
  const errorStatuses = ['suspended', 'expired', 'rejected', 'cancelled', 'lost', 'no_response']
  
  if (successStatuses.includes(status)) return 'default'
  if (warningStatuses.includes(status)) return 'outline'
  if (errorStatuses.includes(status)) return 'destructive'
  return 'secondary'
}

/**
 * Get status color class based on status
 */
export function getStatusColor(status: string): string {
  const successStatuses = ['active', 'paid', 'approved', 'delivered', 'qualified', 'closed', 'won']
  const warningStatuses = ['pilot', 'grace_period', 'pending', 'follow_up', 'in_progress', 'partial_delivered', 'contacted', 'interested', 'waiting']
  const errorStatuses = ['suspended', 'expired', 'rejected', 'cancelled', 'lost', 'no_response']
  
  if (successStatuses.includes(status)) return 'text-green-700 bg-green-50 border-green-200'
  if (warningStatuses.includes(status)) return 'text-yellow-700 bg-yellow-50 border-yellow-200'
  if (errorStatuses.includes(status)) return 'text-red-700 bg-red-50 border-red-200'
  return 'text-gray-700 bg-gray-50 border-gray-200'
}
