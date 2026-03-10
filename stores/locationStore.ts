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

// Igual que anjsports: maneja distintos formatos de respuesta del API
const pickArray = <T extends Country | State | City>(
  payload: unknown,
  fallbackKey: "countries" | "states" | "cities"
): T[] => {
  if (!payload) return []
  if (Array.isArray(payload)) return payload as T[]
  if (Array.isArray((payload as any)?.data)) return (payload as any).data as T[]
  if (Array.isArray((payload as any)?.[fallbackKey])) return (payload as any)[fallbackKey] as T[]
  return []
}

export const useGeographicDataStore = create<Location>((set, get) => ({
  countries: [],
  states: {},
  cities: {},

  async fetchCountries() {
    if (get().countries.length) return
    const res = await apiClient.get("/shipping-methods/geographic-data")
    const countries = pickArray<Country>(res?.data?.data ?? res?.data, "countries")
    set({ countries })
  },

  async fetchStates(countryId: string) {
    if (get().states[countryId]) return
    const res = await apiClient.get(`/shipping-methods/geographic-data/${countryId}`)
    const data = pickArray<State>(res?.data?.data ?? res?.data, "states")
    set(state => ({ states: { ...state.states, [countryId]: data } }))
  },

  async fetchCities(countryId: string, stateId: string) {
    if (get().cities[stateId]) return
    const res = await apiClient.get(`/shipping-methods/geographic-data/${countryId}/${stateId}`)
    const data = pickArray<City>(res?.data?.data ?? res?.data, "cities")
    set(state => ({ cities: { ...state.cities, [stateId]: data } }))
  }
}))