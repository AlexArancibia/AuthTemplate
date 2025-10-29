import { Store } from "./store";
import { Currency } from "./currency";
import { Coupon } from "./coupon";
import { PaymentProvider, PaymentTransaction } from "./payments";
import { ShippingMethod } from "./shippingMethod";
import { ProductVariant } from "./productVariant";
import { OrderFinancialStatus, OrderFulfillmentStatus, ShippingStatus, PaymentStatus, InvoiceType } from "./common";


// Interfaces simplificadas eliminando campos innecesarios
export interface CustomerInfo {
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  taxId?: string;
}

export interface AddressInfo {
  name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

// Tipos base simplificados
export interface BaseOrder {
  id: string;
  temporalOrderId?: string;
  orderNumber: number;
  customerInfo: Record<string, any>;
  financialStatus?: OrderFinancialStatus | null;
  fulfillmentStatus?: OrderFulfillmentStatus | null;
  currencyId: string;
  totalPrice: number;
  subtotalPrice: number;
  totalTax: number;
  totalDiscounts: number;
  lineItems: OrderItem[];
  shippingAddress?: Record<string, any> | null;
  billingAddress?: Record<string, any> | null;
  couponId?: string | null;
  paymentProviderId?: string | null;
  paymentStatus?: PaymentStatus | null;
  paymentDetails?: Record<string, any> | null;
  shippingMethodId?: string | null;
  shippingStatus: ShippingStatus;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  estimatedDeliveryDate?: Date | null;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  customerNotes?: string | null;
  internalNotes?: string | null;
  source?: string | null;
  preferredDeliveryDate?: Date | null;
  businessName?: string | null;
  invoiceType?: InvoiceType | null;
  ruc?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Order completo con relaciones
export interface Order extends BaseOrder {
  storeId: string;
  store?: Store;
  currency: Currency;
  coupon?: Coupon | null;
  paymentProvider?: PaymentProvider | null;
  shippingMethod?: ShippingMethod | null;
  refunds: Refund[];
  paymentTransactions?: PaymentTransaction[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId?: string | null;
  variant?: ProductVariant | null;
  title: string;
  quantity: number;
  price: number;
  totalDiscount: number;
  refundLineItems: RefundLineItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Refund {
  id: string;
  orderId: string;
  amount: number;
  note?: string | null;
  restock: boolean;
  processedAt?: Date | null;
  lineItems: RefundLineItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RefundLineItem {
  id: string;
  refundId: string;
  orderItemId: string;
  quantity: number;
  amount: number;
  restocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderItemDto {
  variantId?: string; // Opcional según schema
  title: string;
  quantity: number;
  price: number;
  totalDiscount?: number;
}

// DTOs simplificados usando herencia
export interface CreateOrderDto extends Omit<BaseOrder, 'id' | 'createdAt' | 'updatedAt' | 'lineItems'> {
  lineItems: CreateOrderItemDto[];
}

export interface UpdateOrderDto extends Partial<Omit<BaseOrder, 'id' | 'createdAt' | 'updatedAt' | 'lineItems'>> {
  lineItems?: UpdateOrderItemDto[];
  addLineItems?: CreateOrderItemDto[];
  removeLineItemIds?: string[];
}

export interface UpdateOrderItemDto {
  variantId?: string | null; // Opcional según schema
  title?: string;
  quantity?: number;
  price?: number;
  totalDiscount?: number;
}

export interface CreateRefundDto {
  orderId: string;
  amount: number;
  note?: string;
  restock: boolean;
  lineItems: Array<{
    orderItemId: string;
    quantity: number;
    amount: number;
    restocked: boolean;
  }>;
}

// Tipos simplificados para estadísticas
export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  fulfilledOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  recentOrders: Pick<Order, 'id' | 'orderNumber' | 'totalPrice' | 'financialStatus' | 'fulfillmentStatus' | 'createdAt' | 'currency' | 'lineItems'>[];
}

export interface OrderStatusUpdate {
  financialStatus?: OrderFinancialStatus;
  fulfillmentStatus?: OrderFulfillmentStatus;
  paymentStatus?: PaymentStatus;
  shippingStatus?: ShippingStatus;
}