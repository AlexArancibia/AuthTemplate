// utils/getPriceAndSymbol.ts
import type { ProductVariant } from "@/types/productVariant"
import type { CurrencyOption } from "@/stores/currency"

export const getPriceAndSymbol = (
  prices: ProductVariant["prices"] | undefined,
  selectedCurrencyId: string,
  acceptedCurrencies: CurrencyOption[],
  defaultCurrency?: CurrencyOption
): { price: number; symbol: string } => {
  // Buscar por moneda seleccionada
  let priceObj = prices?.find((p) => p.currencyId === selectedCurrencyId)

  // Fallback a moneda por defecto si no se encuentra
  if (!priceObj && defaultCurrency) {
    priceObj = prices?.find((p) => p.currencyId === defaultCurrency.id)
  }

  const price = priceObj?.price ? Number(priceObj.price) : 0
  const symbol =
    priceObj?.currency?.symbol ||
    acceptedCurrencies.find((c) => c.id === selectedCurrencyId)?.symbol ||
    defaultCurrency?.symbol ||
    ""

  return { price, symbol }
}
