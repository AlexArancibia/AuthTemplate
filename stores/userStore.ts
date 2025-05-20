import { create } from "zustand"
import { db } from "@/lib/db"
import type { Role, AddressType } from "@prisma/client"

// Tipos para el usuario y sus relaciones
export interface User {
  id: string
  name: string | null
  email: string
  password?: string | null // Opcional para no exponer en cliente
  emailVerified: Date | null
  image: string | null
  role: Role
  firstName: string | null
  lastName: string | null
  phone: string | null
  company: string | null
  taxId: string | null
  acceptsMarketing: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Account {
  userId: string
  type: string
  provider: string
  providerAccountId: string
  refresh_token: string | null
  access_token: string | null
  expires_at: number | null
  token_type: string | null
  scope: string | null
  id_token: string | null
  session_state: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  id: string
  userId: string
  isDefault: boolean
  addressType: AddressType
  address1: string
  address2: string | null
  city: string
  province: string | null
  zip: string
  country: string
  phone: string | null
  company: string | null
  createdAt: Date
  updatedAt: Date
}

// Tipo para usuario con sus relaciones
export interface UserWithRelations extends User {
  accounts?: Account[]
  addresses?: Address[]
}

// Tipo para actualización de usuario
export type UserUpdateData = Partial<Omit<User, "id" | "password" | "createdAt" | "updatedAt" | "emailVerified">>

// Tipo para creación de dirección
export interface AddressCreateData {
  addressType: AddressType
  address1: string
  address2?: string | null
  city: string
  province?: string | null
  zip: string
  country: string
  phone?: string | null
  company?: string | null
  isDefault?: boolean
}

// Tipo para actualización de dirección
export type AddressUpdateData = Partial<Omit<AddressCreateData, "addressType">>

// Interfaz para el store de usuarios
interface UserStore {
  // Estado
  currentUser: UserWithRelations | null
  loading: boolean
  error: string | null
  addressLoading: boolean
  addressError: string | null

  // Métodos para usuario
  fetchUserById: (userId: string) => Promise<UserWithRelations | null>
  updateUserById: (userId: string, data: UserUpdateData) => Promise<UserWithRelations | null>
  clearUserData: () => void

  // Métodos para direcciones
  createAddress: (userId: string, data: AddressCreateData) => Promise<Address>
  updateAddress: (addressId: string, data: AddressUpdateData) => Promise<Address>
  deleteAddress: (addressId: string) => Promise<void>
  setDefaultAddress: (addressId: string) => Promise<Address>
}

export const useUserStore = create<UserStore>((set, get) => ({
  // Estado inicial
  currentUser: null,
  loading: false,
  error: null,
  addressLoading: false,
  addressError: null,

  // Método para obtener usuario por ID
  fetchUserById: async (userId: string) => {
    // Verificar si ya tenemos el usuario en caché y es el mismo ID
    const { currentUser } = get()
    if (currentUser && currentUser.id === userId) {
      console.log(`[USER_STORE] Using cached user data for ID: ${userId}`)
      return currentUser
    }

    set({ loading: true, error: null })

    try {
      console.log(`[USER_STORE] Fetching user data for ID: ${userId}`)

      // Consulta a Prisma para obtener el usuario con todas sus relaciones
      const user = await db.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          accounts: true,
          addresses: {
            orderBy: {
              isDefault: "desc", // Ordenar direcciones con la predeterminada primero
            },
          },
        },
      })

      if (!user) {
        console.log(`[USER_STORE] User not found with ID: ${userId}`)
        set({ loading: false, error: "Usuario no encontrado" })
        return null
      }

      console.log(`[USER_STORE] User data fetched successfully for: ${user.name || user.email}`)

      // Eliminar el campo password por seguridad antes de guardarlo en el estado
      const { password, ...safeUser } = user

      // Actualizar el estado con el usuario obtenido
      set({
        currentUser: safeUser as UserWithRelations,
        loading: false,
        error: null,
      })

      return safeUser as UserWithRelations
    } catch (error: any) {
      console.error("[USER_STORE] Error fetching user data:", error)

      // Manejar errores específicos de Prisma
      const errorMessage = error.message || "Error al obtener datos del usuario"
      set({ loading: false, error: errorMessage })

      throw new Error(`Error fetching user: ${errorMessage}`)
    }
  },

