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
              minHeight: "360px",
            }}
          >
            <div className="relative z-10 p-6 sm:p-10 md:p-16 flex flex-col justify-center h-full w-full md:w-1/2">
              <h2
                className="font-adi-bold  text-white mb-4 sm:mb-6 uppercase tracking-wider font-black text-[clamp(2rem,4vw,3.5rem)]"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                DESCUBRE EL EQUIPO PERFECTO PARA TI
              </h2>

              <p
                className="font-lato-thin  text-gray-200 mb-6 sm:mb-8 max-w-md font-normal text-base sm:text-lg md:text-xl"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                ¿No sabes qué elegir? Contáctanos para recibir recomendaciones personalizadas. ¡Estamos aquí para ayudarte!
              </p>

              <Button
                onClick={handleWhatsAppClick}
                aria-label="Contactar un asesor por WhatsApp"
                className="font-lato-thin  bg-white text-gray-900 hover:bg-gray-100 px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 w-fit"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
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
