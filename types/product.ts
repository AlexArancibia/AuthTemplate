import { ProductStatus } from './common';
import { Category } from './category';
import { Collection } from './collection';
import { Store } from './store'; // Asumiendo que existe la interfaz Store
import {   ProductVariant } from './productVariant';
import { Coupon } from './coupon';

export interface Product {
  id: string;
  storeId: string; // Añadido según schema
  store?: Store; // Relación opcional
  title: string;
  description?: string | null;
  slug: string;
  vendor?: string | null;
  allowBackorder: boolean;
  releaseDate?: Date | null; // Añadido según schema
  status: ProductStatus;
  viewCount?: number | null; // Añadido según schema
  restockThreshold?: number | null; // Añadido según schema
  restockNotify?: boolean | null; // Añadido según schema
  categories?: Category[]; // Relación opcional
  variants: ProductVariant[]; // Relación opcional
  imageUrls: string[];
  collections?: Collection[]; // Relación opcional
  metaTitle?: string | null;
  metaDescription?: string | null;
  coupons?: Coupon[]; // Relación opcional
  createdAt: Date; // Cambiado a Date
  updatedAt: Date; // Cambiado a Date
}

 