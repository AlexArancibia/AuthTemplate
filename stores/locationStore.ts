import apiClient from "@/lib/axiosConfig"
import type { Country, State, City } from "@/types/location"
import { create } from "zustand"
import axios from "axios"

type Location = {
  countries: Country[]
  states: Record<string, State[]> // key: countryId
  cities: Record<string, City[]>  // key: stateId
  fetchCountries: () => Promise<void>
  fetchStates: (countryId: string) => Promise<void>
  fetchCities: (countryId: string, stateId: string) => Promise<void>
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

  async fetchStates(countryId: string) {
    if (get().states[countryId]) return
    const res = await apiClient.get(`/shipping-methods/geographic-data/${countryId}`)
    set(state => ({
      states: { ...state.states, [countryId]: res.data.data }
    }))
  },

  async fetchCities(countryId: string, stateId: string) {
    if (get().cities[stateId]) return
    const res = await apiClient.get(`/shipping-methods/geographic-data/${countryId}/${stateId}`)
    set(state => ({
      cities: { ...state.cities, [stateId]: res.data.data }
    }))
  }
}))