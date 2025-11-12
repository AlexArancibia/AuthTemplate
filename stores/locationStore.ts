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

const pickArray = <T extends Country | State | City>(
  payload: unknown,
  fallbackKey: "countries" | "states" | "cities"
): T[] => {
  if (!payload) return []

  if (Array.isArray(payload)) {
    return payload as T[]
  }

  if (Array.isArray((payload as any)?.data)) {
    return (payload as any).data as T[]
  }

  if (Array.isArray((payload as any)?.[fallbackKey])) {
    return (payload as any)[fallbackKey] as T[]
  }

  return []
}

export const useGeographicDataStore = create<Location>((set, get) => ({
  countries: [],
  states: {},
  cities: {},

  async fetchCountries() {
    if (get().countries.length) return
    const res = await apiClient.get("/shipping-methods/geographic-data")
    const countries = pickArray<Country>(res?.data?.data, "countries")

    set({ countries })
  },

  async fetchStates(countryId: string) {
    if (get().states[countryId]) return
    const res = await apiClient.get(`/shipping-methods/geographic-data/${countryId}`)
    const states = pickArray<State>(res?.data?.data, "states")

    set(state => ({
      states: { ...state.states, [countryId]: states }
    }))
  },

  async fetchCities(countryId: string, stateId: string) {
    if (get().cities[stateId]) return
    const res = await apiClient.get(`/shipping-methods/geographic-data/${countryId}/${stateId}`)
    const cities = pickArray<City>(res?.data?.data, "cities")

    set(state => ({
      cities: { ...state.cities, [stateId]: cities }
    }))
  }
}))