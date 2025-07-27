import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { CurrencyOption } from "@/stores/currency"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatCurrency(
  amount: number | null | undefined,
  currency?: CurrencyOption
): string {
  if (amount === null || amount === undefined || !currency) {
    return "-"
  }

  const formattedAmount = new Intl.NumberFormat("es-PE", {
    style: "decimal",
    minimumFractionDigits: 2,
  }).format(amount)

  return `${currency.symbol}${formattedAmount}`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}
