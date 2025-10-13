"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useUserStore, type UserWithRelations, type Address, type AddressCreateData } from "@/stores/userStore"
import { AddressForm } from "@/components/dashboard/address-form"
import { AddressCard } from "@/components/ui/address-card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { AddressType } from "@/types/auth"

interface UserAddressesProps {
  user: UserWithRelations
}

export function UserAddresses({ user }: UserAddressesProps) {
  const { createAddress, updateAddress, deleteAddress, setDefaultAddress } = useUserStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addresses = user.addresses || []
  
  // Organizar direcciones en 3 secciones
  const bothAddresses = addresses.filter((addr) => addr.addressType === AddressType.BOTH)
  const shippingOnlyAddresses = addresses.filter((addr) => addr.addressType === AddressType.SHIPPING)
  const billingOnlyAddresses = addresses.filter((addr) => addr.addressType === AddressType.BILLING)

  // Función para agregar nueva dirección
  const handleAddAddress = async (data: AddressCreateData | Partial<Address>) => {
    setIsSubmitting(true)
    try {
      if ("id" in data) {
        // Es un Partial<Address>, pero createAddress espera AddressCreateData
        const addressData: AddressCreateData = {
          addressType: data.addressType as AddressType,
          address1: data.address1 as string,
          address2: data.address2,
          city: data.city as string,
          province: data.province,
          zip: data.zip as string,
          country: data.country as string,
          phone: data.phone,
          company: data.company,
          isDefault: data.isDefault || false,
        }
        await createAddress(user.id, addressData)
      } else {
        await createAddress(user.id, data as AddressCreateData)
      }
      toast.success("Dirección agregada correctamente")
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error adding address:", error)
      toast.error("Error al agregar la dirección")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para editar dirección
  const handleEditAddress = async (data: Partial<Address>) => {
    if (!selectedAddress) return

    setIsSubmitting(true)
    try {
      await updateAddress(selectedAddress.id, data)
      toast.success("Dirección actualizada correctamente")
      setIsEditDialogOpen(false)
      setSelectedAddress(null)
    } catch (error) {
      console.error("Error updating address:", error)
      toast.error("Error al actualizar la dirección")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para eliminar dirección
  const handleDeleteAddress = async (addressId: string) => {
    try {
      await deleteAddress(addressId)
      toast.success("Dirección eliminada correctamente")
    } catch (error) {
      console.error("Error deleting address:", error)
      toast.error("Error al eliminar la dirección")
    }
  }

  // Función para manejar el click de editar
  const handleEditClick = (address: Address) => {
    setSelectedAddress(address)
    setIsEditDialogOpen(true)
  }

  // Función para establecer dirección como predeterminada
  const handleSetDefault = async (addressId: string) => {
    try {
      await setDefaultAddress(addressId)
      toast.success("Dirección establecida como predeterminada")
    } catch (error) {
      console.error("Error setting default address:", error)
      toast.error("Error al establecer la dirección predeterminada")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Tus direcciones</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar dirección
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agregar nueva dirección</DialogTitle>
              <DialogDescription>
                Agrega una nueva dirección a tu cuenta. Puedes usarla para envíos o facturación.
              </DialogDescription>
            </DialogHeader>
            <AddressForm
              onSubmit={handleAddAddress}
              isSubmitting={isSubmitting}
              isFirstAddress={addresses.length === 0}
            />
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground mb-4">No tienes direcciones guardadas</p>
          <Button variant="outline" onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar tu primera dirección
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Direcciones de envío y facturación */}
          {bothAddresses.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3">Direcciones de envío y facturación</h4>
              <div className="space-y-2">
                {bothAddresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    variant="dashboard"
                    onEdit={handleEditClick}
                    onDelete={handleDeleteAddress}
                    onSetDefault={handleSetDefault}
                    showEditDeleteButtons={true}
                    isSubmitting={isSubmitting}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Direcciones solo de envío */}
          {shippingOnlyAddresses.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3">Direcciones solo de envío</h4>
              <div className="space-y-2">
                {shippingOnlyAddresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    variant="dashboard"
                    onEdit={handleEditClick}
                    onDelete={handleDeleteAddress}
                    onSetDefault={handleSetDefault}
                    showEditDeleteButtons={true}
                    isSubmitting={isSubmitting}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Direcciones solo de facturación */}
          {billingOnlyAddresses.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3">Direcciones solo de facturación</h4>
              <div className="space-y-2">
                {billingOnlyAddresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    variant="dashboard"
                    onEdit={handleEditClick}
                    onDelete={handleDeleteAddress}
                    onSetDefault={handleSetDefault}
                    showEditDeleteButtons={true}
                    isSubmitting={isSubmitting}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Address Dialog */}
      {selectedAddress && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar dirección</DialogTitle>
              <DialogDescription>Actualiza los detalles de tu dirección.</DialogDescription>
            </DialogHeader>
            <AddressForm 
              onSubmit={handleEditAddress} 
              isSubmitting={isSubmitting} 
              initialData={selectedAddress} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
