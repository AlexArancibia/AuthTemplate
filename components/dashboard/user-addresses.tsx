"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { AddressType } from "@prisma/client"
import { useUserStore, type UserWithRelations, type Address, type AddressCreateData } from "@/stores/userStore"
import { AddressForm } from "@/components/dashboard/address-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Home, Building, Plus, Edit, Trash2, Star } from "lucide-react"

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
  const shippingAddresses = addresses.filter(
    (addr) => addr.addressType === AddressType.shipping || addr.addressType === AddressType.both,
  )
  const billingAddresses = addresses.filter(
    (addr) => addr.addressType === AddressType.billing || addr.addressType === AddressType.both,
  )

  // Modificar la función handleAddAddress para que acepte ambos tipos
  const handleAddAddress = async (data: AddressCreateData | Partial<Address>) => {
    setIsSubmitting(true)
    try {
      // Verificar si estamos recibiendo un AddressCreateData o un Partial<Address>
      // y actuar en consecuencia
      if ("id" in data) {
        // Es un Partial<Address>, pero createAddress espera AddressCreateData
        // Extraemos solo las propiedades necesarias
        const addressData: AddressCreateData = {
          addressType: data.addressType as AddressType, // Forzamos el tipo ya que sabemos que existe
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
        // Es un AddressCreateData, podemos pasarlo directamente
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

  // También necesitamos modificar la función handleEditAddress para asegurar
  // que estamos pasando el tipo correcto
  const handleEditAddress = async (data: Partial<Address>) => {
    if (!selectedAddress) return

    setIsSubmitting(true)
    try {
      // Aseguramos que estamos pasando un Partial<Address> a updateAddress
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

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await deleteAddress(addressId)
      toast.success("Dirección eliminada correctamente")
    } catch (error) {
      console.error("Error deleting address:", error)
      toast.error("Error al eliminar la dirección")
    }
  }

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      await setDefaultAddress(addressId)
      toast.success("Dirección predeterminada actualizada")
    } catch (error) {
      console.error("Error setting default address:", error)
      toast.error("Error al establecer la dirección predeterminada")
    }
  }

  const renderAddressCard = (address: Address) => {
    const isCompanyAddress = address.company || address.address1.toLowerCase().includes("oficina")

    return (
      <Card key={address.id} className="mb-4 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-start p-4">
            <div
              className={`mt-1 p-2 rounded-full ${isCompanyAddress ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}
            >
              {isCompanyAddress ? <Building className="h-5 w-5" /> : <Home className="h-5 w-5" />}
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {address.addressType === AddressType.shipping
                      ? "Dirección de envío"
                      : address.addressType === AddressType.billing
                        ? "Dirección de facturación"
                        : "Dirección de envío y facturación"}
                  </span>
                  {address.isDefault && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      Predeterminada
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{address.address1}</p>
              {address.address2 && <p className="text-sm text-muted-foreground">{address.address2}</p>}
              <p className="text-sm text-muted-foreground">
                {address.city}, {address.province || ""} {address.zip}
              </p>
              {address.phone && <p className="text-sm text-muted-foreground">Tel: {address.phone}</p>}
              {address.company && <p className="text-sm text-muted-foreground">Empresa: {address.company}</p>}
            </div>
          </div>
          <div className="bg-muted/30 p-2 flex justify-end gap-2 border-t">
     
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedAddress(address)
                setIsEditDialogOpen(true)
              }}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará permanentemente esta dirección de tu cuenta.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteAddress(address.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    )
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
          <DialogContent className="sm:max-w-[550px]">
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
          {shippingAddresses.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3">Direcciones de envío</h4>
              <div>{shippingAddresses.map(renderAddressCard)}</div>
            </div>
          )}

          {billingAddresses.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3">Direcciones de facturación</h4>
              <div>{billingAddresses.map(renderAddressCard)}</div>
            </div>
          )}
        </div>
      )}

      {/* Edit Address Dialog */}
      {selectedAddress && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Editar dirección</DialogTitle>
              <DialogDescription>Actualiza los detalles de tu dirección.</DialogDescription>
            </DialogHeader>
            <AddressForm onSubmit={handleEditAddress} isSubmitting={isSubmitting} initialData={selectedAddress} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
