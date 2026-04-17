import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Calendar, CheckCircle2, ArrowRight } from "lucide-react"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">CotizaNet</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <a href="/">Inicio</a>
            </Button>
            <Button size="sm" asChild>
              <a href="/register">Comenzar gratis</a>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">
              Solicita una demo personalizada
            </h1>
            <p className="text-muted-foreground text-lg">
              Descubre cómo CotizaNet puede transformar la gestión de tu negocio
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Agenda tu demo</CardTitle>
              <CardDescription>
                Completa el formulario y nos pondremos en contacto contigo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      placeholder="Juan Pérez"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="juan@empresa.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+52 55 1234 5678"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      placeholder="Taller Industrial Pérez"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Tipo de negocio</Label>
                  <select
                    id="businessType"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    required
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="Taller">Taller</option>
                    <option value="Distribuidor">Distribuidor</option>
                    <option value="Maquinado">Maquinado</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Servicios técnicos">Servicios técnicos</option>
                    <option value="Proveedor industrial">Proveedor industrial</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employees">Número de empleados</Label>
                  <select
                    id="employees"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    required
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="1-5">1-5 empleados</option>
                    <option value="6-10">6-10 empleados</option>
                    <option value="11-25">11-25 empleados</option>
                    <option value="26-50">26-50 empleados</option>
                    <option value="51+">Más de 50 empleados</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">¿Qué te gustaría ver en la demo?</Label>
                  <textarea
                    id="message"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    placeholder="Cuéntanos sobre tus necesidades específicas..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredDate">Fecha preferida</Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredTime">Horario preferido</Label>
                  <select
                    id="preferredTime"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    required
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="9:00-10:00">9:00 - 10:00</option>
                    <option value="10:00-11:00">10:00 - 11:00</option>
                    <option value="11:00-12:00">11:00 - 12:00</option>
                    <option value="12:00-13:00">12:00 - 13:00</option>
                    <option value="13:00-14:00">13:00 - 14:00</option>
                    <option value="14:00-15:00">14:00 - 15:00</option>
                    <option value="15:00-16:00">15:00 - 16:00</option>
                    <option value="16:00-17:00">16:00 - 17:00</option>
                    <option value="17:00-18:00">17:00 - 18:00</option>
                  </select>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Solicitar demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* What to expect */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center">
              ¿Qué esperar de la demo?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">30 minutos</h3>
                <p className="text-sm text-muted-foreground">
                  Demo personalizada según tus necesidades
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Sin compromiso</h3>
                <p className="text-sm text-muted-foreground">
                  Sin presión de venta, solo información
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Preguntas y respuestas</h3>
                <p className="text-sm text-muted-foreground">
                  Resolvemos todas tus dudas en vivo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
