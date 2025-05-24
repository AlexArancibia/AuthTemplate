import { create } from "zustand"
import type { Order } from "@/types/order"
import type { ShopSettings } from "@/types/store"

// Interfaces para el store de email
interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

interface EmailResponse {
  success: boolean
  message: string
  messageId?: string
  adminMessageId?: string
  clientMessageId?: string
}

interface EmailHistoryItem {
  id: string
  type: "client_order" | "admin_order" | "contact_form"
  to?: string
  subject: string
  sentAt: Date
  messageId?: string
  success: boolean
  error?: string
}

interface EmailState {
  // Estados de carga
  loading: boolean
  sendingToClient: boolean
  sendingToAdmin: boolean
  sendingContactForm: boolean

  // Estados de error
  error: string | null
  clientEmailError: string | null
  adminEmailError: string | null
  contactFormError: string | null

  // Historial de emails enviados (opcional)
  emailHistory: EmailHistoryItem[]

  // Configuración
  emailConfig: {
    isConfigured: boolean
    lastVerified: Date | null
  }
}

interface EmailActions {
  // Acciones principales
  sendOrderConfirmationToClient: (order: Order, shopSettings?: ShopSettings) => Promise<EmailResponse>
  sendOrderNotificationToAdmin: (order: Order, shopSettings?: ShopSettings) => Promise<EmailResponse>
  sendContactForm: (formData: ContactFormData, shopSettings?: ShopSettings) => Promise<EmailResponse>

  // Acciones de utilidad
  verifyEmailConfiguration: () => Promise<boolean>
  clearErrors: () => void
  clearHistory: () => void
  addToHistory: (item: Omit<EmailHistoryItem, "id" | "sentAt">) => void

  // Acción combinada para enviar ambos emails de pedido
  sendOrderEmails: (
    order: Order,
    shopSettings?: ShopSettings,
  ) => Promise<{
    clientResult: EmailResponse
    adminResult: EmailResponse
  }>
}

type EmailStore = EmailState & EmailActions

