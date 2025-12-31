"use client"

import { useState, useEffect } from "react"
import { Play } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useMainStore } from "@/stores/mainStore"

export function VideoPromotionSection() {
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const { shopSettings } = useMainStore()
  const [phoneNumber, setPhoneNumber] = useState("")

  useEffect(() => {
    if (shopSettings && shopSettings.length > 0 && shopSettings[0].phone) {
      const cleanedNumber = shopSettings[0].phone.replace(/\s+/g, "").replace(/[^\d+]/g, "")
      setPhoneNumber(cleanedNumber)
    }
  }, [shopSettings])

  const handleWhatsAppClick = () => {
    if (phoneNumber) {
      const message = encodeURIComponent("Hola! Me interesa conocer más sobre el servicio de pegado gratis.")
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
      window.open(whatsappUrl, "_blank")
    }
  }

  return (
    <section className="relative w-full overflow-hidden mt-8 mb-12">
      {/* Background Image - Full Width */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/CTAS.jpg')",
        }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 py-20 md:py-28 lg:py-36">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Column - Play Button */}
          <div className="flex justify-center overflow-visible">
            <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
              <DialogTrigger asChild>
                <button
                  className="relative group focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-transparent"
                  aria-label="Reproducir video"
                  style={{ overflow: 'visible' }}
                >
                  {/* Expanding Glow Rings */}
                  <div className="absolute inset-0 flex items-center justify-center" style={{ overflow: 'visible' }}>
                    <div className="glow-ring glow-ring-1 absolute w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-pink-500/60 blur-md" style={{ transformOrigin: 'center' }} />
                    <div className="glow-ring glow-ring-2 absolute w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-pink-500/50 blur-lg" style={{ transformOrigin: 'center' }} />
                    <div className="glow-ring glow-ring-3 absolute w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-pink-500/40 blur-xl" style={{ transformOrigin: 'center' }} />
                    <div className="glow-ring glow-ring-4 absolute w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-pink-500/30 blur-2xl" style={{ transformOrigin: 'center' }} />
                  </div>
                  
                  {/* Outer Ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-pink-500/50 group-hover:border-pink-500/70 transition-all duration-300 z-20" />
                  
                  {/* Play Button */}
                  <div className="relative w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-white/90 group-hover:bg-white transition-all duration-300 flex items-center justify-center shadow-lg group-hover:scale-110 transform z-30">
                    <Play className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-pink-500 ml-1" fill="currentColor" />
                  </div>
                </button>
              </DialogTrigger>
              
              <DialogContent className="max-w-5xl w-[95vw] p-0 bg-black border-none">
                <DialogTitle className="sr-only">Reproducir video promocional</DialogTitle>
                <div className="relative w-full aspect-video bg-black">
                  <video
                    src="/video.mp4"
                    controls
                    autoPlay
                    className="w-full h-full"
                    onEnded={() => setIsVideoOpen(false)}
                  >
                    Tu navegador no soporta el elemento de video.
                  </video>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Right Column - Text Content */}
          <div className="text-center md:text-right text-white">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
              Pegado Gratis
            </h2>
            <p className="text-sm md:text-base lg:text-base mb-6 md:mb-8 leading-relaxed opacity-70">
              Al comprar productos de madera y jebe, disfruta de nuestro servicio de{" "}
              <span className="font-semibold">pegado completamente gratis</span>. 
              Mejora el rendimiento de tu equipo con nuestro servicio profesional de pegado, 
              sin costo adicional en tu compra.
            </p>
            <Button 
              variant="outline" 
              className="border-2 border-white text-white bg-transparent hover:bg-white/20 hover:text-white hover:border-white backdrop-blur-sm"
              onClick={handleWhatsAppClick}
              disabled={!phoneNumber}
            >
              Comunícate con nosotros
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

