import apiClient from "@/lib/axiosConfig"
import type { Country, State, City } from "@/types/location"
import { create } from "zustand"

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
    // La respuesta tiene estructura: { success, statusCode, message, data: { type, data: [...] } }
    const countries = res.data?.data?.data || res.data?.data || []
    set({ countries: Array.isArray(countries) ? countries : [] })
  },

  async fetchStates(countryId: string) {
    if (get().states[countryId]) return
    const res = await apiClient.get(`/shipping-methods/geographic-data/${countryId}`)
    // La respuesta tiene estructura: { success, statusCode, message, data: { type, data: [...] } }
    const states = res.data?.data?.data || res.data?.data || []
    set(state => ({
      states: { ...state.states, [countryId]: Array.isArray(states) ? states : [] }
    }))
  },

  async fetchCities(countryId: string, stateId: string) {
    if (get().cities[stateId]) return
    const res = await apiClient.get(`/shipping-methods/geographic-data/${countryId}/${stateId}`)
    // La respuesta tiene estructura: { success, statusCode, message, data: { type, data: [...] } }
    const cities = res.data?.data?.data || res.data?.data || []
    set(state => ({
      cities: { ...state.cities, [stateId]: Array.isArray(cities) ? cities : [] }
    }))
  }
}))