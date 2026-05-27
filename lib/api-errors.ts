import type { AxiosError } from "axios"

type ApiErrorBody = {
  message?: string | string[]
  error?: string
}

export function getApiErrorMessage(error: unknown, fallback = "Error inesperado"): string {
  if (!error || typeof error !== "object") return fallback

  const axiosError = error as AxiosError<ApiErrorBody>
  const data = axiosError.response?.data

  if (typeof data === "string" && data.trim()) return data

  if (data && typeof data === "object" && data.message) {
    if (Array.isArray(data.message)) {
      return data.message.filter(Boolean).join(". ")
    }
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export function isStaleCartVariantError(message: string): boolean {
  const lower = message.toLowerCase()
  return (
    lower.includes("variant") &&
    (lower.includes("not found") || lower.includes("does not belong to store"))
  )
}

export function getCheckoutOrderErrorMessage(error: unknown): string {
  const message = getApiErrorMessage(error, "")

  if (isStaleCartVariantError(message)) {
    return "Hay productos en tu carrito que ya no están disponibles. Quítalos del carrito, vuelve a agregarlos desde la tienda e intenta de nuevo."
  }

  if (message) return message

  return "Error al procesar el pedido. Por favor, intenta nuevamente."
}

export function isRetryableOrderError(error: unknown): boolean {
  return !isStaleCartVariantError(getApiErrorMessage(error, ""))
}
