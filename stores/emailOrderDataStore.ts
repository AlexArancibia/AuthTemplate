import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Order } from '@/types/order'

interface EmailOrderDataState {
  emailOrderDataPersist: Order | null;
  setEmailOrderDataPersist: (data: Order) => void;
  clearEmailOrderDataPersist: () => void;
}

export const useEmailOrderDataStore = create<EmailOrderDataState>()(
  persist(
    (set) => ({
      emailOrderDataPersist: null,
      setEmailOrderDataPersist: (data) => set({ emailOrderDataPersist: data }),
      clearEmailOrderDataPersist: () => set({ emailOrderDataPersist: null }),
    }),
    {
      name: 'emailOrderData', // key en localStorage
    }
  )
)
