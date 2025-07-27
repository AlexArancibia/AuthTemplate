// src/stores/currency.ts
import { create } from "zustand"

export type CurrencyOption = {
  id: string
  code: string
  name: string
  symbol: string
  label: string
}

interface CurrencyState {
  selectedCurrencyId: string
  acceptedCurrencies: CurrencyOption[]
  setSelectedCurrencyId: (id: string) => void
  setAcceptedCurrencies: (currencies: CurrencyOption[]) => void
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  selectedCurrencyId: "",
  acceptedCurrencies: [],

  setSelectedCurrencyId: (id) => {
    set({ selectedCurrencyId: id })
    localStorage.setItem("currency", id)
  },

  setAcceptedCurrencies: (currencies) => {
    set({ acceptedCurrencies: currencies })
  },
}))
