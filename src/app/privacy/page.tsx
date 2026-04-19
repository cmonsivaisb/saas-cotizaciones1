import { FileText } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
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
            <Link href="/terms">
              <button className="text-sm font-medium hover:text-primary transition-colors">
                Términos
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
              Política de Privacidad
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
              <h2 className="text-2xl font-semibold mb-4">1. Introducción</h2>
              <p className="text-muted-foreground leading-relaxed">
                En CotizaNet, nos comprometemos a proteger la privacidad y seguridad de la información personal que nos proporcionas. 
                Esta política de privacidad describe cómo recopilamos, utilizamos y protegemos tus datos cuando utilizas nuestros servicios.
              </p>
            </section>

            {/* Information Collection */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Recopilación de Información</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Solo recopilamos la información necesaria para proporcionarte nuestros servicios. Esta información incluye:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
                <li><strong>Información de cuenta:</strong> Nombre, correo electrónico y contraseña</li>
                <li><strong>Información de empresa:</strong> Nombre de la empresa, nombre de contacto, teléfono, ciudad y tipo de negocio</li>
                <li><strong>Información de uso:</strong> Datos de clientes, productos, cotizaciones, pedidos e inventario</li>
                <li><strong>Información de facturación:</strong> Datos de suscripción, facturas y pagos</li>
              </ul>
            </section>

            {/* Use of Information */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Uso de la Información</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Utilizamos tu información únicamente para:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
                <li>Proporcionar y mantener el servicio de CotizaNet</li>
                <li>Procesar pagos y gestionar suscripciones</li>
                <li>Mejorar nuestros servicios y desarrollar nuevas funcionalidades</li>
                <li>Comunicarnos contigo sobre actualizaciones y novedades</li>
                <li>Cumplir con obligaciones legales y fiscales</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong>Importante:</strong> No compartimos, vendemos ni alquilamos tu información a terceros. 
                Tus datos son utilizados exclusivamente para los fines descritos anteriormente.
              </p>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Seguridad de los Datos</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Implementamos medidas de seguridad robustas para proteger tu información:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
                <li><strong>Encriptación:</strong> Todos los datos sensibles se encriptan utilizando tecnología de nivel bancario</li>
                <li><strong>Acceso restringido:</strong> Solo el personal autorizado tiene acceso a tu información</li>
                <li><strong>Respaldo automático:</strong> Tus datos se respaldan regularmente para prevenir pérdida de información</li>
                <li><strong>Protección contra intrusiones:</strong> Utilizamos firewalls y sistemas de detección de intrusiones</li>
                <li><strong>Cumplimiento normativo:</strong> Cumplimos con todas las normativas de protección de datos en México</li>
              </ul>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Retención de Datos</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Conservamos tu información solo mientras sea necesario para los fines descritos en esta política:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
                <li><strong>Cuentas activas:</strong> Mientras mantengas tu cuenta activa</li>
                <li><strong>Información de facturación:</strong> Por un período de 7 años después de la cancelación de la cuenta</li>
                <li><strong>Información de uso:</strong> Mientras sea necesario para proporcionar el servicio</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Al finalizar el período de retención, eliminamos permanentemente la información de forma segura.
              </p>
            </section>

            {/* User Rights - ARCO */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Derechos ARCO del Usuario</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                De conformidad con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, 
                tienes los siguientes derechos ARCO sobre tu información personal:
              </p>
              <div className="space-y-4">
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <h3 className="font-semibold text-primary-900 mb-2">🔍 Acceso</h3>
                  <p className="text-primary-700">
                    Tienes derecho a conocer qué datos personales tenemos sobre ti y para qué los utilizamos. 
                    Puedes acceder a toda tu información personal en cualquier momento desde tu cuenta de usuario.
                  </p>
                </div>
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <h3 className="font-semibold text-primary-900 mb-2">✏️ Rectificación</h3>
                  <p className="text-primary-700">
                    Tienes derecho a solicitar la corrección de tu información personal cuando sea inexacta, 
                    incompleta o esté desactualizada. Puedes actualizar tus datos directamente desde tu cuenta 
                    o solicitarnos la rectificación.
                  </p>
                </div>
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <h3 className="font-semibold text-primary-900 mb-2">🗑️ Cancelación</h3>
                  <p className="text-primary-700">
                    Tienes derecho a solicitar la eliminación de tu cuenta y toda tu información personal 
                    cuando consideres que no es necesaria para los fines para los que fue recopilada, 
                    o cuando hayas terminado tu relación con nosotros.
                  </p>
                </div>
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <h3 className="font-semibold text-primary-900 mb-2">🚫 Oposición</h3>
                  <p className="text-primary-700">
                    Tienes derecho a oponerte al uso de tus datos personales para fines específicos. 
                    Tus datos solo se utilizarán para los fines expresamente autorizados por ti.
                  </p>
                </div>
              </div>
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-900 font-semibold mb-2">
                  ¿Cómo ejercer tus derechos ARCO?
                </p>
                <p className="text-yellow-800">
                  Para ejercer cualquiera de tus derechos ARCO, puedes:
                </p>
                <ul className="list-disc list-inside space-y-1 text-yellow-800 mt-2 ml-4">
                  <li>Enviar un correo electrónico a quickbotstudios@gmail.com</li>
                  <li>Incluir tu nombre completo y datos de contacto</li>
                  <li>Especificar claramente qué derecho deseas ejercer</li>
                  <li>Proporcionar documentación que acredite tu identidad (si es necesario)</li>
                </ul>
                <p className="text-yellow-800 mt-3">
                  Responderemos a tu solicitud en un plazo máximo de 20 días hábiles.
                </p>
              </div>
            </section>

            {/* Cancellation Policy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Política de Cancelación</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Puedes cancelar tu suscripción en cualquier momento sin penalizaciones ni costos adicionales:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
                <li>Desde tu panel de administración en la sección de facturación</li>
                <li>Enviando un correo electrónico a quickbotstudios@gmail.com</li>
                <li>La cancelación es efectiva de inmediato</li>
                <li>No hay devoluciones ni reembolsos por pagos ya realizados</li>
              </ul>
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mt-6">
                <p className="text-primary-900 font-semibold mb-2">
                  Importante sobre el período de prueba
                </p>
                <p className="text-primary-700">
                  El período de prueba de 15 días es para evaluar el servicio. 
                  Al finalizar este período, si decides no continuar, no hay devoluciones ni reembolsos. 
                  Si decides continuar, se iniciará automáticamente la suscripción de pago.
                </p>
              </div>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Cookies y Tecnologías Similares</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Utilizamos cookies y tecnologías similares para mejorar tu experiencia:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
                <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento básico del sitio</li>
                <li><strong>Cookies de rendimiento:</strong> Para analizar el rendimiento y mejorar el servicio</li>
                <li><strong>Cookies de funcionalidad:</strong> Para recordar tus preferencias</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar algunas funcionalidades del sitio.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Cambios en esta Política</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nos reservamos el derecho de modificar esta política de privacidad en cualquier momento. 
                Los cambios significativos serán notificados a través de:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
                <li>Correo electrónico a tu dirección registrada</li>
                <li>Aviso en tu panel de administración</li>
                <li>Publicación en nuestro sitio web</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                El uso continuado de nuestros servicios después de los cambios constituye tu aceptación de la política actualizada.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contacto</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos tu información, 
                contáctanos a través de:
              </p>
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                <div className="space-y-2">
                  <p className="text-primary-900">
                    <strong>Correo electrónico:</strong> quickbotstudios@gmail.com
                  </p>
                  <p className="text-primary-900">
                    <strong>Ubicación:</strong> Saltillo Coahuila Mexico
                  </p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="border-t border-primary-200 pt-8 mt-12">
              <p className="text-sm text-muted-foreground text-center">
                Esta política de privacidad está sujeta a nuestros{' '}
                <Link href="/terms" className="text-primary hover:underline">
                  Términos y Condiciones
                </Link>{' '}
                de uso.
                Al utilizar nuestros servicios, aceptas tanto esta política como nuestros términos.
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
