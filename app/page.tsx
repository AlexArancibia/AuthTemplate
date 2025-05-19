"use client"

import { Loader2, Store, Mail, Phone, MapPin, Globe, Facebook, Instagram, Twitter, Youtube } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useMainStore } from "@/stores/mainStore"

export default function HomePage() {
  // Simply use the shop settings from the store
  // The Navbar is responsible for fetching the data
  const { shopSettings, loading, error } = useMainStore()

  console.log("Rendering HomePage, shopSettings:", shopSettings)

  // Handle loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Cargando información de la tienda...</p>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg w-full">
          <h2 className="text-red-600 text-xl font-semibold mb-2">Error al cargar la información</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  // Handle empty state
  if (!shopSettings || shopSettings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-lg w-full">
          <h2 className="text-amber-600 text-xl font-semibold mb-2">Configuración no encontrada</h2>
          <p className="text-amber-600">No se encontró la configuración de la tienda.</p>
        </div>
      </div>
    )
  }

  // Get shop settings data
  const shopSetting = shopSettings[0]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          {shopSetting.logo ? (
            <img
              src={shopSetting.logo || "/placeholder.svg?height=96&width=96&query=store logo"}
              alt={`${shopSetting.name} logo`}
              className="h-24 mx-auto mb-6"
            />
          ) : (
            <div className="flex items-center justify-center mb-6">
              <Store className="h-16 w-16 text-primary" />
            </div>
          )}
          <h1 className="text-4xl font-bold mb-4">{shopSetting.name}</h1>
          {shopSetting.description && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{shopSetting.description}</p>
          )}
        </div>

        {/* Store Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
              <CardDescription>Detalles para contactar con la tienda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {shopSetting.email && (
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span>{shopSetting.email}</span>
                </div>
              )}
              {shopSetting.phone && (
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span>{shopSetting.phone}</span>
                </div>
              )}
              {(shopSetting.address1 || shopSetting.city) && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                  <div>
                    {shopSetting.address1 && <p>{shopSetting.address1}</p>}
                    {shopSetting.address2 && <p>{shopSetting.address2}</p>}
                    {shopSetting.city && (
                      <p>
                        {shopSetting.city}
                        {shopSetting.province && `, ${shopSetting.province}`}
                        {shopSetting.zip && ` ${shopSetting.zip}`}
                      </p>
                    )}
                    {shopSetting.country && <p>{shopSetting.country}</p>}
                  </div>
                </div>
              )}
              {shopSetting.domain && (
                <div className="flex items-center">
                  <Globe className="h-5 w-5 mr-3 text-muted-foreground" />
                  <a
                    href={`https://${shopSetting.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {shopSetting.domain}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración de la Tienda</CardTitle>
              <CardDescription>Detalles generales de la tienda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {shopSetting.defaultCurrency && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Moneda predeterminada:</span>
                  <span className="font-medium">
                    {shopSetting.defaultCurrency.code} ({shopSetting.defaultCurrency.symbol})
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Múltiples monedas:</span>
                <span className="font-medium">{shopSetting.multiCurrencyEnabled ? "Habilitado" : "Deshabilitado"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Impuestos incluidos:</span>
                <span className="font-medium">{shopSetting.taxesIncluded ? "Sí" : "No"}</span>
              </div>
              {shopSetting.freeShippingThreshold && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Envío gratis a partir de:</span>
                  <span className="font-medium">
                    {shopSetting.defaultCurrency?.symbol || "$"}
                    {Number(shopSetting.freeShippingThreshold).toFixed(2)}
                  </span>
                </div>
              )}
              {shopSetting.timezone && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Zona horaria:</span>
                  <span className="font-medium">{shopSetting.timezone}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Social Media */}
        {(shopSetting.facebookUrl || shopSetting.instagramUrl || shopSetting.twitterUrl || shopSetting.youtubeUrl) && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Redes Sociales</CardTitle>
              <CardDescription>Sigue a la tienda en redes sociales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {shopSetting.facebookUrl && (
                  <a
                    href={shopSetting.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Facebook className="h-5 w-5 mr-2" />
                    <span>Facebook</span>
                  </a>
                )}
                {shopSetting.instagramUrl && (
                  <a
                    href={shopSetting.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white hover:opacity-90"
                  >
                    <Instagram className="h-5 w-5 mr-2" />
                    <span>Instagram</span>
                  </a>
                )}
                {shopSetting.twitterUrl && (
                  <a
                    href={shopSetting.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-md bg-sky-500 text-white hover:bg-sky-600"
                  >
                    <Twitter className="h-5 w-5 mr-2" />
                    <span>Twitter</span>
                  </a>
                )}
                {shopSetting.youtubeUrl && (
                  <a
                    href={shopSetting.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                  >
                    <Youtube className="h-5 w-5 mr-2" />
                    <span>YouTube</span>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/products">Ver Productos</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">Contactar</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
