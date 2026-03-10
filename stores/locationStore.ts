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
    const data = res.data?.data
    set({ countries: Array.isArray(data) ? data : [] })
  },

  async fetchStates(countryId: string) {
    if (get().states[countryId]) return
    const res = await apiClient.get(`/shipping-methods/geographic-data/${countryId}`)
    const data = res.data?.data
    set(state => ({
      states: { ...state.states, [countryId]: Array.isArray(data) ? data : [] }
    }))
  },

  async fetchCities(countryId: string, stateId: string) {
    if (get().cities[stateId]) return
    const res = await apiClient.get(`/shipping-methods/geographic-data/${countryId}/${stateId}`)
    const data = res.data?.data
    set(state => ({
      cities: { ...state.cities, [stateId]: Array.isArray(data) ? data : [] }
    }))
  }
}))