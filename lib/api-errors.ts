import type { AxiosError } from "axios"

type ApiErrorBody = {
  message?: string | string[]
  error?: string
}

export function getApiErrorMessage(error: unknown, fallback = "Error inesperado"): string {
  if (!error || typeof error !== "object") return fallback

  const axiosError = error as AxiosError<unknown>
  const data = axiosError.response?.data

  if (typeof data === "string") {
    const text = data.trim()
    if (text) return text
  }

  if (data && typeof data === "object" && "message" in data) {
    const body = data as ApiErrorBody
    if (Array.isArray(body.message)) {
      return body.message.filter(Boolean).join(". ")
    }
    if (typeof body.message === "string" && body.message.trim()) {
      return body.message
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
