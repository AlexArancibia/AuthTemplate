import { AddressType, Role } from "@/types/auth"
import { create } from "zustand"
 

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
  fetchUserByEmail: (email: string) => Promise<UserWithRelations | null>
  updateUserByEmail: (email: string, data: UserUpdateData) => Promise<UserWithRelations | null>
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

  // Método para obtener usuario por email mediante API
  fetchUserByEmail: async (email: string) => {
    // Verificar si ya tenemos el usuario en caché y es el mismo email
    const { currentUser } = get()
    if (currentUser && currentUser.email === email) {
      console.log(`[USER_STORE] Using cached user data for email: ${email}`)
      return currentUser
    }

    set({ loading: true, error: null })

    try {
      console.log(`[USER_STORE] Fetching user data for email: ${email}`)

      // Llamada a la API en lugar de consulta directa a Prisma
      const response = await fetch(`/api/users/by-email/${encodeURIComponent(email)}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error al obtener usuario: ${response.status}`)
      }

      const user = await response.json()

      if (!user) {
        console.log(`[USER_STORE] User not found with email: ${email}`)
        set({ loading: false, error: "Usuario no encontrado" })
        return null
      }

      console.log(`[USER_STORE] User data fetched successfully for: ${user.name || user.email}`)

      // Actualizar el estado con el usuario obtenido
      set({
        currentUser: user,
        loading: false,
        error: null,
      })

      return user
    } catch (error: any) {
      console.error("[USER_STORE] Error fetching user data:", error)

      const errorMessage = error.message || "Error al obtener datos del usuario"
      set({ loading: false, error: errorMessage })

      throw new Error(`Error fetching user: ${errorMessage}`)
    }
  },

  // Método para actualizar usuario por email mediante API
  updateUserByEmail: async (email: string, data: UserUpdateData) => {
    set({ loading: true, error: null })

    try {
      console.log(`[USER_STORE] Updating user data for email: ${email}`, data)

      // Llamada a la API en lugar de actualización directa en Prisma
      const response = await fetch(`/api/users/by-email/${encodeURIComponent(email)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error al actualizar usuario: ${response.status}`)
      }

      const updatedUser = await response.json()

      console.log(`[USER_STORE] User updated successfully: ${updatedUser.name || updatedUser.email}`)

      // Actualizar el estado con el usuario actualizado
      set({
        currentUser: updatedUser,
        loading: false,
        error: null,
      })

      return updatedUser
    } catch (error: any) {
      console.error("[USER_STORE] Error updating user:", error)

      // Manejar errores de la API
      let errorMessage = "Error al actualizar el usuario"
      if (error.message) {
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

  // MÉTODOS PARA GESTIÓN DE DIRECCIONES mediante API

  // Método para crear una nueva dirección
  createAddress: async (userId: string, data: AddressCreateData) => {
    set({ addressLoading: true, addressError: null })

    try {
      console.log(`[USER_STORE] Creating new address for user ID: ${userId}`, data)

      // Llamada a la API en lugar de creación directa en Prisma
      const response = await fetch(`/api/users/${userId}/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error al crear dirección: ${response.status}`)
      }

      const newAddress = await response.json()

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

      // Llamada a la API en lugar de actualización directa en Prisma
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error al actualizar dirección: ${response.status}`)
      }

      const updatedAddress = await response.json()

      console.log(`[USER_STORE] Address updated successfully: ${updatedAddress.id}`)

      // Actualizar el estado del usuario con la dirección actualizada
      const { currentUser } = get()
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

      // Llamada a la API en lugar de eliminación directa en Prisma
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error al eliminar dirección: ${response.status}`)
      }

      console.log(`[USER_STORE] Address deleted successfully: ${addressId}`)

      // Actualizar el estado del usuario eliminando la dirección
      const { currentUser } = get()
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

      // Llamada a la API en lugar de actualización directa en Prisma
      const response = await fetch(`/api/addresses/${addressId}/set-default`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error al establecer dirección predeterminada: ${response.status}`)
      }

      const updatedAddress = await response.json()

      console.log(`[USER_STORE] Address set as default successfully: ${addressId}`)

      // Actualizar el estado del usuario con las direcciones actualizadas
      const { currentUser } = get()
      if (currentUser && currentUser.addresses) {
        // Obtener el tipo de dirección actualizada
        const addressType = currentUser.addresses.find((addr) => addr.id === addressId)?.addressType

        const updatedAddresses = currentUser.addresses.map((addr) => {
          if (addr.id === addressId) {
            return { ...addr, isDefault: true }
          }
          // Solo actualizar el estado de predeterminada en direcciones del mismo tipo
          if (addressType && addr.addressType === addressType && addr.isDefault) {
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
