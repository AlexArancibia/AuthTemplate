// src/stores/currencySelected.ts
import { create } from "zustand";

export type CurrencyOption = {
  id: string;
  code: string;
  name: string;
  symbol: string;
  label: string;
};

interface CurrencyState {
  selectedCurrency: string;
  setSelectedCurrency: (code: string) => void;
  currencies: CurrencyOption[];
  setCurrencies: (list: CurrencyOption[]) => void;
}

export const useCurrencySelected = create<CurrencyState>((set) => ({
  selectedCurrency: "",
  currencies: [],
  setSelectedCurrency: (code) => {
    set({ selectedCurrency: code });
    localStorage.setItem("currency", code);
  },
  setCurrencies: (list) => set({ currencies: list }),
}));