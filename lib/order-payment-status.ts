import { OrderFinancialStatus } from "@/types/common"

type OrderPaymentStatusSource = {
  financialStatus?: string | null
  paymentStatus?: string | null
  paymentDetails?: Record<string, any> | null
  paymentProvider?: {
    type?: string | null
    name?: string | null
  } | null
}

const isCompletedValue = (value: unknown) =>
  typeof value === "string" && value.toUpperCase() === "COMPLETED"

export const isPayPalPaymentSuccessful = (order: OrderPaymentStatusSource) => {
  const details = order.paymentDetails ?? {}
  const providerType = order.paymentProvider?.type?.toUpperCase()
  const providerName = order.paymentProvider?.name?.toLowerCase()
  const detailsProvider = typeof details.provider === "string" ? details.provider.toUpperCase() : null
  const isPayPal =
    providerType === "PAYPAL" ||
    detailsProvider === "PAYPAL" ||
    providerName?.includes("paypal")

  if (!isPayPal) {
    return false
  }

  const wasMarkedPaidByBackend =
    details.markedPaidBy === "paypal-server" ||
    typeof details.paypalVerifiedAt === "string" ||
    isCompletedValue(order.paymentStatus) ||
    isCompletedValue(details.paymentStatus)

  return Boolean(details.paymentSuccessful) && wasMarkedPaidByBackend
}

export const isOrderPaymentSuccessful = (order: OrderPaymentStatusSource) =>
  order.financialStatus === OrderFinancialStatus.PAID || isPayPalPaymentSuccessful(order)

export const getOrderPaymentStatusLabel = (order: OrderPaymentStatusSource) => {
  if (isOrderPaymentSuccessful(order)) {
    return "Pago exitoso"
  }

  if (order.financialStatus === OrderFinancialStatus.VOIDED) {
    return "Pago fallido"
  }

  if (order.financialStatus === OrderFinancialStatus.REFUNDED) {
    return "Reembolsado"
  }

  return "Pago pendiente"
}
