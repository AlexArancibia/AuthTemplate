import apiClient from "@/lib/axiosConfig"
import type { Country, State, City } from "@/types/location"
import { create } from "zustand"
import axios from "axios"

type Location = {
  countries: Country[]
  states: Record<string, State[]> // key: countryCode
  cities: Record<string, City[]>  // key: stateId
  fetchCountries: () => Promise<void>
  fetchStates: (countryCode: string) => Promise<void>
  fetchCities: (stateId: string) => Promise<void>
}

export const useGeographicDataStore = create<Location>((set, get) => ({
  countries: [],
  states: {},
  cities: {},

  async fetchCountries() {
    if (get().countries.length) return
    const res = await apiClient.get("/shipping-methods/geographic-data")
    set({ countries: res.data.data })
  },

  async fetchStates(countryCode: string) {
    if (get().states[countryCode]) return
    const res = await apiClient.get("/shipping-methods/geographic-data", {
      params: { countryCode }
    })
    set(state => ({
      states: { ...state.states, [countryCode]: res.data.data }
    }))
  },

  async fetchCities(stateId: string) {
    if (get().cities[stateId]) return
    const res = await apiClient.get("/shipping-methods/geographic-data", {
      params: { stateId }
    })
    set(state => ({
      cities: { ...state.cities, [stateId]: res.data.data }
    }))
  }
}))