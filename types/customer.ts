import { Timestamps } from './common';
import { Order } from './order';
import { Address, CreateAddressDto } from './address';

export interface Customer extends Timestamps {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  acceptsMarketing: boolean;
  orders: Order[];
  addresses?: Address[];
}

 