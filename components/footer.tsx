"use client"

import Link from "next/link"
import { useState } from "react"
import { useMainStore } from "@/stores/mainStore"
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { toast } from "sonner"

const shopLinks = [
  { name: "Perfumes de Nicho", href: "/productos?category=perfumes-de-nicho" },
  { name: "Perfumes de Diseñador", href: "/productos?category=perfumes-de-disenador" },
  { name: "Perfumes Árabes", href: "/productos?category=perfumes-arabes" },
  { name: "Sets y Estuches", href: "/productos?category=sets-y-estuches" },
  { name: "Todas las fragancias", href: "/productos" },
  { name: "Diario", href: "/blog" },
]

const helpLinks = [
  { name: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
  { name: "Formas de pago", href: "/formas-pago" },
  { name: "Cambios y devoluciones", href: "/cambios-devoluciones" },
  { name: "Contáctanos", href: "/contactenos" },
  { name: "Libro de reclamaciones", href: "/libro-de-reclamaciones" },
]

const legalLinks = [
  { name: "Términos y condiciones", href: "/terminos-y-condiciones" },
  { name: "Política de privacidad", href: "/politica-de-privacidad" },
  { name: "Política de cookies", href: "/politica-de-cookies" },
  { name: "Política de envíos", href: "/politica-de-envios" },
]

export function Footer() {
  const { shopSettings } = useMainStore()
  const settings = shopSettings?.[0]
  const [email, setEmail] = useState("")

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes("@")) return
    toast.success("¡Gracias por suscribirte!", {
      description: "Recibirás novedades y lanzamientos de Scentra.",
    })
    setEmail("")
  }

  const year = 2026

  return (
    <footer className="bg-foreground text-background/80">
      {/* Newsletter band */}
      <div className="border-b border-white/10">
        <div className="container-section">
          <div className="content-section flex flex-col items-center gap-6 py-14 text-center md:flex-row md:justify-between md:text-left">
            <div className="max-w-md">
              <h3 className="font-display text-2xl text-background md:text-3xl">
                Encuentra tu firma olfativa
              </h3>
              <p className="mt-2 text-sm text-background/60">
                Suscríbete y recibe novedades, lanzamientos y asesoría olfativa.
              </p>
            </div>
            <form onSubmit={onSubscribe} className="flex w-full max-w-md items-center gap-0">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu correo electrónico"
                className="h-12 flex-1 border border-white/20 bg-transparent px-4 text-sm text-background placeholder:text-background/40 focus:border-brand focus:outline-none"
              />
              <button
                type="submit"
                className="h-12 bg-brand px-6 text-xs font-semibold uppercase tracking-[0.14em] text-brand-foreground transition-colors hover:bg-brand-dark"
              >
                Suscribir
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="container-section">
        <div className="content-section grid grid-cols-2 gap-10 py-14 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" aria-label="Scentra inicio">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/logo.png" alt="Scentra" className="h-5 w-auto brightness-0 invert" />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-background/60">
              {settings?.description ||
                "Perfumería de autor en el Perú. Fragancias árabes, de diseñador y de nicho, 100% originales."}
            </p>
            <div className="mt-6 space-y-2 text-sm text-background/60">
              {(settings?.address1 || settings?.city) && (
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
                  <span>
                    {[settings?.address1, settings?.address2, settings?.city, settings?.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </p>
              )}
              {settings?.phone && (
                <a href={`tel:${settings.phone}`} className="flex items-center gap-2 hover:text-background">
                  <Phone className="h-4 w-4 flex-shrink-0 text-brand" />
                  {settings.phone}
                </a>
              )}
              {(settings?.email || settings?.supportEmail) && (
                <a
                  href={`mailto:${settings?.supportEmail || settings?.email}`}
                  className="flex items-center gap-2 hover:text-background"
                >
                  <Mail className="h-4 w-4 flex-shrink-0 text-brand" />
                  {settings?.supportEmail || settings?.email}
                </a>
              )}
            </div>
          </div>

          <FooterColumn title="Tienda" links={shopLinks} />
          <FooterColumn title="Ayuda" links={helpLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="container-section">
          <div className="content-section flex flex-col items-center justify-between gap-4 py-6 text-xs text-background/50 sm:flex-row">
            <p>© {year} Scentra. Todos los derechos reservados.</p>
            <div className="flex items-center gap-3">
              {settings?.instagramUrl && (
                <SocialIcon href={settings.instagramUrl} label="Instagram">
                  <Instagram className="h-4 w-4" />
                </SocialIcon>
              )}
              {settings?.facebookUrl && (
                <SocialIcon href={settings.facebookUrl} label="Facebook">
                  <Facebook className="h-4 w-4" />
                </SocialIcon>
              )}
              {settings?.youtubeUrl && (
                <SocialIcon href={settings.youtubeUrl} label="YouTube">
                  <Youtube className="h-4 w-4" />
                </SocialIcon>
              )}
              {settings?.tiktokUrl && (
                <SocialIcon href={settings.tiktokUrl} label="TikTok">
                  <span className="text-[11px] font-semibold">TikTok</span>
                </SocialIcon>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { name: string; href: string }[]
}) {
  return (
    <div>
      <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-background">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-background/60 transition-colors hover:text-background">
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 items-center justify-center rounded-full border border-white/15 px-3 text-background/70 transition-colors hover:border-brand hover:text-brand"
    >
      {children}
    </a>
  )
}

export default Footer
