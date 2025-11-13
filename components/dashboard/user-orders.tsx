"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"
import { OrderFinancialStatus, OrderFulfillmentStatus, ShippingStatus } from "@/types/common"
import { useMainStore } from "@/stores/mainStore"
import { Package, Truck, CreditCard, Eye, ShoppingBag, AlertCircle } from "lucide-react"
import type { Order } from "@/types/order"

const normalizeOrderAddresses = (order: Order) => {
  const shipping =
    (order.shippingAddress as any)?.shipping ?? order.shippingAddress ?? null

  const billing =
    (order.shippingAddress as any)?.billing ?? order.billingAddress ?? null

  return { shipping, billing }
}

interface UserOrdersProps {
  userId: string
  userEmail: string
}

const parseAmount = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

const formatAmount = (value: unknown): string => {
  return parseAmount(value).toFixed(2)
}

const PAGE_SIZE = 10

export function UserOrders({ userId, userEmail }: UserOrdersProps) {
  const { orders, fetchAllOrders, loading: ordersLoading, error: ordersError } = useMainStore()
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const requestAllOrders = useCallback(async () => {
    await fetchAllOrders({
      sortBy: "createdAt",
      sortOrder: "desc",
    })
  }, [fetchAllOrders])

  useEffect(() => {
    if (ordersLoading || orders.length > 0) {
      return
    }

    requestAllOrders().catch(() => {
      toast.error("Error al cargar los pedidos")
    })
  }, [ordersLoading, orders.length, requestAllOrders])

  const handleReload = useCallback(() => {
    setCurrentPage(1)
    requestAllOrders().catch(() => {
      toast.error("Error al cargar los pedidos")
    })
  }, [requestAllOrders])

  const normalizedUserEmail = userEmail?.trim().toLowerCase() || ""
  const userOrders = useMemo(() => {
    if (!Array.isArray(orders)) {
      return []
    }

    return orders.filter((order: any) => {
      const customerInfo = order?.customerInfo ?? {}

      const matchesUserId =
        typeof customerInfo?.userId === "string" && customerInfo.userId === userId

      const customerEmail =
        typeof customerInfo?.email === "string" ? customerInfo.email.trim().toLowerCase() : ""

      const fallbackEmail =
        typeof customerInfo?.contactEmail === "string"
          ? customerInfo.contactEmail.trim().toLowerCase()
          : ""

      const matchesEmail =
        normalizedUserEmail.length > 0 &&
        (customerEmail === normalizedUserEmail || fallbackEmail === normalizedUserEmail)

      return matchesUserId || matchesEmail
    })
  }, [orders, userId, normalizedUserEmail])

  const hasOrders = userOrders.length > 0
  const totalPages = Math.max(1, Math.ceil(userOrders.length / PAGE_SIZE))
  const safePage = Math.min(Math.max(currentPage, 1), totalPages)

  useEffect(() => {
    if (safePage !== currentPage) {
      setCurrentPage(safePage)
    }
  }, [safePage, currentPage])

  const paginatedOrders = useMemo(() => {
    if (!hasOrders) {
      return []
    }

    const startIndex = (safePage - 1) * PAGE_SIZE
    return userOrders.slice(startIndex, startIndex + PAGE_SIZE)
  }, [userOrders, hasOrders, safePage])

  const hasPrevPage = safePage > 1
  const hasNextPage = hasOrders && safePage < totalPages

  const getStatusBadge = (order: any) => {
    // Financial status
    if (order.financialStatus === OrderFinancialStatus.PAID) {
      return <Badge className="bg-green-500">Pagado</Badge>
    } else if (order.financialStatus === OrderFinancialStatus.PENDING) {
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-600">
          Pago pendiente
        </Badge>
      )
    } else if (order.financialStatus === OrderFinancialStatus.REFUNDED) {
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-600">
          Reembolsado
        </Badge>
      )
    } else if (order.financialStatus === OrderFinancialStatus.VOIDED) {
      return <Badge variant="destructive">Pago fallido</Badge>
    }

    // Fulfillment status as fallback
    if (order.fulfillmentStatus === OrderFulfillmentStatus.FULFILLED) {
      return <Badge className="bg-green-500">Completado</Badge>
    } else if (order.fulfillmentStatus === OrderFulfillmentStatus.PARTIALLY_FULFILLED) {
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-600">
          Parcialmente enviado
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="border-slate-500">
          En proceso
        </Badge>
      )
    }
  }

  const getStatusIcon = (order: any) => {
    // Shipping status
    if (order.shippingStatus === ShippingStatus.DELIVERED) {
      return <Package className="h-5 w-5 text-green-500" />
    } else if (order.shippingStatus === ShippingStatus.SHIPPED) {
      return <Truck className="h-5 w-5 text-blue-500" />
    } else if (order.shippingStatus === ShippingStatus.PENDING) {
      return <Package className="h-5 w-5 text-amber-500" />
    }

    // Financial status as fallback
    if (order.financialStatus === OrderFinancialStatus.PAID) {
      return <CreditCard className="h-5 w-5 text-green-500" />
    } else {
      return <CreditCard className="h-5 w-5 text-slate-400" />
    }
  }

  if (ordersLoading) {
    return (
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="mt-4 flex justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <div className="bg-muted/30 p-3 border-t">
                  <Skeleton className="h-8 w-24 float-right" />
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    )
  }

  if (ordersError) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">{ordersError}</p>
        <Button variant="outline" className="mt-4" onClick={handleReload}>
          Intentar de nuevo
        </Button>
      </div>
    )
  }

 

  if (userOrders.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-muted/20">
        <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-2">No hay pedidos disponibles</p>
 
        <Button variant="outline" className="mt-4" onClick={handleReload}>
          Recargar pedidos
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
 

      {paginatedOrders.map((order: any) => (
        <Card key={order.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">Pedido #{order.orderNumber}</h4>
                  <p className="text-sm text-muted-foreground">{formatDate(new Date(order.createdAt))}</p>
                </div>
                {getStatusBadge(order)}
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {getStatusIcon(order)}
                  <span className="text-sm">
                    {order.lineItems.length} {order.lineItems.length === 1 ? "producto" : "productos"}
                  </span>
                </div>
                <p className="font-medium">
                  {order.currency?.symbol || "S/"}
                  {formatAmount(order.totalPrice)}
                </p>
              </div>
            </div>
            <div className="bg-muted/30 p-2 flex justify-end border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedOrder(order)
                  setIsDialogOpen(true)
                }}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Ver detalles
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Paginación */}
      {hasOrders && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentPage(prev => Math.max(prev - 1, 1))
            }}
            disabled={!hasPrevPage || ordersLoading}
          >
            Anterior
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Página {safePage} de {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentPage(prev => Math.min(prev + 1, totalPages))
            }}
            disabled={!hasNextPage || ordersLoading}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalles del pedido #{selectedOrder.orderNumber}</DialogTitle>
              <DialogDescription>Realizado el {formatDate(new Date(selectedOrder.createdAt))}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Estado</h4>
                {getStatusBadge(selectedOrder)}
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Productos</h4>
                <div className="space-y-3">
                  {selectedOrder.lineItems.map((item: any) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <p className="text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">
                        {selectedOrder.currency?.symbol || "S/"}
                        {formatAmount(parseAmount(item.price) * parseAmount(item.quantity))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Resumen</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>
                      {selectedOrder.currency?.symbol || "S/"}
                      {formatAmount(selectedOrder.subtotalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Impuestos</span>
                    <span>
                      {selectedOrder.currency?.symbol || "S/"}
                      {formatAmount(selectedOrder.totalTax)}
                    </span>
                  </div>
                  {parseAmount(selectedOrder.totalDiscounts) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Descuentos</span>
                      <span>
                        -{selectedOrder.currency?.symbol || "S/"}
                        {formatAmount(selectedOrder.totalDiscounts)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>
                      {selectedOrder.currency?.symbol || "S/"}
                      {formatAmount(selectedOrder.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {(() => {
                const { shipping: shippingAddress, billing: billingAddress } = normalizeOrderAddresses(selectedOrder)

                if (!shippingAddress) {
                  return null
                }

                const hasDistinctBilling =
                  billingAddress &&
                  JSON.stringify(billingAddress) !== JSON.stringify(shippingAddress)

                return (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Dirección de envío</h4>
                    <p className="text-sm">
                      {shippingAddress.address1}
                      {shippingAddress.address2 && `, ${shippingAddress.address2}`}
                    </p>
                    <p className="text-sm">
                      {shippingAddress.city}
                      {shippingAddress.province && `, ${shippingAddress.province}`} {shippingAddress.zip}
                    </p>
                    <p className="text-sm">{shippingAddress.country}</p>
                  </div>
                  {hasDistinctBilling && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Dirección de facturación</h4>
                        <p className="text-sm">
                          {billingAddress?.address1}
                          {billingAddress?.address2 && `, ${billingAddress.address2}`}
                        </p>
                        <p className="text-sm">
                          {billingAddress?.city}
                          {billingAddress?.province && `, ${billingAddress.province}`} {billingAddress?.zip}
                        </p>
                        <p className="text-sm">{billingAddress?.country}</p>
                      </div>
                    </>
                  )}
                </>
                )
              })()}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
