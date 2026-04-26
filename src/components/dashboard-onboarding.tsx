"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertTriangle, CheckCircle, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const STORAGE_KEY = "cotizanet-dashboard-onboarding-hidden"

export function DashboardOnboarding({
  clientsCount,
  quotesCount,
  ordersCount,
}: {
  clientsCount: number
  quotesCount: number
  ordersCount: number
}) {
  const [isHidden, setIsHidden] = useState(true)

  useEffect(() => {
    setIsHidden(localStorage.getItem(STORAGE_KEY) === "true")
  }, [])

  const hideOnboarding = () => {
    localStorage.setItem(STORAGE_KEY, "true")
    setIsHidden(true)
  }

  if (isHidden) {
    return null
  }

  const steps = [
    {
      title: "Agrega tu primer cliente",
      description: "Registra nombre, telefono y correo para cotizar sin repetir datos.",
      href: "/clients/new",
      done: clientsCount > 0,
    },
    {
      title: "Crea una cotizacion",
      description: "Arma una propuesta clara con productos, cantidades y total.",
      href: "/quotes/new",
      done: quotesCount > 0,
    },
    {
      title: "Convierte venta en pedido",
      description: "Da seguimiento al trabajo confirmado hasta entrega y cobranza.",
      href: "/orders/new",
      done: ordersCount > 0,
    },
    {
      title: "Revisa tus reportes",
      description: "Consulta ventas, cuentas por cobrar y stock bajo.",
      href: "/reports",
      done: ordersCount > 0,
    },
  ]
  const completedSteps = steps.filter((step) => step.done).length

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>Primeros pasos</CardTitle>
            <CardDescription>
              Guia simple para dejar el sistema listo. Puedes cerrar esta ayuda cuando ya no la necesites.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={completedSteps === steps.length ? "success" : "info"}>
              {completedSteps} de {steps.length} completados
            </Badge>
            <Button type="button" variant="ghost" size="icon" onClick={hideOnboarding} aria-label="Ocultar primeros pasos">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <Link
              key={step.title}
              href={step.href}
              className="rounded-lg border border-primary-200 bg-primary-50 p-4 transition-colors hover:border-action-300 hover:bg-action-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-600"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white font-bold text-primary-700">
                  {step.done ? <CheckCircle className="h-5 w-5 text-success-600" /> : index + 1}
                </div>
                {!step.done && <AlertTriangle className="h-4 w-4 text-warning-600" />}
              </div>
              <p className="font-semibold text-primary-900">{step.title}</p>
              <p className="mt-1 text-sm text-primary-500">{step.description}</p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
