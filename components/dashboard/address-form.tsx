"use client"

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import type { Address, AddressCreateData } from "@/stores/userStore"
import { AddressType } from "@/types/auth"

interface AddressFormValues {
  addressType: AddressType
  address1: string
  address2?: string
  city: string
  province?: string
  zip: string
  country: string
  phone?: string
  company?: string
  isDefault: boolean
}

interface AddressFormProps {
  onSubmit: (data: AddressCreateData | Partial<Address>) => Promise<void>
  isSubmitting: boolean
  initialData?: Address
  isFirstAddress?: boolean
}

export function AddressForm({ onSubmit, isSubmitting, initialData, isFirstAddress = false }: AddressFormProps) {
  const form = useForm<AddressFormValues>({
    defaultValues: initialData
      ? {
          addressType: initialData.addressType,
          address1: initialData.address1,
          address2: initialData.address2 || "",
          city: initialData.city,
          province: initialData.province || "",
          zip: initialData.zip,
          country: initialData.country,
          phone: initialData.phone || "",
          company: initialData.company || "",
          isDefault: initialData.isDefault,
        }
      : {
          addressType: "SHIPPING" as AddressType, // Use the correct enum value
          address1: "",
          address2: "",
          city: "",
          province: "",
          zip: "",
          country: "PE",
          phone: "",
          company: "",
          isDefault: isFirstAddress, // Set default to true if it's the first address
        },
  })

  const {
    register,
    formState: { errors },
    control,
  } = form

  // Modificar la función submitHandler para manejar correctamente los tipos
  const submitHandler = async (data: AddressFormValues) => {
    // Si estamos editando una dirección existente (initialData existe)
    if (initialData) {
      // Pasamos los datos como Partial<Address>
      const addressData: Partial<Address> = {
        addressType: data.addressType,
        address1: data.address1,
        address2: data.address2 || undefined,
        city: data.city,
        province: data.province || undefined,
        zip: data.zip,
        country: data.country,
        phone: data.phone || undefined,
        company: data.company || undefined,
        isDefault: data.isDefault,
      }
      await onSubmit(addressData)
    } else {
      // Estamos creando una nueva dirección, pasamos como AddressCreateData
      const addressData: AddressCreateData = {
        addressType: data.addressType,
        address1: data.address1,
        address2: data.address2 || undefined,
        city: data.city,
        province: data.province || undefined,
        zip: data.zip,
        country: data.country,
        phone: data.phone || undefined,
        company: data.company || undefined,
        isDefault: data.isDefault,
      }
      await onSubmit(addressData)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitHandler)} className="space-y-6">
        <FormField
          control={control}
          name="addressType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de dirección</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="SHIPPING" />
                    </FormControl>
                    <FormLabel className="font-normal">Dirección de envío</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="BILLING" />
                    </FormControl>
                    <FormLabel className="font-normal">Dirección de facturación</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="BOTH" />
                    </FormControl>
                    <FormLabel className="font-normal">Ambos (envío y facturación)</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4">
          <FormItem>
            <FormLabel>Dirección</FormLabel>
            <FormControl>
              <Input
                placeholder="Calle, número, etc."
                {...register("address1", { required: "La dirección es requerida" })}
              />
            </FormControl>
            {errors.address1 && <FormMessage>{errors.address1.message}</FormMessage>}
          </FormItem>

          <FormItem>
            <FormLabel>Apartamento, suite, etc. (opcional)</FormLabel>
            <FormControl>
              <Input placeholder="Piso, interior, etc." {...register("address2")} />
            </FormControl>
          </FormItem>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormItem>
            <FormLabel>Ciudad</FormLabel>
            <FormControl>
              <Input placeholder="Ciudad" {...register("city", { required: "La ciudad es requerida" })} />
            </FormControl>
            {errors.city && <FormMessage>{errors.city.message}</FormMessage>}
          </FormItem>

          <FormItem>
            <FormLabel>Departamento/Provincia (opcional)</FormLabel>
            <FormControl>
              <Input placeholder="Departamento o provincia" {...register("province")} />
            </FormControl>
          </FormItem>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormItem>
            <FormLabel>Código postal</FormLabel>
            <FormControl>
              <Input placeholder="Código postal" {...register("zip", { required: "El código postal es requerido" })} />
            </FormControl>
            {errors.zip && <FormMessage>{errors.zip.message}</FormMessage>}
          </FormItem>

          <FormItem>
            <FormLabel>País</FormLabel>
            <FormControl>
              <Input placeholder="País" {...register("country", { required: "El país es requerido" })} />
            </FormControl>
            {errors.country && <FormMessage>{errors.country.message}</FormMessage>}
          </FormItem>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormItem>
            <FormLabel>Teléfono (opcional)</FormLabel>
            <FormControl>
              <Input placeholder="Teléfono de contacto" {...register("phone")} />
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel>Empresa (opcional)</FormLabel>
            <FormControl>
              <Input placeholder="Nombre de la empresa" {...register("company")} />
            </FormControl>
          </FormItem>
        </div>

        <FormField
          control={control}
          name="isDefault"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Establecer como dirección predeterminada</FormLabel>
                <FormDescription>Esta dirección se utilizará por defecto en el proceso de compra.</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Actualizar dirección" : "Agregar dirección"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
