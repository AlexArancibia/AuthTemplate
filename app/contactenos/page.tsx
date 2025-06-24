"use client"

import { motion } from "framer-motion"
import { ContactForm } from "./_components/contact-form"
 

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
}

export default function ContactPage() {
  return (
    <main className=" ">

      <ContactForm />

      {/* <motion.section className="py-16 " variants={containerVariants} initial="hidden" animate="visible">
        <div className="container-section">
          <div className="content-section">
            <motion.h2 variants={itemVariants} className="text-3xl font-bold text-center mb-8">
              Preguntas Frecuentes
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div variants={itemVariants}>
                <h3 className="text-xl font-semibold mb-2">¿Cuáles son los tiempos de entrega?</h3>
                <p className="text-gray-600">
                  Nuestros tiempos de entrega varían según la ubicación y el producto. Generalmente, entregamos en Lima
                  Metropolitana en 24-48 horas y a nivel nacional en 3-5 días hábiles.
                </p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <h3 className="text-xl font-semibold mb-2">¿Ofrecen muestras de productos?</h3>
                <p className="text-gray-600">
                  Sí, ofrecemos muestras de nuestros productos para clientes potenciales. Contáctanos para solicitar
                  muestras y discutir tus necesidades específicas.
                </p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <h3 className="text-xl font-semibold mb-2">¿Tienen un programa de fidelización?</h3>
                <p className="text-gray-600">
                  Sí, contamos con un programa de fidelización para nuestros clientes frecuentes. Pregunta por nuestros
                  descuentos y beneficios especiales.
                </p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <h3 className="text-xl font-semibold mb-2">¿Ofrecen capacitación sobre el uso de sus productos?</h3>
                <p className="text-gray-600">
                  Absolutamente. Ofrecemos sesiones de capacitación gratuitas para asegurar que nuestros clientes
                  utilicen nuestros productos de manera efectiva y segura.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section> */}
    </main>
  )
}

