"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Calendar, FileText, Users, AlertTriangle, Mail, Phone } from "lucide-react"
import { useMainStore } from "@/stores/mainStore"

export default function TerminosYCondicionesPage() {
  const { shopSettings } = useMainStore()
  const shopInfo = shopSettings?.[0]

  const currentDate = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
     

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="flex items-center justify-center mb-4">
                <FileText className="w-12 h-12 text-primary mr-4" />
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Términos y Condiciones</h1>
              </div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {shopInfo?.name || "Nuestra empresa"} - Condiciones de uso y servicio
              </p>
              <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                Última actualización: {currentDate}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-8 md:p-12"
          >
            {/* Introducción */}
            <section className="mb-12">
              <div className="flex items-center mb-6">
                <Users className="w-6 h-6 text-primary mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">1. Introducción</h2>
              </div>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Bienvenido a <strong>{shopInfo?.name || "nuestra tienda online"}</strong>. Estos términos y
                  condiciones describen las reglas y regulaciones para el uso de nuestro sitio web y servicios.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Al acceder y utilizar este sitio web, aceptas cumplir con estos términos y condiciones. Si no estás de
                  acuerdo con alguna parte de estos términos, no debes utilizar nuestro sitio web.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-blue-800 font-medium">Información de contacto:</p>
                      <p className="text-blue-700 text-sm mt-1">
                        <strong>Empresa:</strong> {shopInfo?.name || "Nombre de la empresa"}
                        <br />
                        {shopInfo?.email && (
                          <>
                            <strong>Email:</strong> {shopInfo.email}
                            <br />
                          </>
                        )}
                        {shopInfo?.phone && (
                          <>
                            <strong>Teléfono:</strong> {shopInfo.phone}
                            <br />
                          </>
                        )}
                        {(shopInfo?.address1 || shopInfo?.city) && (
                          <>
                            <strong>Dirección:</strong>{" "}
                            {[shopInfo?.address1, shopInfo?.city, shopInfo?.country].filter(Boolean).join(", ")}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Uso del sitio web */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Uso del Sitio Web</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">Al utilizar nuestro sitio web, te comprometes a:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                  <li>Proporcionar información veraz y actualizada</li>
                  <li>No utilizar el sitio para actividades ilegales o no autorizadas</li>
                  <li>No interferir con el funcionamiento del sitio web</li>
                  <li>Respetar los derechos de propiedad intelectual</li>
                  <li>No transmitir virus, malware o código malicioso</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Nos reservamos el derecho de suspender o terminar tu acceso al sitio web si violas estos términos.
                </p>
              </div>
            </section>

            {/* Productos y servicios */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Productos y Servicios</h2>
              <div className="prose prose-gray max-w-none">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">3.1 Disponibilidad</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Los productos y servicios mostrados en nuestro sitio web están sujetos a disponibilidad. Nos
                  reservamos el derecho de modificar o discontinuar productos sin previo aviso.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-4">3.2 Precios</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Todos los precios están expresados en {shopInfo?.defaultCurrency?.code || "la moneda local"} e
                  incluyen
                  {shopInfo?.taxesIncluded ? " los impuestos aplicables" : " impuestos cuando corresponda"}. Los precios
                  pueden cambiar sin previo aviso.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-4">3.3 Descripciones</h3>
                <p className="text-gray-700 leading-relaxed">
                  Hacemos nuestro mejor esfuerzo para describir con precisión nuestros productos. Sin embargo, no
                  garantizamos que las descripciones sean completamente exactas, completas o libres de errores.
                </p>
              </div>
            </section>

            {/* Pedidos y pagos */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Pedidos y Pagos</h2>
              <div className="prose prose-gray max-w-none">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">4.1 Proceso de pedido</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Al realizar un pedido, recibirás una confirmación por correo electrónico. Esta confirmación no
                  constituye la aceptación de tu pedido, sino únicamente el reconocimiento de que lo hemos recibido.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-4">4.2 Métodos de pago</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Aceptamos los métodos de pago mostrados durante el proceso de checkout. Todos los pagos deben
                  completarse antes del envío de los productos.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-4">4.3 Cancelaciones</h3>
                <p className="text-gray-700 leading-relaxed">
                  Nos reservamos el derecho de cancelar pedidos por razones que incluyen, pero no se limitan a: falta de
                  disponibilidad del producto, errores en el precio o información del producto, o problemas con el pago.
                </p>
              </div>
            </section>

            {/* Envíos y entregas */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Envíos y Entregas</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Los tiempos de entrega son estimados y pueden variar según la ubicación y disponibilidad del producto.
                  No somos responsables por retrasos causados por circunstancias fuera de nuestro control.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  El riesgo de pérdida o daño de los productos se transfiere al comprador una vez que los productos son
                  entregados al transportista.
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
                  <p className="text-yellow-800 text-sm">
                    <strong>Importante:</strong> Es responsabilidad del comprador proporcionar una dirección de entrega
                    correcta y estar disponible para recibir el envío.
                  </p>
                </div>
              </div>
            </section>

            {/* Devoluciones y reembolsos */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Devoluciones y Reembolsos</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Aceptamos devoluciones dentro de los 30 días posteriores a la entrega, siempre que los productos estén
                  en su estado original y sin usar.
                </p>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Condiciones para devoluciones:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                  <li>El producto debe estar en su embalaje original</li>
                  <li>Debe incluir todos los accesorios y documentación</li>
                  <li>No debe mostrar signos de uso o daño</li>
                  <li>Algunos productos pueden estar excluidos de devoluciones</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Los gastos de envío para devoluciones corren por cuenta del comprador, a menos que el producto esté
                  defectuoso o hayamos cometido un error.
                </p>
              </div>
            </section>

            {/* Limitación de responsabilidad */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Limitación de Responsabilidad</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  En la máxima medida permitida por la ley, {shopInfo?.name || "nuestra empresa"}
                  no será responsable por daños indirectos, incidentales, especiales o consecuentes que resulten del uso
                  de nuestros productos o servicios.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Nuestra responsabilidad total no excederá el monto pagado por el producto o servicio específico que
                  dio lugar al reclamo.
                </p>
              </div>
            </section>

            {/* Propiedad intelectual */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Propiedad Intelectual</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Todo el contenido de este sitio web, incluyendo textos, gráficos, logos, imágenes y software, es
                  propiedad de {shopInfo?.name || "nuestra empresa"}o de nuestros proveedores de contenido y está
                  protegido por las leyes de derechos de autor y propiedad intelectual.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  No puedes reproducir, distribuir, modificar o crear trabajos derivados de nuestro contenido sin
                  nuestro consentimiento expreso por escrito.
                </p>
              </div>
            </section>

            {/* Modificaciones */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Modificaciones</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Las
                  modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Es tu responsabilidad revisar periódicamente estos términos. El uso continuado del sitio web después
                  de las modificaciones constituye la aceptación de los nuevos términos.
                </p>
              </div>
            </section>

            {/* Ley aplicable */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Ley Aplicable</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  Estos términos y condiciones se rigen por las leyes de {shopInfo?.country || "Perú"}y cualquier
                  disputa será resuelta en los tribunales competentes de {shopInfo?.city || "Lima"}.
                </p>
              </div>
            </section>

            {/* Contacto */}
            <section className="border-t border-gray-200 pt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-primary" />
                  Contacto
                </h2>
                <p className="text-gray-700 mb-4">
                  Si tienes preguntas sobre estos términos y condiciones, puedes contactarnos:
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  {shopInfo?.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      <a href={`mailto:${shopInfo.email}`} className="text-primary hover:underline">
                        {shopInfo.email}
                      </a>
                    </div>
                  )}
                  {shopInfo?.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      <a href={`tel:${shopInfo.phone}`} className="text-primary hover:underline">
                        {shopInfo.phone}
                      </a>
                    </div>
                  )}
                  <div className="mt-4">
                    <Link
                      href="/contacto"
                      className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                    >
                      Ir al formulario de contacto
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
