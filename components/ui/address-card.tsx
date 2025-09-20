"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroupItem } from "@/components/ui/radio-group"
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
} from "@/components/ui/dialog"
import { Home, Building, Edit, Trash2, Star } from "lucide-react"
import { AddressForm } from "@/components/dashboard/address-form"
import { toast } from "sonner"
import type { Address } from "@/stores/userStore"

interface AddressCardProps {
  address: Address
  isSelected?: boolean
  onSelect?: () => void
  onEdit?: (address: Address) => void
  onDelete?: (addressId: string) => void
  onSetDefault?: (addressId: string) => void
  showRadioButton?: boolean
  showEditDeleteButtons?: boolean
  variant?: "dashboard" | "checkout"
  isSubmitting?: boolean
}

export function AddressCard({
  address,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  showRadioButton = false,
  showEditDeleteButtons = true,
  variant = "dashboard",
  isSubmitting = false,
}: AddressCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const isCompanyAddress = address.company || address.address1.toLowerCase().includes("oficina")

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(address)
    } else {
      setIsEditDialogOpen(true)
    }
  }

  const handleDeleteClick = async (addressId: string) => {
    if (onDelete) {
      try {
        await onDelete(addressId)
        // El toast se maneja en el componente padre
      } catch (error) {
        console.error("Error deleting address:", error)
        toast.error("Error al eliminar la dirección")
      }
    }
  }

  const handleEditSubmit = async (data: Record<string, any>) => {
    try {
      // Llamar a la función onEdit si está disponible
      if (onEdit) {
        await onEdit(data as Address)
        toast.success("Dirección actualizada correctamente")
        setIsEditDialogOpen(false)
      } else {
        // Si no hay función onEdit, hacer la actualización directamente
        const response = await fetch(`/api/addresses/${address.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error('Error al actualizar la dirección')
        }

        toast.success("Dirección actualizada correctamente")
        setIsEditDialogOpen(false)
        
        // Recargar la página para actualizar los datos
        window.location.reload()
      }
    } catch (error) {
      console.error("Error updating address:", error)
      toast.error("Error al actualizar la dirección")
    }
  }

  const handleSetDefaultClick = () => {
    if (onSetDefault) {
      onSetDefault(address.id)
    }
  }

  const cardContent = (
    <CardContent className={variant === "checkout" ? "p-4" : "p-0"}>
      <div className={variant === "checkout" ? "flex justify-between items-start" : "flex items-start p-4"}>
        <div 
          className={`flex items-start gap-3 ${variant === "checkout" ? "flex-1 cursor-pointer" : ""}`}
          onClick={variant === "checkout" ? onSelect : undefined}
        >
          <div className={`mt-1 p-1 rounded-full ${
            isSelected 
              ? "bg-primary text-white" 
              : isCompanyAddress 
                ? "bg-blue-50 text-blue-600" 
                : "bg-green-50 text-green-600"
          }`}>
            {isCompanyAddress ? (
              // Empresa: mostrar edificio (Building)
              <Building className="h-4 w-4" />
            ) : (
              // Residencial: mostrar casa (Home)
              <Home className="h-4 w-4" />
            )}
          </div>
          <div className={variant === "checkout" ? "flex-1" : ""}>
            {variant === "dashboard" && (
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {address.addressType === "shipping"
                    ? "Dirección de envío"
                    : address.addressType === "billing"
                      ? "Dirección de facturación"
                      : "Dirección de envío y facturación"}
                </span>
                {address.isDefault && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    Predeterminada
                  </Badge>
                )}
              </div>
            )}
            <p className="text-sm text-muted-foreground">{address.address1}</p>
            {address.address2 && <p className="text-sm text-muted-foreground">{address.address2}</p>}
            <p className="text-sm text-muted-foreground">
              {address.city}, {address.province} {address.zip}
            </p>
            {address.phone && <p className="text-sm text-muted-foreground">{address.phone}</p>}
            {address.company && <p className="text-sm text-muted-foreground">Empresa: {address.company}</p>}
            {variant === "checkout" && address.isDefault && (
              <Badge className="mt-1 bg-primary/10 text-primary">Predeterminada</Badge>
            )}
          </div>
        </div>
        
        {variant === "checkout" && (
          <div className="flex items-center gap-2">
            {showRadioButton && (
              <RadioGroupItem
                value={address.id}
                id={`address-${address.id}`}
                className="mt-1"
                checked={isSelected}
              />
            )}
            {showEditDeleteButtons && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditClick()
                  }}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1 h-8 w-8"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
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
                        onClick={() => handleDeleteClick(address.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        )}
      </div>
      
      {variant === "dashboard" && showEditDeleteButtons && (
        <div className="bg-muted/30 p-2 flex justify-end gap-2 border-t">
          {!address.isDefault && onSetDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSetDefaultClick}
              disabled={isSubmitting}
              className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 disabled:opacity-50"
            >
              <Star className="h-4 w-4 mr-1" />
              Predeterminada
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditClick}
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
                  onClick={() => handleDeleteClick(address.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </CardContent>
  )

  return (
    <>
      <Card
        className={`mb-3 transition-all ${
          variant === "checkout" 
            ? isSelected 
              ? "ring-2 ring-primary" 
              : "hover:border-primary/50"
            : "overflow-hidden"
        }`}
        onClick={variant === "dashboard" ? onSelect : undefined}
      >
        {cardContent}
      </Card>

      {/* Dialog para editar dirección */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar dirección</DialogTitle>
            <DialogDescription>
              Modifica los datos de tu dirección. Los cambios se aplicarán inmediatamente.
            </DialogDescription>
          </DialogHeader>
          <AddressForm
            onSubmit={handleEditSubmit}
            isSubmitting={isSubmitting}
            initialData={address}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