  // Método para actualizar usuario por ID
  updateUserById: async (userId: string, data: UserUpdateData) => {
    set({ loading: true, error: null })

    try {
      console.log(`[USER_STORE] Updating user data for ID: ${userId}`, data)

      // Verificar que el usuario existe antes de actualizarlo
      const existingUser = await db.user.findUnique({
        where: { id: userId },
      })

      if (!existingUser) {
        const errorMsg = `Usuario con ID ${userId} no encontrado`
        console.error(`[USER_STORE] ${errorMsg}`)
        set({ loading: false, error: errorMsg })
        return null
      }

      // Actualizar el usuario en la base de datos
      const updatedUser = await db.user.update({
        where: { id: userId },
        data,
        include: {
          accounts: true,
          addresses: {
            orderBy: {
              isDefault: "desc",
            },
          },
        },
      })

      console.log(`[USER_STORE] User updated successfully: ${updatedUser.name || updatedUser.email}`)

      // Eliminar el campo password por seguridad
      const { password, ...safeUser } = updatedUser

      // Actualizar el estado con el usuario actualizado
      set({
        currentUser: safeUser as UserWithRelations,
        loading: false,
        error: null,
      })

      return safeUser as UserWithRelations
    } catch (error: any) {
      console.error("[USER_STORE] Error updating user:", error)

      // Manejar errores específicos de Prisma
      let errorMessage = "Error al actualizar el usuario"

      // Detectar errores comunes de Prisma
      if (error.code === "P2002") {
        errorMessage = "El email ya está en uso por otro usuario"
      } else if (error.code === "P2025") {
        errorMessage = "Usuario no encontrado"
      } else if (error.message) {
        errorMessage = error.message
      }

      set({ loading: false, error: errorMessage })
      throw new Error(`Error updating user: ${errorMessage}`)
    }
  },

  // Método para limpiar los datos del usuario actual
  clearUserData: () => {
    set({
      currentUser: null,
      error: null,
      addressError: null,
    })
    console.log("[USER_STORE] User data cleared")
  },

  // MÉTODOS PARA GESTIÓN DE DIRECCIONES

  // Método para crear una nueva dirección
  createAddress: async (userId: string, data: AddressCreateData) => {
    set({ addressLoading: true, addressError: null })

    try {
      console.log(`[USER_STORE] Creating new address for user ID: ${userId}`, data)

      // Verificar que el usuario existe
      const user = await db.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new Error(`Usuario con ID ${userId} no encontrado`)
      }

      // Si la dirección es predeterminada, actualizar otras direcciones del mismo tipo
      if (data.isDefault) {
        await db.address.updateMany({
          where: {
            userId,
            addressType: data.addressType,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        })
      }

      // Crear la nueva dirección
      const newAddress = await db.address.create({
        data: {
          ...data,
          userId,
        },
      })

      console.log(`[USER_STORE] Address created successfully with ID: ${newAddress.id}`)

      // Actualizar el estado del usuario con la nueva dirección
      const { currentUser } = get()
      if (currentUser && currentUser.id === userId) {
        const updatedAddresses = [...(currentUser.addresses || []), newAddress]

        // Ordenar direcciones con las predeterminadas primero
        updatedAddresses.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))

        set({
          currentUser: {
            ...currentUser,
            addresses: updatedAddresses,
          },
          addressLoading: false,
          addressError: null,
        })
      }

