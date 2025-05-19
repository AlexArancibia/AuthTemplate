import { ProductVariant } from './productVariant'; // Asumiendo que existe la interfaz ProductVariant
import { Store } from './store'; // Asumiendo que existe la interfaz Store

export interface FrequentlyBoughtTogether {
  id: string;
  storeId: string; // Relación con Store según schema
  store?: Store; // Relación opcional
  name: string;
  variants?: ProductVariant[]; // Relación opcional
  discountName?: string | null; // Hacer explícito que puede ser null
  discount?: number | null; // Hacer explícito que puede ser null
  createdAt: Date; // Cambiado a Date según Prisma
  updatedAt: Date; // Cambiado a Date según Prisma
}

 