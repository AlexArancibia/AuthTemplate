import { Timestamps } from './common';
import { ProductVariant } from './productVariant';
import { Currency } from './currency';

export interface VariantPrice extends Timestamps {
  id: string;
  variant?: ProductVariant;
  variantId: string;
  currency: Currency;
  currencyId: string;
  price: number;
}
 