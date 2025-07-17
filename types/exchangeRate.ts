import { Timestamps } from './common';
import { Currency } from './currency';

export interface ExchangeRate extends Timestamps {
  id: string;
  fromCurrency: Currency;
  fromCurrencyId: string;
  toCurrency: Currency;
  toCurrencyId: string;
  rate: number;
  effectiveDate: string;
}

 