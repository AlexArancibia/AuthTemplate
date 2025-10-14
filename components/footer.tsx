"use client"

import type React from "react"
import Link from "next/link"
import { Mail, Phone, Facebook, Instagram, Twitter, Youtube } from "lucide-react"
import { useMainStore } from "@/stores/mainStore"

export function Footer() {
  const { shopSettings } = useMainStore()
  const shopInfo = shopSettings?.[0]

  // Obtener información de contacto desde shopSettings
  const getShopDescription = () => {
    return shopInfo?.description || 
           "Bienvenido a Sportt Peru, tu tienda virtual de tenis de mesa. Encuentra la mejor calidad y estilo para alcanzar tus objetivos."
  }

  const getShopEmail = () => {
    return shopInfo?.email || shopInfo?.supportEmail || "sporttperu@gmail.com"
  }

  const getShopPhone = () => {
    return shopInfo?.phone || shopInfo?.supportPhone || "+51 907 947 399"
  }

  // Redes sociales - Solo mostrar si tienen URL configurada
  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: shopInfo?.facebookUrl },
    { name: "Instagram", icon: Instagram, href: shopInfo?.instagramUrl },
    { name: "Twitter", icon: Twitter, href: shopInfo?.twitterUrl },
    { name: "YouTube", icon: Youtube, href: shopInfo?.youtubeUrl },
  ].filter(social => social.href) // Solo mostrar si tienen URL

  return (
    <footer className="bg-black text-white pt-12 pb-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Logo and Contact */}
          <div className="space-y-4">
            <Link className="flex items-center" href="/">
              <img 
                alt="SPORTT" 
                width="200" 
                height="50" 
                className="h-auto w-auto" 
                src="/logo-sportt.jpg"
              />
            </Link>
            <p className="text-gray-400 text-sm">
              {getShopDescription()}
            </p>
            <div className="flex flex-col space-y-3">
              <a 
                href={`mailto:${getShopEmail()}`}
                className="flex items-center space-x-2 hover:text-pink-500 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">{getShopEmail()}</span>
              </a>
              <a 
                href={`https://web.whatsapp.com/send?phone=${getShopPhone().replace(/\D/g, '')}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center space-x-2 hover:text-pink-500 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm">{getShopPhone()}</span>
              </a>
            </div>
            
            {/* Redes Sociales - Solo mostrar si hay URLs configuradas */}
            {socialLinks.length > 0 && (
              <div className="flex space-x-4 pt-4">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-pink-500 transition-colors p-2 hover:bg-gray-800 rounded-full"
                      aria-label={social.name}
                    >
                      <IconComponent className="w-5 h-5" />
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          {/* Middle Column - Información */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link 
                  className="hover:text-pink-500 transition-colors" 
                  href="/politica-de-privacidad"
                >
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link 
                  className="hover:text-pink-500 transition-colors" 
                  href="/libro-de-reclamaciones"
                >
                  Libro de Reclamaciones
                </Link>
              </li>
              <li>
                <Link 
                  className="hover:text-pink-500 transition-colors" 
                  href="/terminos-y-condiciones"
                >
                  Términos y Condiciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Column - Categorías */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categorías</h3>
            <div className="grid grid-cols-2 gap-4">
              <ul className="space-y-1 text-sm">
                <li>
                  <Link 
                    className="block select-none space-y-1 rounded-md p-2 leading-none transition-colors hover:bg-gray-100 hover:text-gray-900" 
                    href="/productos?category=equipamiento-deportivo"
                  >
                    Equipamiento deportivo
                  </Link>
                </li>
                <li>
                  <Link 
                    className="block select-none space-y-1 rounded-md p-2 leading-none transition-colors hover:bg-gray-100 hover:text-gray-900" 
                    href="/productos?category=raquetas"
                  >
                    Raquetas
                  </Link>
                </li>
                <li>
                  <Link 
                    className="block select-none space-y-1 rounded-md p-2 leading-none transition-colors hover:bg-gray-100 hover:text-gray-900" 
                    href="/productos?category=maderas"
                  >
                    Maderas
                  </Link>
                </li>
                <li>
                  <Link 
                    className="block select-none space-y-1 rounded-md p-2 leading-none transition-colors hover:bg-gray-100 hover:text-gray-900" 
                    href="/productos?category=accesorios-para-raquetas"
                  >
                    Accesorios para raquetas
                  </Link>
                </li>
                <li>
                  <Link 
                    className="block select-none space-y-1 rounded-md p-2 leading-none transition-colors hover:bg-gray-100 hover:text-gray-900" 
                    href="/productos?category=zapatillas"
                  >
                    Zapatillas
                  </Link>
                </li>
                <li>
                  <Link 
                    className="block select-none space-y-1 rounded-md p-2 leading-none transition-colors hover:bg-gray-100 hover:text-gray-900" 
                    href="/productos?category=pelotitas"
                  >
                    Pelotitas
                  </Link>
                </li>
                <li>
                  <Link 
                    className="block select-none space-y-1 rounded-md p-2 leading-none transition-colors hover:bg-gray-100 hover:text-gray-900" 
                    href="/productos?category=estuches"
                  >
                    Estuches
                  </Link>
                </li>
                <li>
                  <Link 
                    className="block select-none space-y-1 rounded-md p-2 leading-none transition-colors hover:bg-gray-100 hover:text-gray-900" 
                    href="/productos?category=tallas"
                  >
                    Tallas
                  </Link>
                </li>
              </ul>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link 
                    className="block select-none space-y-1 rounded-md p-2 leading-none transition-colors hover:bg-gray-100 hover:text-gray-900" 
                    href="/productos?category=jebes-con-cocos"
                  >
                    Jebes con Cocos
                  </Link>
                </li>
                <li>
                  <Link 
                    className="block select-none space-y-1 rounded-md p-2 leading-none transition-colors hover:bg-gray-100 hover:text-gray-900" 
                    href="/productos?category=polos-jtta"
                  >
                    Polos JTTA
                  </Link>
                </li>
                <li>
                  <Link 
                    className="block select-none space-y-1 rounded-md p-2 leading-none transition-colors hover:bg-gray-100 hover:text-gray-900" 
                    href="/productos?category=jebes-lisos"
                  >
                    Jebes Lisos
                  </Link>
                </li>
                <li>
                  <Link 
                    className="block select-none space-y-1 rounded-md p-2 leading-none transition-colors hover:bg-gray-100 hover:text-gray-900" 
                    href="/productos?category=polos-ch"
                  >
                    Polos Ch
                  </Link>
                </li>
                <li>
                  <Link 
                    className="block select-none space-y-1 rounded-md p-2 leading-none transition-colors hover:bg-gray-100 hover:text-gray-900" 
                    href="/productos?category=buzos-deportivos-jtta"
                  >
                    Buzos Deportivos JTTA
                  </Link>
                </li>
                <li>
                  <Link 
                    className="block select-none space-y-1 rounded-md p-2 leading-none transition-colors hover:bg-gray-100 hover:text-gray-900" 
                    href="/productos?category=buzos-deportivos-ch"
                  >
                    Buzos Deportivos Ch
                  </Link>
                </li>
                <li>
                  <Link 
                    className="block select-none space-y-1 rounded-md p-2 leading-none transition-colors hover:bg-gray-100 hover:text-gray-900" 
                    href="/productos?category=shorts-ch"
                  >
                    Shorts Ch
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Copyright Section */}
        <div className="mt-8 border-t border-gray-800 pt-4 text-center">
          <p className="text-xs text-gray-500">
            © 2025 Sportt Peru. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}