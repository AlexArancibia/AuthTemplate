"use client"

import { useState, useEffect, useRef } from "react"
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

interface UserOrdersProps {
  userId: string
  userEmail: string
}

export function UserOrders({ userId, userEmail }: UserOrdersProps) {
  const { orders, fetchOrders, loading: ordersLoading, error: ordersError, paginationMeta } = useMainStore()
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Simple fetch control
  const hasFetched = useRef(false)

  useEffect(() => {
    const loadOrders = async () => {
      // Skip if already fetched or already loading
      if (hasFetched.current || ordersLoading) {
        return
      }

      hasFetched.current = true

      try {
        // Fetch con email del usuario como filtro y paginación
        await fetchOrders({ 
          customerEmail: userEmail,
          page: currentPage,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        })
      } catch (error) {
        console.error("[USER_ORDERS] Error fetching orders:", error)
        toast.error("Error al cargar los pedidos")
      }
    }

    loadOrders()
  }, [fetchOrders, ordersLoading, userEmail, currentPage])

  // Los orders ya vienen filtrados por el backend usando customerEmail
  const userOrders = Array.isArray(orders) ? orders : []

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
        <Badge variant="outline" className="border-pink-500 text-pink-600">
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
        <Badge variant="outline" className="border-pink-500 text-pink-600">
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
      return <Truck className="h-5 w-5 text-pink-500" />
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
    console.error("[USER_ORDERS] Error:", ordersError)
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">{ordersError}</p>
        <Button variant="outline" className="mt-4" onClick={() => {
          hasFetched.current = false
          fetchOrders({ customerEmail: userEmail, page: currentPage, limit: 10 })
        }}>
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
 
        <Button variant="outline" className="mt-4" onClick={() => {
          hasFetched.current = false
          fetchOrders({ customerEmail: userEmail, page: currentPage, limit: 10 })
        }}>
          Recargar pedidos
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
 

      {userOrders.map((order: any) => (
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
                  {Number(order.totalPrice).toFixed(2)}
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
      {paginationMeta.orders && paginationMeta.orders.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentPage(prev => prev - 1)
              hasFetched.current = false
            }}
            disabled={!paginationMeta.orders.hasPrev || ordersLoading}
          >
            Anterior
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Página {paginationMeta.orders.page} de {paginationMeta.orders.totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentPage(prev => prev + 1)
              hasFetched.current = false
            }}
            disabled={!paginationMeta.orders.hasNext || ordersLoading}
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
                        {(item.price * item.quantity).toFixed(2)}
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
                      {selectedOrder.subtotalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Impuestos</span>
                    <span>
                      {selectedOrder.currency?.symbol || "S/"}
                      {selectedOrder.totalTax.toFixed(2)}
                    </span>
                  </div>
                  {selectedOrder.totalDiscounts > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Descuentos</span>
                      <span>
                        -{selectedOrder.currency?.symbol || "S/"}
                        {selectedOrder.totalDiscounts.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>
                      {selectedOrder.currency?.symbol || "S/"}
                      {selectedOrder.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedOrder.shippingAddress && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Dirección de envío</h4>
                    <p className="text-sm">
                      {selectedOrder.shippingAddress.address1}
                      {selectedOrder.shippingAddress.address2 && `, ${selectedOrder.shippingAddress.address2}`}
                    </p>
                    <p className="text-sm">
                      {selectedOrder.shippingAddress.city}
                      {selectedOrder.shippingAddress.province && `, ${selectedOrder.shippingAddress.province}`}{" "}
                      {selectedOrder.shippingAddress.zip}
                    </p>
                    <p className="text-sm">{selectedOrder.shippingAddress.country}</p>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
