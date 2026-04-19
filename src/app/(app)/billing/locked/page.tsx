import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Lock, 
  AlertTriangle, 
  CreditCard, 
  ArrowRight,
  FileText,
  Calendar
} from "lucide-react"
import Link from "next/link"

async function getBillingData() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  if (!session) {
    redirect('/login')
  }

  try {
    const sessionData = JSON.parse(session)
    const { companyId } = sessionData

    // Get company with subscription and plan
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        subscription: {
          include: {
            plan: true,
            invoices: {
              where: { status: 'pending' },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    })

    if (!company) {
      redirect('/login')
    }

    return {
      company: {
        id: company.id,
        name: company.name,
      },
      subscription: company.subscription,
      pendingInvoice: company.subscription?.invoices[0] || null,
    }
  } catch (error) {
    console.error('Error fetching billing data:', error)
    redirect('/login')
  }
}

export default async function BillingLockedPage() {
  const data = await getBillingData()

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Locked Card */}
        <Card className="border-danger-200 bg-danger-50/50">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="h-16 w-16 bg-danger-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Lock className="h-8 w-8 text-danger-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-danger-900 mb-2">
                  Cuenta suspendida
                </h1>
                <p className="text-lg text-danger-700">
                  Tu cuenta ha sido suspendida por falta de pago. 
                  Para reactivar tu cuenta y continuar usando CotizaNet, 
                  por favor paga la factura pendiente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Invoice */}
        {data.pendingInvoice && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Factura pendiente
              </CardTitle>
              <CardDescription>
                Paga esta factura para reactivar tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                <div>
                  <p className="font-semibold text-primary-900">
                    {data.pendingInvoice.concept}
                  </p>
                  <p className="text-sm text-primary-500">
                    Vencimiento: {new Date(data.pendingInvoice.dueAt).toLocaleDateString('es-MX')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-900">
                    ${data.pendingInvoice.amountMxn.toLocaleString('es-MX')} MXN
                  </p>
                </div>
              </div>

              <Button className="w-full gap-2" size="lg" asChild>
                <Link href="/billing">
                  <CreditCard className="h-5 w-5" />
                  Pagar factura ahora
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Plan Info */}
        {data.subscription && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Tu plan actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-primary-900">
                    {data.subscription.plan.name}
                  </p>
                  <p className="text-sm text-primary-500">
                    ${data.subscription.plan.priceMxn.toLocaleString('es-MX')} MXN/mes
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/settings">
                    Cambiar plan
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-primary-700" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-900 mb-1">
                  ¿Necesitas ayuda?
                </h3>
                <p className="text-sm text-primary-600">
                  Si tienes problemas con el pago o preguntas sobre tu cuenta, 
                  contáctanos a{' '}
                  <a href="mailto:quickbotstudios@gmail.com" className="text-action-600 hover:underline">
                    quickbotstudios@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <div className="text-center">
          <Button variant="ghost" asChild>
            <Link href="/api/auth/logout">
              Cerrar sesión
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