export const useEmailStore = create<EmailStore>((set, get) => ({
  // Estado inicial
  loading: false,
  sendingToClient: false,
  sendingToAdmin: false,
  sendingContactForm: false,

  error: null,
  clientEmailError: null,
  adminEmailError: null,
  contactFormError: null,

  emailHistory: [],

  emailConfig: {
    isConfigured: false,
    lastVerified: null,
  },

  // Función para agregar al historial
  addToHistory: (item: Omit<EmailHistoryItem, "id" | "sentAt">) => {
    const historyItem: EmailHistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sentAt: new Date(),
    }

    set((state) => ({
      emailHistory: [historyItem, ...state.emailHistory].slice(0, 50), // Mantener solo los últimos 50
    }))
  },

  // Enviar confirmación de pedido al cliente
  sendOrderConfirmationToClient: async (order: Order, shopSettings?: ShopSettings) => {
    set({ sendingToClient: true, clientEmailError: null })

    try {
      const response = await fetch("/api/email/send-to-client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order, shopSettings }),
      })

      const result: EmailResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Error enviando email al cliente")
      }

      // Agregar al historial
      get().addToHistory({
        type: "client_order",
        to: (order.customerInfo as any)?.email,
        subject: `Confirmación de Pedido #${order.orderNumber}`,
        messageId: result.messageId,
        success: true,
      })

      set({ sendingToClient: false })
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"

      // Agregar al historial como error
      get().addToHistory({
        type: "client_order",
        to: (order.customerInfo as any)?.email,
        subject: `Confirmación de Pedido #${order.orderNumber}`,
        success: false,
        error: errorMessage,
      })

      set({
        sendingToClient: false,
        clientEmailError: errorMessage,
      })

      throw error
    }
  },

  // Enviar notificación de pedido al administrador
  sendOrderNotificationToAdmin: async (order: Order, shopSettings?: ShopSettings) => {
    set({ sendingToAdmin: true, adminEmailError: null })

    try {
      const response = await fetch("/api/email/send-to-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order, shopSettings }),
      })

      const result: EmailResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Error enviando email al administrador")
      }

      // Agregar al historial
      get().addToHistory({
        type: "admin_order",
        subject: `Nuevo Pedido #${order.orderNumber}`,
        messageId: result.messageId,
        success: true,
      })

      set({ sendingToAdmin: false })
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"

      // Agregar al historial como error
      get().addToHistory({
        type: "admin_order",
        subject: `Nuevo Pedido #${order.orderNumber}`,
        success: false,
        error: errorMessage,
      })

      set({
        sendingToAdmin: false,
        adminEmailError: errorMessage,
      })

      throw error
    }
  },

  // Enviar formulario de contacto
  sendContactForm: async (formData: ContactFormData, shopSettings?: ShopSettings) => {
    set({ sendingContactForm: true, contactFormError: null })

    try {
      const response = await fetch("/api/email/contact-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, shopSettings }),
      })

      const result: EmailResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Error enviando formulario de contacto")
      }

      // Agregar al historial
      get().addToHistory({
        type: "contact_form",
        to: formData.email,
        subject: formData.subject,
        messageId: result.adminMessageId,
        success: true,
      })

      set({ sendingContactForm: false })
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"

      // Agregar al historial como error
      get().addToHistory({
        type: "contact_form",
        to: formData.email,
        subject: formData.subject,
        success: false,
        error: errorMessage,
      })

      set({
        sendingContactForm: false,
        contactFormError: errorMessage,
      })

      throw error
    }
  },

  // Verificar configuración de email
  verifyEmailConfiguration: async () => {
    set({ loading: true, error: null })

    try {
      const response = await fetch("/api/email/verify-config")
      const result = await response.json()

      const isConfigured = response.ok && result.success

      set({
        loading: false,
        emailConfig: {
          isConfigured,
          lastVerified: new Date(),
        },
      })

      return isConfigured
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error verificando configuración"

      set({
        loading: false,
        error: errorMessage,
        emailConfig: {
          isConfigured: false,
          lastVerified: new Date(),
        },
      })

      return false
    }
  },

  // Enviar ambos emails de pedido (cliente y administrador)
  sendOrderEmails: async (order: Order, shopSettings?: ShopSettings) => {
    set({ loading: true, error: null })

    try {
      // Ejecutar ambas operaciones en paralelo
      const [clientResult, adminResult] = await Promise.allSettled([
        get().sendOrderConfirmationToClient(order, shopSettings),
        get().sendOrderNotificationToAdmin(order, shopSettings),
      ])

      set({ loading: false })

      // Procesar resultados
      const clientResponse: EmailResponse =
        clientResult.status === "fulfilled"
          ? clientResult.value
          : { success: false, message: clientResult.reason?.message || "Error enviando al cliente" }

      const adminResponse: EmailResponse =
        adminResult.status === "fulfilled"
          ? adminResult.value
          : { success: false, message: adminResult.reason?.message || "Error enviando al administrador" }

      return {
        clientResult: clientResponse,
        adminResult: adminResponse,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error enviando emails de pedido"
      set({ loading: false, error: errorMessage })
      throw error
    }
  },

  // Limpiar errores
  clearErrors: () => {
    set({
      error: null,
      clientEmailError: null,
      adminEmailError: null,
      contactFormError: null,
    })
  },

  // Limpiar historial
  clearHistory: () => {
    set({ emailHistory: [] })
  },
}))

// Hook personalizado para obtener el estado de carga general
export const useEmailLoading = () => {
  return useEmailStore(
    (state) => state.loading || state.sendingToClient || state.sendingToAdmin || state.sendingContactForm,
  )
}

// Hook personalizado para obtener errores
export const useEmailErrors = () => {
  return useEmailStore((state) => ({
    hasErrors: !!(state.error || state.clientEmailError || state.adminEmailError || state.contactFormError),
    generalError: state.error,
    clientError: state.clientEmailError,
    adminError: state.adminEmailError,
    contactFormError: state.contactFormError,
  }))
}

// Hook personalizado para estadísticas del historial
export const useEmailStats = () => {
  return useEmailStore((state) => {
    const history = state.emailHistory
    const total = history.length
    const successful = history.filter((item) => item.success).length
    const failed = total - successful
    const successRate = total > 0 ? (successful / total) * 100 : 0

    const byType = {
      clientOrders: history.filter((item) => item.type === "client_order").length,
      adminOrders: history.filter((item) => item.type === "admin_order").length,
      contactForms: history.filter((item) => item.type === "contact_form").length,
    }

    return {
      total,
      successful,
      failed,
      successRate: Math.round(successRate),
      byType,
    }
  })
}

// Exportar tipos para uso en componentes
export type { ContactFormData, EmailResponse, EmailHistoryItem }
