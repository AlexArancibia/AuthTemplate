"use client"

import { Button } from "@/components/ui/button"

export function PublishBanner() {
  const handleWhatsAppClick = () => {
    const whatsappUrl =
      "https://api.whatsapp.com/send/?phone=%2B51986607951&text&type=phone_number&app_absent=0"
    window.open(whatsappUrl, "_blank")
  }

  return (
    <section className="w-full flex flex-col items-center justify-center py-0 bg-transparent">
      <div className="container-section px-0">
        {/* Sobrescribimos max-width y centrado */}
        <div className="content-section max-w-none mx-0 w-full">
          {/* Banner con fondo en el div */}
          <div
            className="relative w-full overflow-hidden bg-cover bg-center rounded-2xl mb-16"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(17, 24, 39, 0.8), rgba(88, 28, 135, 0.5), rgba(30, 64, 175, 0.6)),
                url('/gradient-4k.webp')
              `,
              backgroundPosition: "center 35%",
              minHeight: "280px",
            }}
          >
            <div className="relative z-10 p-4 sm:p-6 md:p-10 lg:p-16 flex flex-col justify-center h-full w-full lg:w-1/2">
              <h2
                className="font-druk font-extrabold text-white mb-4 sm:mb-6 uppercase tracking-wider text-[clamp(2rem,4vw,3.5rem)]"
              >
                DESCUBRE EL EQUIPO PERFECTO PARA TI
              </h2>

              <p
                className="font-light text-gray-200 mb-6 sm:mb-8 max-w-md text-sm sm:text-base md:text-lg"
              >
                ¿No sabes qué elegir? Contáctanos para recibir recomendaciones personalizadas. ¡Estamos aquí para ayudarte!
              </p>

              <Button
                onClick={handleWhatsAppClick}
                aria-label="Contactar un asesor por WhatsApp"
                className="bg-white text-neutral-800 hover:bg-white hover:text-neutral-800 px-4 py-3 sm:px-7 sm:py-5 rounded-xl text-xs font-light uppercase tracking-[0.2em] shadow-[0_0_10px_rgba(0,0,0,0.05)] hover:shadow-[0_0_12px_rgba(0,0,0,0.08)] transition-all duration-300 transform hover:scale-105 w-fit"
              >
                CONTACTA UN ASESOR ➚
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
