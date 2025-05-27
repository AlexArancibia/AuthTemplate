"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Calendar, Shield, Eye, Lock, Database, Users, Mail, Phone, AlertTriangle } from "lucide-react"
import { useMainStore } from "@/stores/mainStore"

export default function PoliticaDePrivacidadPage() {
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
                <Shield className="w-12 h-12 text-primary mr-4" />
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Política de Privacidad</h1>
              </div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {shopInfo?.name || "Nuestra empresa"} - Protección y tratamiento de datos personales
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
                <Eye className="w-6 h-6 text-primary mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">1. Introducción</h2>
              </div>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  En <strong>{shopInfo?.name || "nuestra empresa"}</strong>, respetamos tu privacidad y nos
                  comprometemos a proteger tus datos personales. Esta política de privacidad explica cómo recopilamos,
                  utilizamos, almacenamos y protegemos tu información personal.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Al utilizar nuestro sitio web y servicios, aceptas las prácticas descritas en esta política de
                  privacidad.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-blue-800 font-medium">Responsable del tratamiento:</p>
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

            {/* Información que recopilamos */}
            <section className="mb-12">
              <div className="flex items-center mb-6">
                <Database className="w-6 h-6 text-primary mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">2. Información que Recopilamos</h2>
              </div>
              <div className="prose prose-gray max-w-none">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">2.1 Información que nos proporcionas</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                  <li>
                    <strong>Datos de contacto:</strong> nombre, dirección de correo electrónico, número de teléfono
                  </li>
                  <li>
                    <strong>Información de facturación y envío:</strong> direcciones, información de pago
                  </li>
                  <li>
                    <strong>Información de cuenta:</strong> nombre de usuario, contraseña, preferencias
                  </li>
                  <li>
                    <strong>Comunicaciones:</strong> mensajes que nos envías a través de formularios de contacto
                  </li>
                  <li>
                    <strong>Información de pedidos:</strong> historial de compras, productos adquiridos
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-4">2.2 Información recopilada automáticamente</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                  <li>
                    <strong>Datos de navegación:</strong> páginas visitadas, tiempo de permanencia, clics
                  </li>
                  <li>
                    <strong>Información técnica:</strong> dirección IP, tipo de navegador, sistema operativo
                  </li>
                  <li>
                    <strong>Cookies y tecnologías similares:</strong> para mejorar la experiencia del usuario
                  </li>
                  <li>
                    <strong>Datos de dispositivo:</strong> identificadores únicos, configuración del dispositivo
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-4">2.3 Información de terceros</h3>
                <p className="text-gray-700 leading-relaxed">
                  Podemos recibir información sobre ti de terceros, como proveedores de servicios de pago, servicios de
                  análisis web, o redes sociales cuando interactúas con nuestro contenido.
                </p>
              </div>
            </section>

            {/* Cómo utilizamos tu información */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Cómo Utilizamos tu Información</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Utilizamos tu información personal para los siguientes propósitos:
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-4">3.1 Prestación de servicios</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                  <li>Procesar y gestionar tus pedidos</li>
                  <li>Proporcionar atención al cliente</li>
                  <li>Gestionar tu cuenta de usuario</li>
                  <li>Procesar pagos y prevenir fraudes</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-4">3.2 Comunicación</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                  <li>Enviar confirmaciones de pedidos y actualizaciones de envío</li>
                  <li>Responder a tus consultas y solicitudes</li>
                  <li>Enviar información sobre productos y servicios (con tu consentimiento)</li>
                  <li>Notificaciones importantes sobre cambios en nuestros servicios</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-4">3.3 Mejora de servicios</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                  <li>Analizar el uso del sitio web para mejorar la experiencia del usuario</li>
                  <li>Personalizar contenido y recomendaciones</li>
                  <li>Realizar investigaciones de mercado y análisis de tendencias</li>
                  <li>Desarrollar nuevos productos y servicios</li>
                </ul>
              </div>
            </section>

            {/* Base legal */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Base Legal para el Tratamiento</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Procesamos tus datos personales basándonos en las siguientes bases legales:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                  <li>
                    <strong>Ejecución de contrato:</strong> para procesar pedidos y proporcionar servicios
                  </li>
                  <li>
                    <strong>Consentimiento:</strong> para marketing directo y cookies no esenciales
                  </li>
                  <li>
                    <strong>Interés legítimo:</strong> para mejorar servicios, seguridad y prevención de fraudes
                  </li>
                  <li>
                    <strong>Obligación legal:</strong> para cumplir con requisitos fiscales y contables
                  </li>
                </ul>
              </div>
            </section>

            {/* Compartir información */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Compartir tu Información</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto en las siguientes
                  circunstancias:
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-4">5.1 Proveedores de servicios</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                  <li>Procesadores de pagos para transacciones seguras</li>
                  <li>Servicios de envío y logística</li>
                  <li>Proveedores de servicios de hosting y tecnología</li>
                  <li>Servicios de análisis web y marketing</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-4">5.2 Requisitos legales</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Podemos divulgar tu información cuando sea requerido por ley, orden judicial, o para proteger nuestros
                  derechos, propiedad o seguridad.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-4">5.3 Transferencias comerciales</h3>
                <p className="text-gray-700 leading-relaxed">
                  En caso de fusión, adquisición o venta de activos, tu información puede transferirse como parte de la
                  transacción.
                </p>
              </div>
            </section>

            {/* Seguridad */}
            <section className="mb-12">
              <div className="flex items-center mb-6">
                <Lock className="w-6 h-6 text-primary mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">6. Seguridad de los Datos</h2>
              </div>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger tu información
                  personal contra acceso no autorizado, alteración, divulgación o destrucción.
                </p>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Medidas de seguridad incluyen:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                  <li>Cifrado de datos en tránsito y en reposo</li>
                  <li>Controles de acceso y autenticación</li>
                  <li>Monitoreo regular de sistemas</li>
                  <li>Capacitación del personal en protección de datos</li>
                  <li>Evaluaciones regulares de seguridad</li>
                </ul>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
                  <p className="text-yellow-800 text-sm">
                    <strong>Importante:</strong> Ningún método de transmisión por internet o almacenamiento electrónico
                    es 100% seguro. Aunque nos esforzamos por proteger tu información, no podemos garantizar su
                    seguridad absoluta.
                  </p>
                </div>
              </div>
            </section>

            {/* Retención de datos */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Retención de Datos</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Conservamos tu información personal solo durante el tiempo necesario para cumplir con los propósitos
                  para los cuales fue recopilada, incluyendo:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                  <li>
                    <strong>Datos de cuenta:</strong> mientras mantengas una cuenta activa
                  </li>
                  <li>
                    <strong>Información de pedidos:</strong> según requisitos legales y fiscales (generalmente 7 años)
                  </li>
                  <li>
                    <strong>Datos de marketing:</strong> hasta que retires tu consentimiento
                  </li>
                  <li>
                    <strong>Datos de navegación:</strong> generalmente 2 años
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Después del período de retención, eliminaremos o anonimizaremos tu información personal de manera
                  segura.
                </p>
              </div>
            </section>

            {/* Tus derechos */}
            <section className="mb-12">
              <div className="flex items-center mb-6">
                <Users className="w-6 h-6 text-primary mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">8. Tus Derechos</h2>
              </div>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Tienes los siguientes derechos respecto a tu información personal:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                  <li>
                    <strong>Acceso:</strong> solicitar una copia de los datos que tenemos sobre ti
                  </li>
                  <li>
                    <strong>Rectificación:</strong> corregir datos inexactos o incompletos
                  </li>
                  <li>
                    <strong>Eliminación:</strong> solicitar la eliminación de tus datos personales
                  </li>
                  <li>
                    <strong>Limitación:</strong> restringir el procesamiento de tus datos
                  </li>
                  <li>
                    <strong>Portabilidad:</strong> recibir tus datos en un formato estructurado
                  </li>
                  <li>
                    <strong>Oposición:</strong> oponerte al procesamiento de tus datos
                  </li>
                  <li>
                    <strong>Retirar consentimiento:</strong> cuando el procesamiento se base en consentimiento
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Para ejercer estos derechos, contáctanos utilizando la información proporcionada al final de esta
                  política.
                </p>
              </div>
            </section>

            {/* Cookies */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Cookies y Tecnologías Similares</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestro sitio web:
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-4">Tipos de cookies que utilizamos:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                  <li>
                    <strong>Cookies esenciales:</strong> necesarias para el funcionamiento del sitio
                  </li>
                  <li>
                    <strong>Cookies de rendimiento:</strong> para analizar el uso del sitio
                  </li>
                  <li>
                    <strong>Cookies de funcionalidad:</strong> para recordar tus preferencias
                  </li>
                  <li>
                    <strong>Cookies de marketing:</strong> para personalizar anuncios (con tu consentimiento)
                  </li>
                </ul>

                <p className="text-gray-700 leading-relaxed">
                  Puedes controlar las cookies a través de la configuración de tu navegador. Ten en cuenta que
                  deshabilitar ciertas cookies puede afectar la funcionalidad del sitio.
                </p>
              </div>
            </section>

            {/* Menores de edad */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Menores de Edad</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente
                  información personal de menores de edad.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Si descubrimos que hemos recopilado información de un menor sin el consentimiento parental apropiado,
                  tomaremos medidas para eliminar esa información de nuestros sistemas.
                </p>
              </div>
            </section>

            {/* Cambios en la política */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Cambios en esta Política</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Podemos actualizar esta política de privacidad ocasionalmente para reflejar cambios en nuestras
                  prácticas o por razones legales, operativas o regulatorias.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Te notificaremos sobre cambios significativos por correo electrónico o mediante un aviso prominente en
                  nuestro sitio web. Te recomendamos revisar esta política periódicamente.
                </p>
              </div>
            </section>

            {/* Contacto */}
            <section className="border-t border-gray-200 pt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-primary" />
                  Contacto para Asuntos de Privacidad
                </h2>
                <p className="text-gray-700 mb-4">
                  Si tienes preguntas sobre esta política de privacidad o quieres ejercer tus derechos, puedes
                  contactarnos:
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

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 text-sm">
                    <strong>Tiempo de respuesta:</strong> Nos comprometemos a responder a tus solicitudes relacionadas
                    con privacidad dentro de 30 días calendario.
                  </p>
                </div>
              </div>
            </section>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
