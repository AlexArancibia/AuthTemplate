"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type React from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { AddressCard } from "@/components/ui/address-card"
import { AddressForm } from "@/components/dashboard/address-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState, useEffect, useMemo } from "react"
import { useGeographicDataStore } from "@/stores/locationStore"
import { useUserStore } from "@/stores/userStore"
import { toast } from "sonner"; 

import type { Address } from "@/stores/userStore"
import { AddressType } from "@/types/auth"
import { User } from "@/types/user"
import { ShippingMethod } from "@/types/shippingMethod"

interface CustomerInfoStepProps {
  formData: Record<string, any>
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  nextStep: () => void
  prevStep: () => void
  isAuthenticated: boolean
  authCheckComplete: boolean
  currentUser: (User & { addresses?: Address[] }) | null
  showNewShippingAddress: boolean
  setShowNewShippingAddress: (value: boolean) => void
  showNewBillingAddress: boolean
  setShowNewBillingAddress: (value: boolean) => void
  selectedShippingAddressId: string | null
  selectedBillingAddressId: string | null
  handleSelectShippingAddress: (addressId: string) => void
  handleSelectBillingAddress: (addressId: string) => void
  handleDeselectShippingAddress: () => void
  handleDeselectBillingAddress: () => void
  handleBillingAddressToggle: (value: boolean) => void
  copyShippingToBilling: () => void
  onEditAddress: (addressId: string) => void
  onDeleteAddress: (addressId: string) => void
  shippingMethods: ShippingMethod[]
}