      return newAddress
    } catch (error: any) {
      console.error("[USER_STORE] Error creating address:", error)

      const errorMessage = error.message || "Error al crear la dirección"
      set({ addressLoading: false, addressError: errorMessage })

      throw new Error(`Error creating address: ${errorMessage}`)
    }
  },

  // Método para actualizar una dirección existente
  updateAddress: async (addressId: string, data: AddressUpdateData) => {
    set({ addressLoading: true, addressError: null })

    try {
      console.log(`[USER_STORE] Updating address with ID: ${addressId}`, data)

      // Obtener la dirección actual para verificar el usuario y tipo
      const currentAddress = await db.address.findUnique({
        where: { id: addressId },
      })

      if (!currentAddress) {
        throw new Error(`Dirección con ID ${addressId} no encontrada`)
      }

      // Verificar que la dirección pertenece al usuario actual
      const { currentUser } = get()
      if (currentUser && currentAddress.userId !== currentUser.id) {
        throw new Error("No tienes permiso para modificar esta dirección")
      }

      // Si se está estableciendo como predeterminada, actualizar otras direcciones del mismo tipo
      if (data.isDefault) {
        await db.address.updateMany({
          where: {
            userId: currentAddress.userId,
            addressType: currentAddress.addressType,
            isDefault: true,
            id: { not: addressId },
          },
          data: {
            isDefault: false,
          },
        })
      }

      // Actualizar la dirección
      const updatedAddress = await db.address.update({
        where: { id: addressId },
        data,
      })

      console.log(`[USER_STORE] Address updated successfully: ${updatedAddress.id}`)

      // Actualizar el estado del usuario con la dirección actualizada
      if (currentUser) {
        const updatedAddresses = currentUser.addresses
          ? currentUser.addresses.map((addr) => (addr.id === addressId ? updatedAddress : addr))
          : [updatedAddress]

        // Ordenar direcciones con las predeterminadas primero
        updatedAddresses.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))

        set({
          currentUser: {
            ...currentUser,
            addresses: updatedAddresses,
          },
          addressLoading: false,
          addressError: null,
        })
      }

      return updatedAddress
    } catch (error: any) {
      console.error("[USER_STORE] Error updating address:", error)

      const errorMessage = error.message || "Error al actualizar la dirección"
      set({ addressLoading: false, addressError: errorMessage })

      throw new Error(`Error updating address: ${errorMessage}`)
    }
  },

  // Método para eliminar una dirección
  deleteAddress: async (addressId: string) => {
    set({ addressLoading: true, addressError: null })

    try {
      console.log(`[USER_STORE] Deleting address with ID: ${addressId}`)

      // Obtener la dirección para verificar el usuario
      const address = await db.address.findUnique({
        where: { id: addressId },
      })

      if (!address) {
        throw new Error(`Dirección con ID ${addressId} no encontrada`)
      }

      // Verificar que la dirección pertenece al usuario actual
      const { currentUser } = get()
      if (currentUser && address.userId !== currentUser.id) {
        throw new Error("No tienes permiso para eliminar esta dirección")
      }

      // Eliminar la dirección
      await db.address.delete({
        where: { id: addressId },
      })

      console.log(`[USER_STORE] Address deleted successfully: ${addressId}`)

      // Actualizar el estado del usuario eliminando la dirección
      if (currentUser && currentUser.addresses) {
        const updatedAddresses = currentUser.addresses.filter((addr) => addr.id !== addressId)

        set({
          currentUser: {
            ...currentUser,
            addresses: updatedAddresses,
          },
          addressLoading: false,
          addressError: null,
        })
      }
    } catch (error: any) {
      console.error("[USER_STORE] Error deleting address:", error)

      const errorMessage = error.message || "Error al eliminar la dirección"
      set({ addressLoading: false, addressError: errorMessage })

      throw new Error(`Error deleting address: ${errorMessage}`)
    }
  },

  // Método para establecer una dirección como predeterminada
  setDefaultAddress: async (addressId: string) => {
    set({ addressLoading: true, addressError: null })

    try {
      console.log(`[USER_STORE] Setting address ${addressId} as default`)

      // Obtener la dirección para verificar el usuario y tipo
      const address = await db.address.findUnique({
        where: { id: addressId },
      })

      if (!address) {
        throw new Error(`Dirección con ID ${addressId} no encontrada`)
      }

      // Verificar que la dirección pertenece al usuario actual
      const { currentUser } = get()
      if (currentUser && address.userId !== currentUser.id) {
        throw new Error("No tienes permiso para modificar esta dirección")
      }

      // Quitar el estado predeterminado de otras direcciones del mismo tipo
      await db.address.updateMany({
        where: {
          userId: address.userId,
          addressType: address.addressType,
          isDefault: true,
          id: { not: addressId },
        },
        data: {
          isDefault: false,
        },
      })

      // Establecer esta dirección como predeterminada
      const updatedAddress = await db.address.update({
        where: { id: addressId },
        data: {
          isDefault: true,
        },
      })

      console.log(`[USER_STORE] Address set as default successfully: ${addressId}`)

      // Actualizar el estado del usuario con las direcciones actualizadas
      if (currentUser && currentUser.addresses) {
        const updatedAddresses = currentUser.addresses.map((addr) => {
          if (addr.id === addressId) {
            return { ...addr, isDefault: true }
          }
          if (addr.addressType === address.addressType && addr.isDefault) {
            return { ...addr, isDefault: false }
          }
          return addr
        })

        // Ordenar direcciones con las predeterminadas primero
        updatedAddresses.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))

        set({
          currentUser: {
            ...currentUser,
            addresses: updatedAddresses,
          },
          addressLoading: false,
          addressError: null,
        })
      }

      return updatedAddress
    } catch (error: any) {
      console.error("[USER_STORE] Error setting default address:", error)

      const errorMessage = error.message || "Error al establecer la dirección predeterminada"
      set({ addressLoading: false, addressError: errorMessage })

      throw new Error(`Error setting default address: ${errorMessage}`)
    }
  },
}))
