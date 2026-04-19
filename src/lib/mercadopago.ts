import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'

type AttemptStatus = 'created' | 'redirected' | 'approved' | 'pending' | 'rejected' | 'cancelled' | 'error'

function getAccessToken() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN

  if (!token) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN is not configured')
  }

  return token
}

function getClient() {
  return new MercadoPagoConfig({
    accessToken: getAccessToken(),
    options: {
      timeout: 10000,
    },
  })
}

export function resolveAppUrl(requestUrl?: string) {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  }

  if (requestUrl) {
    return new URL(requestUrl).origin
  }

  return 'http://localhost:3000'
}

export function mapMercadoPagoStatusToAttemptStatus(status?: string | null): AttemptStatus {
  switch (status) {
    case 'approved':
      return 'approved'
    case 'authorized':
    case 'in_process':
    case 'in_mediation':
    case 'pending':
      return 'pending'
    case 'rejected':
      return 'rejected'
    case 'cancelled':
    case 'charged_back':
    case 'refunded':
      return 'cancelled'
    default:
      return 'error'
  }
}

export async function createSubscriptionCheckoutPreference(params: {
  requestUrl: string
  invoiceId: string
  concept: string
  amountMxn: number
  payerEmail?: string | null
  metadata?: Record<string, unknown>
}) {
  const appUrl = resolveAppUrl(params.requestUrl)
  const preferenceApi = new Preference(getClient())

  const successUrl = `${appUrl}/api/billing/return/success`
  const failureUrl = `${appUrl}/api/billing/return/failure`
  const pendingUrl = `${appUrl}/api/billing/return/pending`
  const webhookUrl = `${appUrl}/api/webhooks/mercadopago`

  const response = await preferenceApi.create({
    body: {
      items: [
        {
          id: params.invoiceId,
          title: params.concept,
          description: 'Pago de suscripcion SaaS CotizaNet',
          quantity: 1,
          currency_id: 'MXN',
          unit_price: Number(params.amountMxn),
        },
      ],
      external_reference: params.invoiceId,
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl,
      },
      notification_url: webhookUrl,
      auto_return: 'approved',
      payer: params.payerEmail ? { email: params.payerEmail } : undefined,
      metadata: params.metadata,
      statement_descriptor: 'COTIZANET',
    },
  })

  const preferenceId = response.id
  const checkoutUrl = response.init_point || response.sandbox_init_point

  if (!preferenceId || !checkoutUrl) {
    throw new Error('Mercado Pago did not return preference id/init point')
  }

  return {
    preferenceId,
    checkoutUrl,
    rawResponse: response,
  }
}

export async function getMercadoPagoPaymentDetails(paymentId: string | number) {
  const paymentApi = new Payment(getClient())
  return paymentApi.get({ id: paymentId })
}

export function toJsonSafe<T = any>(value: unknown): T {
  return JSON.parse(JSON.stringify(value ?? null))
}