export function CustomerInfoStep({
  formData,
  handleInputChange,
  nextStep,
  prevStep,
  isAuthenticated,
  authCheckComplete,
  currentUser,
  showNewShippingAddress,
  setShowNewShippingAddress,
  showNewBillingAddress,
  setShowNewBillingAddress,
  selectedShippingAddressId,
  selectedBillingAddressId,
  handleSelectShippingAddress,
  handleSelectBillingAddress,
  handleDeselectShippingAddress,
  handleDeselectBillingAddress,
  handleBillingAddressToggle,
  copyShippingToBilling,
  onEditAddress,
  onDeleteAddress,
  shippingMethods,
}: CustomerInfoStepProps) {

  const router = useRouter()
  const { updateAddress } = useUserStore()
  const [addressError, setAddressError] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedAddressForEdit, setSelectedAddressForEdit] = useState<Address | null>(null)
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)

  // Funciones para manejar edición y eliminación
  const handleEditAddressClick = (address: Address) => {
    setSelectedAddressForEdit(address)
    setIsEditDialogOpen(true)
  }

  const handleEditAddressSubmit = async (data: Partial<Address>) => {
    if (!selectedAddressForEdit) return

    setIsSubmittingEdit(true)
    try {
      await updateAddress(selectedAddressForEdit.id, data)
      toast.success("Dirección actualizada correctamente")
      setIsEditDialogOpen(false)
      setSelectedAddressForEdit(null)
    } catch (error) {
      console.error("Error updating address:", error)
      toast.error("Error al actualizar la dirección")
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await onDeleteAddress(addressId)
      // El toast se maneja en el componente padre (checkout page)
    } catch (error) {
      console.error("Error deleting address:", error)
      toast.error("Error al eliminar la dirección")
    }
  }

  const selectedShippingAddressData = useMemo(() => {
    if (!selectedShippingAddressId) return null
    return currentUser?.addresses?.find((addr) => addr.id === selectedShippingAddressId) || null
  }, [currentUser?.addresses, selectedShippingAddressId])

  const handleContinue = () => {
    // Si el campo de dirección está vacío, muestra error visual y toast
    if (!formData.address || formData.address.trim() === "") {
      setAddressError(true);
      toast.error("Falta dirección de envío");
      return;
    }
    setAddressError(false);

    nextStep();
  };

  const {
    countries,
    states,
    cities,
    fetchCountries,
    fetchStates,
    fetchCities
  } = useGeographicDataStore()

  const availableCountries = useMemo(() => {
    const list = Array.isArray(countries) ? countries : []
    const peruOnlyList = list.filter(c => c.code3 === "PER")
    return peruOnlyList.length > 0 ? peruOnlyList : list
  }, [countries])

  useEffect(() => {
    fetchCountries()
  }, [fetchCountries])

  useEffect(() => {
    if (formData.countryId) fetchStates(formData.countryId)
  }, [formData.countryId, fetchStates])

  useEffect(() => {
    if (formData.countryId && formData.stateId) {
      fetchCities(formData.countryId, formData.stateId)
    }
  }, [formData.countryId, formData.stateId, fetchCities])

  // useEffect para manejar estados de facturación independientemente
  useEffect(() => {
    if (formData.billingCountryId) fetchStates(formData.billingCountryId)
  }, [formData.billingCountryId, fetchStates])

  useEffect(() => {
    if (formData.billingCountryId && formData.billingStateId) {
      fetchCities(formData.billingCountryId, formData.billingStateId)
    }
  }, [formData.billingCountryId, formData.billingStateId, fetchCities])

  const handleCountryChange = (value: string) => {
    const country = availableCountries.find(c => c.code3 === value)
    handleInputChange({ target: { name: "country", value: country?.name || "" } } as any)
    handleInputChange({ target: { name: "countryCode3", value } } as any)
    handleInputChange({ target: { name: "countryCode", value: country?.code || "" } } as any)
    handleInputChange({ target: { name: "countryId", value: country?.id || "" } } as any)
    // Limpiar estado y ciudad
    handleInputChange({ target: { name: "state", value: "" } } as any)
    handleInputChange({ target: { name: "stateId", value: "" } } as any)
    handleInputChange({ target: { name: "stateCode", value: "" } } as any)
    handleInputChange({ target: { name: "city", value: "" } } as any)
    handleInputChange({ target: { name: "cityId", value: "" } } as any)
  }

  const handleStateChange = (value: string) => {
    const state = (states[formData.countryId] || []).find(s => s.id === value)
    handleInputChange({ target: { name: "state", value: state?.name || "" } } as any)
    handleInputChange({ target: { name: "stateId", value } } as any)
    handleInputChange({ target: { name: "stateCode", value: state?.code || "" } } as any)
    // Limpiar ciudad
    handleInputChange({ target: { name: "city", value: "" } } as any)
    handleInputChange({ target: { name: "cityId", value: "" } } as any)
  }

  const handleCityChange = (value: string) => {
    const city = (cities[formData.stateId] || []).find(c => c.id === value)
    handleInputChange({ target: { name: "city", value: city?.name || "" } } as any)
    handleInputChange({ target: { name: "cityId", value } } as any)
  }

  const handleBillingCountryChange = (value: string) => {
    const country = availableCountries.find(c => c.code3 === value)
    handleInputChange({ target: { name: "billingCountry", value: country?.name || "" } } as any)
    handleInputChange({ target: { name: "billingCountryCode3", value } } as any)
    handleInputChange({ target: { name: "billingCountryCode", value: country?.code || "" } } as any)
    handleInputChange({ target: { name: "billingCountryId", value: country?.id || "" } } as any)
    // Limpiar estado y ciudad de billing
    handleInputChange({ target: { name: "billingState", value: "" } } as any)
    handleInputChange({ target: { name: "billingStateId", value: "" } } as any)
    handleInputChange({ target: { name: "billingStateCode", value: "" } } as any)
    handleInputChange({ target: { name: "billingCity", value: "" } } as any)
    handleInputChange({ target: { name: "billingCityId", value: "" } } as any)
  }

  const handleBillingStateChange = (value: string) => {
    const state = (states[formData.billingCountryId] || []).find(s => s.id === value)
    handleInputChange({ target: { name: "billingState", value: state?.name || "" } } as any)
    handleInputChange({ target: { name: "billingStateId", value } } as any)
    handleInputChange({ target: { name: "billingStateCode", value: state?.code || "" } } as any)
    // Limpiar ciudad de billing
    handleInputChange({ target: { name: "billingCity", value: "" } } as any)
    handleInputChange({ target: { name: "billingCityId", value: "" } } as any)
  }

  const handleBillingCityChange = (value: string) => {
    const city = (cities[formData.billingStateId] || []).find(c => c.id === value)
    handleInputChange({ target: { name: "billingCity", value: city?.name || "" } } as any)
    handleInputChange({ target: { name: "billingCityId", value } } as any)
  }

  // Estados para filtros de búsqueda
  const [stateFilter, setStateFilter] = useState("")
  const [cityFilter, setCityFilter] = useState("")
  const [billingStateFilter, setBillingStateFilter] = useState("")
  const [billingCityFilter, setBillingCityFilter] = useState("")

  // Función para verificar si los campos requeridos están completos
  const isFormValid = () => {
    // Si la verificación de autenticación no está completa, no permitir continuar
    if (!authCheckComplete) {
      return false
    }

    // Verificar información de contacto básica
    const basicInfoValid = formData.firstName && 
                         formData.lastName && 
                         formData.email && 
                         formData.phone

    // Verificar dirección de envío
    let shippingValid = false
    if (isAuthenticated && currentUser?.addresses && currentUser.addresses.length > 0) {
      // Si hay direcciones guardadas, debe haber una seleccionada O el formulario debe estar desplegado y completo
      if (selectedShippingAddressId) {
        shippingValid = true
      } else if (showNewShippingAddress) {
        // Si el formulario está desplegado, debe estar completo
        shippingValid = formData.address && 
                       formData.shippingPhone && 
                       formData.city && 
                       formData.state
      } else {
        // Si no hay dirección seleccionada y el formulario no está desplegado, no es válido
        shippingValid = false
      }
    } else {
      // Si no hay direcciones guardadas, debe estar completo el formulario
      shippingValid = formData.address && 
                     formData.shippingPhone && 
                     formData.city && 
                     formData.state
    }

    // Verificar dirección de facturación si es diferente
    let billingValid = true
    if (!formData.sameBillingAddress) {
      if (isAuthenticated && currentUser?.addresses && currentUser.addresses.length > 0) {
        // Si hay direcciones guardadas, debe haber una seleccionada O el formulario debe estar desplegado y completo
        if (selectedBillingAddressId) {
          billingValid = true
        } else if (showNewBillingAddress) {
          // Si el formulario está desplegado, debe estar completo
          billingValid = formData.billingAddress && 
                        formData.billingPhone && 
                        formData.billingCity && 
                        formData.billingState
        } else {
          // Si no hay dirección seleccionada y el formulario no está desplegado, no es válido
          billingValid = false
        }
      } else {
        // Si no hay direcciones guardadas, debe estar completo el formulario
        billingValid = formData.billingAddress && 
                      formData.billingPhone && 
                      formData.billingCity && 
                      formData.billingState
      }
    }

    return basicInfoValid && shippingValid && billingValid
  }

  // Render an address card using the reusable AddressCard component
  const renderAddressCard = (address: Address, isSelected: boolean, onSelect: () => void, isShipping: boolean) => (
    <AddressCard
      key={address.id}
      address={address}
      isSelected={isSelected}
      onSelect={onSelect}
      onEdit={handleEditAddressClick}
      onDelete={handleDeleteAddress}
      showRadioButton={true}
      showEditDeleteButtons={true}
      variant="checkout"
      isSubmitting={isSubmittingEdit}
    />
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      {!authCheckComplete && (
        <div className="bg-muted p-4 rounded-none mb-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground"></div>
              <span className="text-sm text-muted-foreground">Verificando autenticación...</span>
            </div>
          </div>
        </div>
      )}

      {authCheckComplete && !isAuthenticated && (
        <div className="bg-muted border border-border p-4 rounded-none mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-medium text-foreground">¿Ya tienes una cuenta?</h3>
              <p className="text-sm text-muted-foreground">Inicia sesión para agilizar el proceso de compra</p>
            </div>
            <Button variant="outline" className="bg-background" onClick={() => router.push("/login?redirect=/checkout")}>
              Iniciar sesión
            </Button>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-display mb-4">Información de contacto</h2>

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

      <h2 className="text-2xl font-display mb-4">Dirección de envío</h2>

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
            onClick={() => {
              if (showNewShippingAddress) {
                setShowNewShippingAddress(false)
              } else {
                setShowNewShippingAddress(true)
                // Deseleccionar dirección existente cuando se agrega nueva
                handleDeselectShippingAddress()
              }
            }}
          >
            {showNewShippingAddress ? (
              <>
                <Minus className="h-4 w-4" />
                Cancelar
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Agregar nueva dirección
              </>
            )}
          </Button>
        </div>
      )}

      {/* New shipping address form */}
      {(showNewShippingAddress || !isAuthenticated || !currentUser?.addresses?.length) && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={(e) => {
                  handleInputChange(e);
                  if (e.target.value.trim() !== "") setAddressError(false);
                }}
                required
                className={addressError ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
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
              <Label htmlFor="zipCode">Código postal (opcional)</Label>
              <Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Select
                value={formData.countryCode3 || ""}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Elija --" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {availableCountries.map(c => (
                    <SelectItem key={c.code} value={c.code3}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Departamento/Estado</Label>
              <Select
                value={formData.stateId || ""}
                onValueChange={handleStateChange}
                disabled={!formData.countryCode3}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Elija --" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  <div className="p-2">
                    <Input
                      placeholder="Buscar departamento..."
                      value={stateFilter}
                      onChange={e => setStateFilter(e.target.value)}
                      className="mb-2"
                      onKeyDown={e => e.stopPropagation()}
                    />
                  </div>
                  {(states[formData.countryId] || [])
                    .filter(s => s.name.toLowerCase().includes(stateFilter.toLowerCase()))
                    .map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad/Distrito</Label>
              <Select
                value={formData.cityId || ""}
                onValueChange={handleCityChange}
                disabled={!formData.stateId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Elija --" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  <div className="p-2">
                    <Input
                      placeholder="Buscar ciudad..."
                      value={cityFilter}
                      onChange={e => setCityFilter(e.target.value)}
                      className="mb-2"
                      onKeyDown={e => e.stopPropagation()}
                    />
                  </div>
                  {(cities[formData.stateId] || [])
                    .filter(c => c.name.toLowerCase().includes(cityFilter.toLowerCase()))
                    .map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
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
        <div className="space-y-6 border-l-2 border-border pl-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-display">Dirección de facturación</h2>
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
                onClick={() => {
                  if (showNewBillingAddress) {
                    setShowNewBillingAddress(false)
                  } else {
                    setShowNewBillingAddress(true)
                    // Deseleccionar dirección existente cuando se agrega nueva
                    handleDeselectBillingAddress()
                  }
                }}
              >
                {showNewBillingAddress ? (
                  <>
                    <Minus className="h-4 w-4" />
                    Cancelar
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Agregar nueva dirección de facturación
                  </>
                )}
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
                  <Label htmlFor="billingZipCode">Código postal (opcional)</Label>
                  <Input
                    id="billingZipCode"
                    name="billingZipCode"
                    value={formData.billingZipCode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billingCountry">País</Label>
                  <Select
                    value={formData.billingCountryCode3 || ""}
                    onValueChange={handleBillingCountryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="-- Elija --" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {availableCountries.map(c => (
                        <SelectItem key={c.code} value={c.code3}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingState">Departamento/Estado</Label>
                  <Select
                    value={formData.billingStateId || ""}
                    onValueChange={handleBillingStateChange}
                    disabled={!formData.billingCountryCode3}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="-- Elija --" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      <div className="p-2">
                        <Input
                          placeholder="Buscar departamento..."
                          value={billingStateFilter}
                          onChange={e => setBillingStateFilter(e.target.value)}
                          className="mb-2"
                          onKeyDown={e => e.stopPropagation()}
                        />
                      </div>
                      {(states[formData.billingCountryId] || [])
                        .filter(s => s.name.toLowerCase().includes(billingStateFilter.toLowerCase()))
                        .map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingCity">Ciudad/Distrito</Label>
                  <Select
                    value={formData.billingCityId || ""}
                    onValueChange={handleBillingCityChange}
                    disabled={!formData.billingStateId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="-- Elija --" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      <div className="p-2">
                        <Input
                          placeholder="Buscar ciudad..."
                          value={billingCityFilter}
                          onChange={e => setBillingCityFilter(e.target.value)}
                          className="mb-2"
                          onKeyDown={e => e.stopPropagation()}
                        />
                      </div>
                      {(cities[formData.billingStateId] || [])
                        .filter(c => c.name.toLowerCase().includes(billingCityFilter.toLowerCase()))
                        .map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
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
        <Button onClick={handleContinue} disabled={!isFormValid()}>
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Dialog para editar dirección */}
      {selectedAddressForEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar dirección</DialogTitle>
              <DialogDescription>
                Modifica los datos de tu dirección. Los cambios se aplicarán inmediatamente.
              </DialogDescription>
            </DialogHeader>
            <AddressForm
              onSubmit={handleEditAddressSubmit}
              isSubmitting={isSubmittingEdit}
              initialData={selectedAddressForEdit}
            />
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  )
}
