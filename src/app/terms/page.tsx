import { FileText } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
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
            <Link href="/">
              <button className="text-sm font-medium hover:text-primary transition-colors">
                Inicio
              </button>
            </Link>
            <Link href="/pricing">
              <button className="text-sm font-medium hover:text-primary transition-colors">
                Precios
              </button>
            </Link>
            <Link href="/contact">
              <button className="text-sm font-medium hover:text-primary transition-colors">
                Contacto
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Términos y Condiciones
            </h1>
            <p className="text-xl text-muted-foreground">
              Última actualización: {new Date().toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Aceptación de Términos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Al acceder y utilizar CotizaNet, aceptas estar sujeto a estos términos y condiciones, 
                así como a nuestra política de privacidad. Si no estás de acuerdo con alguno de estos términos, 
                por favor no utilices nuestros servicios.
              </p>
            </section>

            {/* Service Description */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Descripción del Servicio</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                CotizaNet es una plataforma de gestión de cotizaciones, clientes, inventario y pedidos 
                diseñada para empresas. El servicio incluye:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
                <li>Gestión de clientes y contactos</li>
                <li>Creación y envío de cotizaciones</li>
                <li>Control de inventario</li>
                <li>Gestión de pedidos y facturación</li>
                <li>Panel de administración con estadísticas</li>
                <li>Soporte técnico por correo electrónico</li>
              </ul>
            </section>

            {/* Trial Period */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Período de Prueba</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Ofrecemos un período de prueba gratuito de 15 días para que evalúes nuestro servicio:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
                <li>El período de prueba comienza en el momento de registro</li>
                <li>Tienes acceso completo a todas las funcionalidades durante la prueba</li>
                <li>No se requiere tarjeta de crédito para iniciar la prueba</li>
                <li>Al finalizar los 15 días, debes suscribirte para continuar usando el servicio</li>
              </ul>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                <p className="text-yellow-900 font-semibold mb-2">
                  Importante sobre el período de prueba
                </p>
                <p className="text-yellow-800">
                  El período de prueba de 15 días es exclusivamente para evaluar el servicio. 
                  No hay devoluciones ni reembolsos por pagos realizados después de finalizar el período de prueba.
                </p>
              </div>
            </section>

            {/* Subscription and Payment */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Suscripción y Pagos</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Después del período de prueba, se requiere una suscripción de pago para continuar utilizando el servicio:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
                <li>Los planes de suscripción se pagan mensualmente</li>
                <li>Los precios están sujetos a cambios con 30 días de anticipación</li>
                <li>Los pagos se procesan a través de MercadoPago</li>
                <li>La suscripción se renueva automáticamente cada mes</li>
                <li>Es tu responsabilidad mantener actualizada tu información de pago</li>
              </ul>
            </section>

            {/* Cancellation Policy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Política de Cancelación</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Puedes cancelar tu suscripción en cualquier momento sin penalizaciones ni costos adicionales:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
                <li>La cancelación se puede realizar desde tu panel de administración</li>
                <li>También puedes solicitar la cancelación por correo electrónico a quickbotstudios@gmail.com</li>
                <li>La cancelación es efectiva de inmediato</li>
                <li>Después de cancelar, tendrás acceso hasta el final del período de facturación actual</li>
              </ul>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-6">
                <p className="text-red-900 font-semibold mb-2">
                  Política de No Reembolso
                </p>
                <p className="text-red-800 mb-3">
                  <strong>No hay devoluciones ni reembolsos por pagos ya realizados.</strong>
                </p>
                <p className="text-red-800">
                  Esto incluye:
                </p>
                <ul className="list-disc list-inside space-y-1 text-red-800 mt-2 ml-4">
                  <li>Pagos mensuales ya procesados</li>
                  <li>Períodos de suscripción ya iniciados</li>
                  <li>Uso del servicio durante el período de facturación</li>
                </ul>
                <p className="text-red-800 mt-3">
                  Recomendamos evaluar completamente el servicio durante el período de prueba de 15 días 
                  antes de realizar cualquier pago.
                </p>
              </div>
            </section>

            {/* User Responsibilities */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Responsabilidades del Usuario</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Como usuario de CotizaNet, te comprometes a:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
                <li>Proporcionar información veraz y actualizada</li>
                <li>Mantener la confidencialidad de tu contraseña</li>
                <li>No compartir tu cuenta con terceros</li>
                <li>Utilizar el servicio de manera legal y ética</li>
                <li>No intentar acceder a cuentas o datos de otros usuarios</li>
                <li>No utilizar el servicio para actividades fraudulentas o ilegales</li>
              </ul>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Seguridad de los Datos</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nos comprometemos a proteger la seguridad de tus datos:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
                <li>Todos los datos se encriptan utilizando tecnología de nivel bancario</li>
                <li>Implementamos medidas de seguridad robustas para proteger tu información</li>
                <li>Cumplimos con la Ley Federal de Protección de Datos Personales en México</li>
                <li>Tus datos solo se utilizan para proporcionarte el servicio</li>
                <li>No compartimos, vendemos ni alquilamos tu información a terceros</li>
              </ul>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
                <p className="text-green-900 font-semibold mb-2">
                  Tus datos están seguros con nosotros
                </p>
                <p className="text-green-800">
                  Implementamos las mejores prácticas de seguridad para garantizar que tu información 
                  esté protegida. Tus datos personales y de negocio son utilizados exclusivamente para 
                  proporcionarte el servicio de CotizaNet.
                </p>
              </div>
            </section>

            {/* Service Availability */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Disponibilidad del Servicio</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nos esforzamos por mantener el servicio disponible 24/7, pero no garantizamos:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
                <li>Disponibilidad ininterrumpida del servicio</li>
                <li>Que el servicio esté libre de errores o defectos</li>
                <li>Que los errores serán corregidos inmediatamente</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Nos reservamos el derecho de realizar mantenimiento programado que pueda afectar 
                temporalmente la disponibilidad del servicio.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Limitación de Responsabilidad</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                En la máxima medida permitida por la ley:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
                <li>No somos responsables por daños indirectos, incidentales o consecuentes</li>
                <li>Nuestra responsabilidad total se limita al monto pagado por el servicio en los últimos 12 meses</li>
                <li>No somos responsables por pérdidas de datos, aunque implementamos medidas de seguridad</li>
                <li>No garantizamos resultados específicos del uso del servicio</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Propiedad Intelectual</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Todo el contenido, diseño y funcionalidad de CotizaNet es propiedad exclusiva de QuickBot Studios:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
                <li>El software, código fuente y diseño están protegidos por derechos de autor</li>
                <li>No puedes copiar, modificar o distribuir el servicio sin autorización</li>
                <li>Los datos que ingresas siguen siendo tu propiedad</li>
                <li>Las marcas registradas y logotipos son propiedad de QuickBot Studios</li>
              </ul>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Cambios en los Términos</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
                <li>Los cambios significativos serán notificados con 30 días de anticipación</li>
                <li>La notificación se enviará por correo electrónico</li>
                <li>El uso continuado del servicio después de los cambios constituye aceptación</li>
              </ul>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Terminación</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nos reservamos el derecho de suspender o terminar tu cuenta si:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
                <li>Violas estos términos y condiciones</li>
                <li>Utilizas el servicio para actividades ilegales</li>
                <li>No pagas las suscripciones correspondientes</li>
                <li>Comprometes la seguridad del servicio o de otros usuarios</li>
              </ul>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Ley Aplicable y Jurisdicción</h2>
              <p className="text-muted-foreground leading-relaxed">
                Estos términos y condiciones se rigen por las leyes de los Estados Unidos Mexicanos. 
                Cualquier disputa será resuelta en los tribunales de Saltillo, Coahuila, México.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Contacto</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Si tienes preguntas sobre estos términos y condiciones, contáctanos a través de:
              </p>
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                <div className="space-y-2">
                  <p className="text-primary-900">
                    <strong>Correo electrónico:</strong> quickbotstudios@gmail.com
                  </p>
                  <p className="text-primary-900">
                    <strong>Ubicación:</strong> Saltillo, Coahuila, México
                  </p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="border-t border-primary-200 pt-8 mt-12">
              <p className="text-sm text-muted-foreground text-center">
                Estos términos y condiciones constituyen un acuerdo legal entre tú y CotizaNet. 
                Al utilizar nuestros servicios, aceptas estar sujeto a estos términos.
              </p>
              <p className="text-sm text-muted-foreground text-center mt-4">
                Para más información sobre cómo protegemos tus datos, consulta nuestra{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Política de Privacidad
                </Link>.
              </p>
              <p className="text-sm text-muted-foreground text-center mt-4">
                © {new Date().getFullYear()} CotizaNet. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
