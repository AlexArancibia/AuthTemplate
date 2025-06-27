"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type React from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Plus, Home, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
 
import type { Address } from "@/stores/userStore"
import { AddressType } from "@/types/auth"

interface CustomerInfoStepProps {
  formData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  nextStep: () => void
  prevStep: () => void
  isAuthenticated: boolean
  currentUser: any
  showNewShippingAddress: boolean
  setShowNewShippingAddress: (value: boolean) => void
  showNewBillingAddress: boolean
  setShowNewBillingAddress: (value: boolean) => void
  selectedShippingAddressId: string | null
  selectedBillingAddressId: string | null
  handleSelectShippingAddress: (addressId: string) => void
  handleSelectBillingAddress: (addressId: string) => void
  handleBillingAddressToggle: (value: boolean) => void
  copyShippingToBilling: () => void
}

export function CustomerInfoStep({
  formData,
  handleInputChange,
  nextStep,
  prevStep,
  isAuthenticated,
  currentUser,
  showNewShippingAddress,
  setShowNewShippingAddress,
  showNewBillingAddress,
  setShowNewBillingAddress,
  selectedShippingAddressId,
  selectedBillingAddressId,
  handleSelectShippingAddress,
  handleSelectBillingAddress,
  handleBillingAddressToggle,
  copyShippingToBilling,
}: CustomerInfoStepProps) {

  // Opciones de ejemplo, reemplaza luego por datos de endpoints
  const countries = ["Colombia", "México", "Argentina", "Chile"]
  const states = ["Antioquia", "Cundinamarca", "Valle del Cauca"]
  const cities = ["Medellín", "Bogotá", "Cali"]

  const router = useRouter()

  // Estados para filtros de búsqueda
  const [countryFilter, setCountryFilter] = useState("")
  const [stateFilter, setStateFilter] = useState("")
  const [cityFilter, setCityFilter] = useState("")
  const [billingCountryFilter, setBillingCountryFilter] = useState("")
  const [billingStateFilter, setBillingStateFilter] = useState("")
  const [billingCityFilter, setBillingCityFilter] = useState("")

  // Función para verificar si los campos requeridos están completos
  const isFormValid = () => {
    // Verificar información de contacto básica
    const basicInfoValid = formData.firstName && 
                         formData.lastName && 
                         formData.email && 
                         formData.phone

    // Verificar dirección de envío
    let shippingValid = false
    if (isAuthenticated && currentUser?.addresses?.length > 0 && selectedShippingAddressId) {
      shippingValid = true
    } else {
      shippingValid = formData.address && 
                     formData.shippingPhone && 
                     formData.city && 
                     formData.state && 
                     formData.zipCode
    }

    // Verificar dirección de facturación si es diferente
    let billingValid = true
    if (!formData.sameBillingAddress) {
      if (isAuthenticated && currentUser?.addresses?.length > 0 && selectedBillingAddressId) {
        billingValid = true
      } else {
        billingValid = formData.billingAddress && 
                      formData.billingPhone && 
                      formData.billingCity && 
                      formData.billingState && 
                      formData.billingZipCode
      }
    }

    return basicInfoValid && shippingValid && billingValid
  }

  // Render an address card
  const renderAddressCard = (address: Address, isSelected: boolean, onSelect: () => void, isShipping: boolean) => (
    <Card
      key={address.id}
      className={`mb-3 cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary" : "hover:border-primary/50"}`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div className={`mt-1 p-1 rounded-full ${isSelected ? "bg-primary text-white" : "bg-muted"}`}>
              {address.address1.toLowerCase().includes("oficina") || address.company ? (
                <Building className="h-4 w-4" />
              ) : (
                <Home className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{address.address1}</p>
              {address.address2 && <p className="text-sm text-muted-foreground">{address.address2}</p>}
              <p className="text-sm text-muted-foreground">
                {address.city}, {address.province} {address.zip}
              </p>
              {address.phone && <p className="text-sm text-muted-foreground">{address.phone}</p>}
              {address.isDefault && <Badge className="mt-1 bg-primary/10 text-primary">Predeterminada</Badge>}
            </div>
          </div>
          <RadioGroupItem
            value={address.id}
            id={`${isShipping ? "shipping" : "billing"}-${address.id}`}
            className="mt-1"
            checked={isSelected}
          />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      {!isAuthenticated && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-800">¿Ya tienes una cuenta?</h3>
              <p className="text-sm text-blue-700">Inicia sesión para agilizar el proceso de compra</p>
            </div>
            <Button variant="outline" className="bg-white" onClick={() => router.push("/login")}>
              Iniciar sesión
            </Button>
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Información de contacto</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nombre</Label>
          <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Apellido</Label>
          <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email || currentUser?.email || ""}
            onChange={handleInputChange}
            required
            disabled={!!currentUser?.email}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono de contacto</Label>
          <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Empresa (opcional)</Label>
        <Input id="company" name="company" value={formData.company} onChange={handleInputChange} />
      </div>

      <Separator className="my-6" />

      <h2 className="text-xl font-semibold mb-4">Dirección de envío</h2>

      {/* Display existing addresses for authenticated users */}
      {isAuthenticated && currentUser && currentUser.addresses && currentUser.addresses.length > 0 && (
        <div className="mb-6">
          <RadioGroup
            value={selectedShippingAddressId || ""}
            onValueChange={(value) => handleSelectShippingAddress(value)}
            className="space-y-2"
          >
            {currentUser.addresses
              .filter((addr: { addressType: string }) => addr.addressType === AddressType.SHIPPING || addr.addressType === AddressType.BOTH)
              .map((address: Address) =>
                renderAddressCard(
                  address,
                  selectedShippingAddressId === address.id,
                  () => handleSelectShippingAddress(address.id),
                  true,
                ),
              )}
          </RadioGroup>

          <Button
            variant="outline"
            className="mt-3 flex items-center gap-2"
            onClick={() => setShowNewShippingAddress(true)}
          >
            <Plus className="h-4 w-4" />
            Agregar nueva dirección
          </Button>
        </div>
      )}

      {/* New shipping address form */}
      {(showNewShippingAddress || !isAuthenticated || !currentUser?.addresses?.length) && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" name="address" value={formData.address} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shippingPhone">Teléfono</Label>
              <Input
                id="shippingPhone"
                name="shippingPhone"
                value={formData.shippingPhone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="apartment">Apartamento, suite, etc. (opcional)</Label>
              <Input id="apartment" name="apartment" value={formData.apartment} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">Código postal</Label>
              <Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Select
                value={formData.country || ""}
                onValueChange={(value) => handleInputChange({ target: { name: "country", value } } as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Elija --" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Buscar país..."
                      value={countryFilter}
                      onChange={e => setCountryFilter(e.target.value)}
                      className="mb-2"
                      onKeyDown={e => e.stopPropagation()}
                    />
                  </div>
                  {countries
                    .filter(c => c.toLowerCase().includes(countryFilter.toLowerCase()))
                    .map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Select
                value={formData.city || ""}
                onValueChange={(value) => handleInputChange({ target: { name: "city", value } } as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Elija --" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Buscar ciudad..."
                      value={cityFilter}
                      onChange={e => setCityFilter(e.target.value)}
                      className="mb-2"
                      onKeyDown={e => e.stopPropagation()}
                    />
                  </div>
                  {cities
                    .filter(c => c.toLowerCase().includes(cityFilter.toLowerCase()))
                    .map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Departamento/Provincia</Label>
              <Select
                value={formData.state || ""}
                onValueChange={(value) => handleInputChange({ target: { name: "state", value } } as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Elija --" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Buscar departamento..."
                      value={stateFilter}
                      onChange={e => setStateFilter(e.target.value)}
                      className="mb-2"
                      onKeyDown={e => e.stopPropagation()}
                    />
                  </div>
                  {states
                    .filter(s => s.toLowerCase().includes(stateFilter.toLowerCase()))
                    .map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}

      <Separator className="my-6" />

      <div className="flex items-center space-x-2 mb-4">
        <Checkbox
          id="sameBillingAddress"
          checked={formData.sameBillingAddress}
          onCheckedChange={handleBillingAddressToggle}
        />
        <Label htmlFor="sameBillingAddress" className="cursor-pointer">
          La dirección de facturación es la misma que la dirección de envío
        </Label>
      </div>

      {!formData.sameBillingAddress && (
        <div className="space-y-6 border-l-2 border-primary/20 pl-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Dirección de facturación</h2>
            {showNewBillingAddress && (
              <Button type="button" variant="outline" size="sm" onClick={copyShippingToBilling}>
                Copiar dirección de envío
              </Button>
            )}
          </div>

          {/* Display existing addresses for billing */}
          {isAuthenticated && currentUser && currentUser.addresses && currentUser.addresses.length > 0 && (
            <div className="mb-6">
              <RadioGroup
                value={selectedBillingAddressId || ""}
                onValueChange={(value) => handleSelectBillingAddress(value)}
                className="space-y-2"
              >
                {currentUser.addresses
                  .filter((addr: { addressType: string }) => addr.addressType === AddressType.BILLING || addr.addressType === AddressType.BOTH)
                  .map((address: Address) =>
                    renderAddressCard(
                      address,
                      selectedBillingAddressId === address.id,
                      () => handleSelectBillingAddress(address.id),
                      false,
                    ),
                  )}
              </RadioGroup>

              <Button
                variant="outline"
                className="mt-3 flex items-center gap-2"
                onClick={() => setShowNewBillingAddress(true)}
              >
                <Plus className="h-4 w-4" />
                Agregar nueva dirección de facturación
              </Button>
            </div>
          )}

          {/* New billing address form */}
          {(showNewBillingAddress || !isAuthenticated || !currentUser?.addresses?.length) && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billingAddress">Dirección</Label>
                  <Input
                    id="billingAddress"
                    name="billingAddress"
                    value={formData.billingAddress}
                    onChange={handleInputChange}
                    required={!formData.sameBillingAddress}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingPhone">Teléfono</Label>
                  <Input
                    id="billingPhone"
                    name="billingPhone"
                    value={formData.billingPhone}
                    onChange={handleInputChange}
                    required={!formData.sameBillingAddress}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billingApartment">Apartamento, suite, etc. (opcional)</Label>
                  <Input
                    id="billingApartment"
                    name="billingApartment"
                    value={formData.billingApartment}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingZipCode">Código postal</Label>
                  <Input
                    id="billingZipCode"
                    name="billingZipCode"
                    value={formData.billingZipCode}
                    onChange={handleInputChange}
                    required={!formData.sameBillingAddress}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billingCountry">País</Label>
                  <Select
                    value={formData.billingCountry || ""}
                    onValueChange={(value) => handleInputChange({ target: { name: "billingCountry", value } } as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="-- Elija --" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Buscar país..."
                          value={billingCountryFilter}
                          onChange={e => setBillingCountryFilter(e.target.value)}
                          className="mb-2"
                          onKeyDown={e => e.stopPropagation()}
                        />
                      </div>
                      {countries
                        .filter(c => c.toLowerCase().includes(billingCountryFilter.toLowerCase()))
                        .map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingCity">Ciudad</Label>
                  <Select
                    value={formData.billingCity || ""}
                    onValueChange={(value) => handleInputChange({ target: { name: "billingCity", value } } as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="-- Elija --" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Buscar ciudad..."
                          value={billingCityFilter}
                          onChange={e => setBillingCityFilter(e.target.value)}
                          className="mb-2"
                          onKeyDown={e => e.stopPropagation()}
                        />
                      </div>
                      {cities
                        .filter(c => c.toLowerCase().includes(billingCityFilter.toLowerCase()))
                        .map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingState">Departamento/Provincia</Label>
                  <Select
                    value={formData.billingState || ""}
                    onValueChange={(value) => handleInputChange({ target: { name: "billingState", value } } as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="-- Elija --" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Buscar departamento..."
                          value={billingStateFilter}
                          onChange={e => setBillingStateFilter(e.target.value)}
                          className="mb-2"
                          onKeyDown={e => e.stopPropagation()}
                        />
                      </div>
                      {states
                        .filter(s => s.toLowerCase().includes(billingStateFilter.toLowerCase()))
                        .map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Atrás
        </Button>
        <Button onClick={nextStep} disabled={!isFormValid()}>
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}