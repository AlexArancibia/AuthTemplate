"use client"

import { Badge } from "@/components/ui/badge"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useCartStore } from "@/stores/cartStore"
import { useMainStore } from "@/stores/mainStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CheckCircle,
  CreditCard,
  MapPin,
  Package,
  Truck,
  ArrowLeft,
  ArrowRight,
  Plus,
  Home,
  Building,
  Loader2,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { OrderFinancialStatus, OrderFulfillmentStatus, ShippingStatus } from "@/types/common"
import { Card, CardContent } from "@/components/ui/card"
import { generateOrderConfirmationEmail } from "@/lib/email-templates"
import { AddressType } from "@prisma/client"
import { Address, AddressCreateData, useUserStore } from "@/stores/userStore"
import { auth } from "@/auth"

// Update the STEPS enum to combine shipping and payment
const STEPS = {
  CART_REVIEW: 0,
  CUSTOMER_INFO: 1,
  SHIPPING_PAYMENT: 2, // Combined shipping and payment step
  CONFIRMATION: 3,
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart, getTotal } = useCartStore()
  const {
    shopSettings,
    shippingMethods,
    paymentProviders,
    fetchShippingMethods,
    fetchPaymentProviders,
    createOrder,
    sendEmail,
    submitFormEmail,
  } = useMainStore()

  const { currentUser, loading: userLoading, error: userError, fetchUserById, createAddress } = useUserStore()

  // State for user session
  const [session, setSession] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const [showNewShippingAddress, setShowNewShippingAddress] = useState(false)
  const [showNewBillingAddress, setShowNewBillingAddress] = useState(false)
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState<string | null>(null)
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<string | null>(null)
 
  const [currentStep, setCurrentStep] = useState(STEPS.CART_REVIEW)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [pageLoading, setPageLoading] = useState(true)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [shippingAddressId, setShippingAddressId] = useState<string | null>(null)
  const [billingAddressId, setBillingAddressId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    // Customer info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",

    // Shipping info
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    shippingPhone: "", // Campo separado para el teléfono de envío

    // Billing info
    sameBillingAddress: true,
    billingAddress: "",
    billingApartment: "",
    billingCity: "",
    billingState: "",
    billingZipCode: "",
    billingPhone: "",

    // Shipping method
    shippingMethod: "",

    // Payment info
    paymentMethod: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",

    // Additional info
    notes: "",
    preferredDeliveryDate: new Date().toISOString(),
  })

  // Function to check authentication
 

  // Initial page loading
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setSession(await auth())
        setPageLoading(false)
      } catch (error) {
        console.error("Error loading initial data:", error)
        setPageLoading(false)
      }
    }

    loadInitialData()

    // Fallback timeout to ensure we don't show loading state forever
    const timeout = setTimeout(() => {
      setPageLoading(false)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [])

  // Populate form with user data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      console.log("User data loaded, populating form fields...")

      // Populate form with user data
      setFormData((prev) => ({
        ...prev,
        firstName: currentUser.firstName || prev.firstName,
        lastName: currentUser.lastName || prev.lastName,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || prev.phone,
        company: currentUser.company || prev.company,
        shippingPhone: currentUser.phone || prev.shippingPhone,
      }))

      // Set customer ID
      setCustomerId(currentUser.id)

      // If user has addresses, select the default one
      if (currentUser.addresses && currentUser.addresses.length > 0) {
        // Find default shipping address
        const defaultShippingAddress = currentUser.addresses.find(
          (addr) =>
            addr.isDefault && (addr.addressType === AddressType.shipping || addr.addressType === AddressType.both),
        )

        // Find default billing address
        const defaultBillingAddress = currentUser.addresses.find(
          (addr) =>
            addr.isDefault && (addr.addressType === AddressType.billing || addr.addressType === AddressType.both),
        )

        // If no default addresses, use the first appropriate address
        const firstShippingAddress = currentUser.addresses.find(
          (addr) => addr.addressType === AddressType.shipping || addr.addressType === AddressType.both,
        )

        const firstBillingAddress = currentUser.addresses.find(
          (addr) => addr.addressType === AddressType.billing || addr.addressType === AddressType.both,
        )

        // Set shipping address
        const shippingAddressToUse = defaultShippingAddress || firstShippingAddress
        if (shippingAddressToUse) {
          setSelectedShippingAddressId(shippingAddressToUse.id)
          setShippingAddressId(shippingAddressToUse.id)
        } else {
          setShowNewShippingAddress(true)
        }

        // Set billing address
        const billingAddressToUse = defaultBillingAddress || firstBillingAddress
        if (billingAddressToUse) {
          setSelectedBillingAddressId(billingAddressToUse.id)
          setBillingAddressId(billingAddressToUse.id)
          setFormData((prev) => ({
            ...prev,
            sameBillingAddress: shippingAddressToUse?.id === billingAddressToUse?.id,
          }))
        } else if (shippingAddressToUse) {
          // Use shipping address for billing if no billing address exists
          setSelectedBillingAddressId(shippingAddressToUse.id)
          setBillingAddressId(shippingAddressToUse.id)
          setFormData((prev) => ({ ...prev, sameBillingAddress: true }))
        } else {
          setShowNewBillingAddress(true)
        }
      } else {
        // If no addresses, show the new address form
        setShowNewShippingAddress(true)
      }
    }
  }, [currentUser])

  // Fetch shipping methods and payment providers on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        console.log("Fetching shipping methods and payment providers...")
        await Promise.all([fetchShippingMethods(), fetchPaymentProviders()])
      } catch (error) {
        console.error("Error loading checkout data:", error)
        toast.error("Error loading checkout data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [fetchShippingMethods, fetchPaymentProviders])

  // Set default shipping and payment methods once data is loaded
  useEffect(() => {
    if (shippingMethods.length > 0 && !formData.shippingMethod) {
      setFormData((prev) => ({
        ...prev,
        shippingMethod: shippingMethods[0].id,
      }))
    }

    if (paymentProviders.length > 0 && !formData.paymentMethod) {
      setFormData((prev) => ({
        ...prev,
        paymentMethod: paymentProviders[0].id,
      }))
    }
  }, [shippingMethods, paymentProviders, formData.shippingMethod, formData.paymentMethod])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Navigate to next step
  const nextStep = async () => {
    if (currentStep === STEPS.CUSTOMER_INFO && isAuthenticated && currentUser) {
      // If user is authenticated and we're moving from customer info to shipping/payment
      // Save any new address to the user profile
      if (showNewShippingAddress) {
        await saveNewAddress(false)
      }
    }

    if (currentStep < STEPS.CONFIRMATION) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo(0, 0)
    }
  }

  // Navigate to previous step
  const prevStep = () => {
    if (currentStep > STEPS.CART_REVIEW) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo(0, 0)
    }
  }

  // Add a handler for the billing address toggle
  const handleBillingAddressToggle = (value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      sameBillingAddress: value,
      // If toggling to use same address, copy shipping address to billing fields
      ...(value
        ? {
            billingAddress: prev.address,
            billingApartment: prev.apartment,
            billingCity: prev.city,
            billingState: prev.state,
            billingZipCode: prev.zipCode,
            billingPhone: prev.shippingPhone,
          }
        : {}),
    }))

    // If using same address for billing, use the same address ID
    if (value) {
      setSelectedBillingAddressId(selectedShippingAddressId)
      setBillingAddressId(shippingAddressId)
      setShowNewBillingAddress(false)
    }
  }

  // Add a handler to copy shipping address to billing
  const copyShippingToBilling = () => {
    setFormData((prev) => ({
      ...prev,
      billingAddress: prev.address,
      billingApartment: prev.apartment,
      billingCity: prev.city,
      billingState: prev.state,
      billingZipCode: prev.zipCode,
      billingPhone: prev.shippingPhone,
    }))
  }

  // Handle selecting an existing address for shipping
  const handleSelectShippingAddress = (addressId: string) => {
    setSelectedShippingAddressId(addressId)
    setShippingAddressId(addressId)
    setShowNewShippingAddress(false)

    // If using same address for billing, update billing address too
    if (formData.sameBillingAddress) {
      setSelectedBillingAddressId(addressId)
      setBillingAddressId(addressId)
    }
  }

  // Handle selecting an existing address for billing
  const handleSelectBillingAddress = (addressId: string) => {
    setSelectedBillingAddressId(addressId)
    setBillingAddressId(addressId)
    setShowNewBillingAddress(false)
  }

  // Save a new address to the user profile
  const saveNewAddress = async (isBilling: boolean) => {
    if (!isAuthenticated || !currentUser || !session?.user?.id) {
      return null
    }

    try {
      // Prepare the new address data
      const newAddress: AddressCreateData = isBilling
        ? {
            addressType: AddressType.billing,
            address1: formData.billingAddress,
            address2: formData.billingApartment || undefined,
            city: formData.billingCity,
            province: formData.billingState || undefined,
            zip: formData.billingZipCode,
            country: "PE", // Default to Peru
            phone: formData.billingPhone || undefined,
            company: formData.company || undefined,
            isDefault: false,
          }
        : {
            addressType: AddressType.shipping,
            address1: formData.address,
            address2: formData.apartment || undefined,
            city: formData.city,
            province: formData.state || undefined,
            zip: formData.zipCode,
            country: "PE", // Default to Peru
            phone: formData.shippingPhone || undefined,
            company: formData.company || undefined,
            isDefault: !currentUser.addresses?.length,
          }

      // Create the new address using the user store
      const createdAddress = await createAddress(session.user.id, newAddress)

      if (createdAddress) {
        // Update the selected address ID
        if (isBilling) {
          setSelectedBillingAddressId(createdAddress.id)
          setBillingAddressId(createdAddress.id)
        } else {
          setSelectedShippingAddressId(createdAddress.id)
          setShippingAddressId(createdAddress.id)

          // If using same address for billing, update billing address too
          if (formData.sameBillingAddress) {
            setSelectedBillingAddressId(createdAddress.id)
            setBillingAddressId(createdAddress.id)
          }
        }

        toast.success(`Nueva dirección ${isBilling ? "de facturación" : "de envío"} guardada`)
        return createdAddress.id
      }
    } catch (error) {
      console.error("Error saving new address:", error)
      toast.error(`Error al guardar la dirección ${isBilling ? "de facturación" : "de envío"}`)
    }

    return null
  }

  // Submit the order
  const submitOrder = async () => {
    setIsSubmitting(true)

    try {
      console.log("========== INICIANDO PROCESO DE ORDEN ==========")
      console.log("Starting order submission process...")

      // 1. Prepare customer and address data
      let calculatedShippingAddressId = shippingAddressId
      let calculatedBillingAddressId = billingAddressId
      let customer = { id: customerId || "guest" }

      if (isAuthenticated && currentUser) {
        // For authenticated users
        customer = { id: currentUser.id }
        console.log("Using authenticated user ID:", currentUser.id)

        // Save any new addresses if needed
        if (showNewShippingAddress) {
          const newAddressId = await saveNewAddress(false)
          if (newAddressId) {
            calculatedShippingAddressId = newAddressId
          }
        }

        if (!formData.sameBillingAddress && showNewBillingAddress) {
          const newBillingAddressId = await saveNewAddress(true)
          if (newBillingAddressId) {
            calculatedBillingAddressId = newBillingAddressId
          }
        }
      } else {
        // For guest users, we'll use the form data directly in the order
        console.log("Guest checkout - using form data directly")
      }

      // 2. Verify we have the required address IDs for authenticated users
      if (isAuthenticated && (!calculatedShippingAddressId || !calculatedBillingAddressId)) {
        console.error("Missing address IDs for authenticated user")
        throw new Error("Please select or create shipping and billing addresses")
      }

      // 3. Prepare line items from cart
      console.log("Cart items:", items)
      const lineItems = items.map((item) => ({
        variantId: item.variant.id,
        title: `${item.product.title} - ${item.variant.title}`,
        price: item.variant.prices[0].price,
        quantity: item.quantity,
        totalDiscount: 0,
      }))

      console.log("Prepared line items:", lineItems)

      // 4. Calculate totals
      const subtotalPrice = getTotal()
      console.log("Subtotal price:", subtotalPrice)

      // Verificar si los precios incluyen impuestos
      const taxesIncluded = shopSettings?.[0]?.taxesIncluded || false
      const taxRate = Number(shopSettings?.[0]?.taxValue || 18) / 100 // Dynamic tax rate from settings

      let totalTax = 0
      let totalPrice = 0

      if (taxesIncluded) {
        // Si los precios ya incluyen impuestos, extraer el impuesto del subtotal
        const taxDivisor = 1 + taxRate
        totalTax = subtotalPrice - subtotal / taxDivisor
        totalPrice = subtotalPrice + Number(getShippingCost())
      } else {
        // Si los precios no incluyen impuestos, agregar el impuesto al subtotal
        totalTax = subtotalPrice * taxRate
        totalPrice = subtotalPrice + totalTax + Number(getShippingCost())
      }

      console.log("Tax included in prices:", taxesIncluded)
      console.log("Tax rate:", taxRate, "Total tax:", totalTax)

      const shippingCost = Number(getShippingCost())
      console.log("Shipping cost:", shippingCost)
      console.log("Total price:", totalPrice)

      // Get currency information
      const currencyId = shopSettings?.[0]?.defaultCurrency?.id || "curr_0536edd0-2193"
      console.log("Using currency ID:", currencyId)
      console.log("Currency symbol:", shopSettings?.[0]?.defaultCurrency?.symbol)

      // 5. Prepare order data
      const orderData = {
        customerId: customer.id,
        currencyId: currencyId,
        totalPrice,
        subtotalPrice,
        totalTax,
        totalDiscounts: 0,
        lineItems,
        shippingAddressId: calculatedShippingAddressId,
        billingAddressId: calculatedBillingAddressId,
        // For guest users, include the address information directly
        guestInfo: !isAuthenticated
          ? {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              company: formData.company,
              shippingAddress: {
                address1: formData.address,
                address2: formData.apartment,
                city: formData.city,
                province: formData.state,
                zip: formData.zipCode,
                country: "PE",
                phone: formData.shippingPhone,
              },
              billingAddress: formData.sameBillingAddress
                ? null
                : {
                    address1: formData.billingAddress,
                    address2: formData.billingApartment,
                    city: formData.billingCity,
                    province: formData.billingState,
                    zip: formData.billingZipCode,
                    country: "PE",
                    phone: formData.billingPhone,
                  },
            }
          : undefined,
        couponId: "", // No coupon for now
        paymentProviderId: formData.paymentMethod,
        shippingMethodId: formData.shippingMethod,
        financialStatus: OrderFinancialStatus.PENDING,
        fulfillmentStatus: OrderFulfillmentStatus.UNFULFILLED,
        shippingStatus: ShippingStatus.PENDING,
        customerNotes: formData.notes || "",
        internalNotes: "",
        source: "web",
        preferredDeliveryDate: formData.preferredDeliveryDate,
      }

      console.log("========== DATOS COMPLETOS DE LA ORDEN ==========")
      console.log(JSON.stringify(orderData, null, 2))
      console.log("=================================================")

      // 6. Create the order
      console.log("Sending order data to server...")
      const order = await createOrder(orderData)
      console.log("Order creation response:", order)

      if (!order || !order.id) {
        console.error("Failed to create order - no order ID returned")
        throw new Error("Failed to create order")
      }

      console.log("Order created successfully with ID:", order.id)
      setOrderId(order.id)

      // Solo enviar correo de confirmación si el cliente está autenticado
      if (isAuthenticated && currentUser) {
        try {
          const emailData = {
            orderId: order.id,
            customerName:
              `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || currentUser.name || "Cliente",
            customerEmail: currentUser.email,
            items: lineItems.map((item) => ({
              title: item.title,
              quantity: item.quantity,
              price: item.price,
            })),
            subtotal: subtotalPrice,
            tax: totalTax,
            shipping: shippingCost,
            total: totalPrice,
            taxesIncluded: taxesIncluded,
            taxRate: taxRate,
            currency,
            shippingAddress: {
              address1: formData.address,
              address2: formData.apartment || undefined,
              city: formData.city,
              province: formData.state,
              zip: formData.zipCode,
            },
            billingAddress: !formData.sameBillingAddress
              ? {
                  address1: formData.billingAddress,
                  address2: formData.billingApartment || undefined,
                  city: formData.billingCity,
                  province: formData.billingState,
                  zip: formData.billingZipCode,
                }
              : undefined,
            paymentMethod: paymentProviders.find((p) => p.id === formData.paymentMethod)?.name,
            notes: formData.notes || undefined,
          }

          const emailHtml = generateOrderConfirmationEmail(emailData)

          await sendEmail(currentUser.email, `Confirmación de pedido #${order.id} - Clefast`, emailHtml)
          console.log("Confirmation email sent successfully")
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError)
          // Don't throw here, we don't want to fail the order if email fails
        }
      } else {
        console.log("Cliente no registrado, no se envía correo de confirmación")
      }

      // Enviar notificación a la empresa sobre el nuevo pedido
      try {
        // Preparar resumen de productos para la notificación
        const productsResumen = items
          .map(
            (item) =>
              `${item.product.title} - ${Object.entries(item.variant.attributes || {})
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ")} (${item.quantity} x ${currency}${Number(item.variant.prices[0].price).toFixed(2)})`,
          )
          .join("\n")

        // Formatear dirección completa
        const shippingAddressFormatted = `${formData.firstName} ${formData.lastName}, ${formData.address}${formData.apartment ? `, ${formData.apartment}` : ""}, ${formData.city}, ${formData.state} ${formData.zipCode}`

        // Formatear dirección de facturación si es diferente
        const billingAddressFormatted = !formData.sameBillingAddress
          ? `  ${formData.billingAddress}${formData.billingApartment ? `, ${formData.billingApartment}` : ""}, ${formData.billingCity}, ${formData.billingState} ${formData.billingZipCode}`
          : "Misma que la dirección de envío"

        // Crear datos para el formulario de notificación
        const notificationData = {
          email: formData.email || currentUser?.email || "",
          nombre:
            `${formData.firstName || currentUser?.firstName || ""} ${formData.lastName || currentUser?.lastName || ""}`.trim(),
          telefono: formData.phone || currentUser?.phone || "",
          order: order.id,
          subtotal: Number(subtotalPrice).toFixed(2),
          impuesto: totalTax.toFixed(2),
          tasaImpuesto: `${(taxRate * 100).toFixed(0)}%`,
          envio: Number(shippingCost).toFixed(2),
          total: Number(totalPrice).toFixed(2),
          impuestosIncluidos: taxesIncluded ? "Sí" : "No",
          productos: productsResumen,
          direccionEnvio: shippingAddressFormatted,
          direccionFacturacion: billingAddressFormatted,
          notas: formData.notes || "Sin notas adicionales",
          esRegistrado: isAuthenticated ? "Sí" : "No",
          metodoPago: paymentProviders.find((p) => p.id === formData.paymentMethod)?.name || "No especificado",
        }

        await submitFormEmail(notificationData)
        console.log("Notificación de pedido enviada a la empresa")
      } catch (notificationError) {
        console.error("Error enviando notificación a la empresa:", notificationError)
        // No lanzar error, no queremos que falle el pedido si la notificación falla
      }

      // 7. Success
      console.log("Order process completed successfully")
      toast.success("¡Pedido realizado con éxito!", {
        description: `Pedido #${order.id} creado. Recibirás un correo con los detalles de tu compra.`,
      })

      clearCart()
      setCurrentStep(STEPS.CONFIRMATION)
    } catch (error) {
      console.error("Error submitting order:", error)
      console.error("Error details:", error instanceof Error ? error.message : String(error))
      toast.error("Error al procesar el pedido. Por favor, intenta nuevamente.")
    } finally {
      setIsSubmitting(false)
      console.log("Order submission process finished")
    }
  }

  // Get the appropriate icon for payment methods
  const getPaymentIcon = (paymentName: string) => {
    const name = paymentName.toLowerCase()
    if (name.includes("tarjeta") || name.includes("credit") || name.includes("débito")) {
      return <CreditCard className="mr-3 h-5 w-5 text-primary" />
    } else if (name.includes("paypal")) {
      return (
        <div className="mr-3 h-5 w-5 flex items-center justify-center">
          <Image src="/paypal.svg" alt="PayPal" width={20} height={20} />
        </div>
      )
    } else if (name.includes("transfer") || name.includes("banco")) {
      return (
        <div className="mr-3 h-5 w-5 flex items-center justify-center text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 17h16"></path>
            <path d="M10 4v13"></path>
            <path d="M14 4v13"></path>
            <path d="M4 7h16"></path>
          </svg>
        </div>
      )
    } else {
      return <CreditCard className="mr-3 h-5 w-5 text-primary" />
    }
  }

  // Update the shipping cost calculation based on the selected shipping method
  const getShippingCost = () => {
    if (!formData.shippingMethod || shippingMethods.length === 0) return 0

    const selectedMethod = shippingMethods.find((method) => method.id === formData.shippingMethod)
    return selectedMethod?.prices[0]?.price || 0
  }

  // Calculate totals with the real shipping cost
  const subtotal = Number(getTotal())
  const shipping = Number(getShippingCost())
  const taxesIncluded = shopSettings?.[0]?.taxesIncluded || false
  const taxRate = Number(shopSettings?.[0]?.taxValue || 18) / 100 // Dynamic tax rate from settings

  let tax = 0
  let total = 0

  if (taxesIncluded) {
    // Si los precios ya incluyen impuestos, extraer el impuesto del subtotal
    const taxDivisor = 1 + taxRate
    tax = subtotal - subtotal / taxDivisor
    total = subtotal + shipping
  } else {
    // Si los precios no incluyen impuestos, agregar el impuesto al subtotal
    tax = subtotal * taxRate
    total = subtotal + tax + shipping
  }

  // Currency symbol
  const currency = shopSettings?.[0]?.defaultCurrency?.symbol || "S/"

  // Render skeleton loading state
  if (pageLoading || userLoading) {
    return (
      <div className="bg-gray-50 min-h-screen py-10">
        <div className="container mx-auto px-4">
          {/* Skeleton Header */}
          <div className="max-w-4xl mx-auto mb-8">
            <Skeleton className="h-10 w-40 mx-auto mb-6" />
            <div className="hidden md:flex justify-between items-center max-w-2xl mx-auto mb-8">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex flex-col items-center">
                  <Skeleton className="w-10 h-10 rounded-full mb-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Skeleton */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <Skeleton className="h-8 w-48 mb-6" />

                  {/* Cart Items Skeleton */}
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center gap-4 py-4 border-b">
                      <Skeleton className="w-20 h-20 rounded-md" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-1" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                  ))}

                  {/* Buttons Skeleton */}
                  <div className="flex justify-between pt-4 mt-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              </div>

              {/* Order Summary Skeleton */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <Skeleton className="h-7 w-40 mb-6" />

                  {/* Cart Items Summary Skeleton */}
                  <div className="space-y-4 mb-6">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>

                  <Skeleton className="h-px w-full my-4" />

                  {/* Totals Skeleton */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>

                  <Skeleton className="h-px w-full my-4" />

                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If cart is empty and not in confirmation step, redirect to cart
  if (items.length === 0 && currentStep !== STEPS.CONFIRMATION) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
          <p className="text-muted-foreground mb-8">Agrega productos a tu carrito para continuar con la compra.</p>
          <Button asChild>
            <Link href="/productos">Ver productos</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Render an address card
  const renderAddressCard = (address: Address, isSelected: boolean, onSelect: () => void, isShipping: boolean) => (
    <Card
      key={address.id}
      className={`mb-3 cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary" : "hover:border-primary/50"}`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div className={`mt-1 p-1 rounded-full ${isSelected ? "bg-primary text-white" : "bg-muted"}`}>
              {address.address1.toLowerCase().includes("oficina") || address.company ? (
                <Building className="h-4 w-4" />
              ) : (
                <Home className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{address.address1}</p>
              {address.address2 && <p className="text-sm text-muted-foreground">{address.address2}</p>}
              <p className="text-sm text-muted-foreground">
                {address.city}, {address.province} {address.zip}
              </p>
              {address.phone && <p className="text-sm text-muted-foreground">{address.phone}</p>}
              {address.isDefault && <Badge className="mt-1 bg-primary/10 text-primary">Predeterminada</Badge>}
            </div>
          </div>
          <RadioGroupItem
            value={address.id}
            id={`${isShipping ? "shipping" : "billing"}-${address.id}`}
            className="mt-1"
            checked={isSelected}
          />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        {/* Checkout Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-center mb-6">Checkout</h1>

          {/* Progress Steps */}
          <div className="hidden md:flex justify-between items-center max-w-2xl mx-auto mb-8">
            {[
              { step: STEPS.CART_REVIEW, label: "Carrito" },
              { step: STEPS.CUSTOMER_INFO, label: "Información" },
              { step: STEPS.SHIPPING_PAYMENT, label: "Envío y Pago" },
              { step: STEPS.CONFIRMATION, label: "Confirmación" },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    currentStep >= item.step ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStep > item.step ? <CheckCircle className="w-5 h-5" /> : <span>{index + 1}</span>}
                </div>
                <span className={`text-sm ${currentStep >= item.step ? "text-primary font-medium" : "text-gray-500"}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className={currentStep === STEPS.CONFIRMATION ? "lg:col-span-3" : "lg:col-span-2"}>
              <div className="bg-white rounded-lg shadow-sm p-6">
                {/* Step 1: Cart Review */}
                {currentStep === STEPS.CART_REVIEW && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-semibold mb-4">Revisa tu carrito</h2>

                    {items.map((item) => (
                      <div key={item.variant.id} className="flex items-center gap-4 py-4 border-b">
                        <div className="relative w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                          <Image
                            src={item.product.imageUrls[0] || "/placeholder.svg"}
                            alt={item.product.title}
                            fill
                            className="object-contain p-2"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{item.product.title}</h3>
                          {item.variant.attributes && Object.entries(item.variant.attributes).length > 1 && (
                            <p className="text-sm text-gray-500">
                              {Object.entries(item.variant.attributes || {})
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(", ")}
                            </p>
                          )}

                          <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {currency}
                            {Number(item.variant.prices[0].price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-between pt-4">
                      <Button variant="outline" asChild>
                        <Link href="/cart">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Volver al carrito
                        </Link>
                      </Button>
                      <Button onClick={nextStep}>
                        Continuar
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Customer Information */}
                {currentStep === STEPS.CUSTOMER_INFO && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {!isAuthenticated && (
                      <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-blue-800">¿Ya tienes una cuenta?</h3>
                            <p className="text-sm text-blue-700">Inicia sesión para agilizar el proceso de compra</p>
                          </div>
                          <Button variant="outline" className="bg-white" onClick={() => router.push("/login")}>
                            Iniciar sesión
                          </Button>
                        </div>
                      </div>
                    )}

                    <h2 className="text-xl font-semibold mb-4">Información de contacto</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email || currentUser?.email || ""}
                          onChange={handleInputChange}
                          required
                          disabled={!!currentUser?.email}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono de contacto</Label>
                        <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa (opcional)</Label>
                      <Input id="company" name="company" value={formData.company} onChange={handleInputChange} />
                    </div>

                    <Separator className="my-6" />

                    <h2 className="text-xl font-semibold mb-4">Dirección de envío</h2>

                    {/* Display existing addresses for authenticated users */}
                    {isAuthenticated && currentUser && currentUser.addresses && currentUser.addresses.length > 0 && (
                      <div className="mb-6">
                        <RadioGroup
                          value={selectedShippingAddressId || ""}
                          onValueChange={(value) => handleSelectShippingAddress(value)}
                          className="space-y-2"
                        >
                          {currentUser.addresses
                            .filter(
                              (addr) =>
                                addr.addressType === AddressType.shipping || addr.addressType === AddressType.both,
                            )
                            .map((address) =>
                              renderAddressCard(
                                address,
                                selectedShippingAddressId === address.id,
                                () => handleSelectShippingAddress(address.id),
                                true,
                              ),
                            )}
                        </RadioGroup>

                        <Button
                          variant="outline"
                          className="mt-3 flex items-center gap-2"
                          onClick={() => setShowNewShippingAddress(true)}
                        >
                          <Plus className="h-4 w-4" />
                          Agregar nueva dirección
                        </Button>
                      </div>
                    )}

                    {/* New shipping address form */}
                    {(showNewShippingAddress || !isAuthenticated || !currentUser?.addresses?.length) && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="address">Dirección</Label>
                            <Input
                              id="address"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="shippingPhone">Teléfono</Label>
                            <Input
                              id="shippingPhone"
                              name="shippingPhone"
                              value={formData.shippingPhone}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="apartment">Apartamento, suite, etc. (opcional)</Label>
                            <Input
                              id="apartment"
                              name="apartment"
                              value={formData.apartment}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="city">Ciudad</Label>
                            <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="state">Departamento/Provincia</Label>
                            <Input
                              id="state"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zipCode">Código postal</Label>
                            <Input
                              id="zipCode"
                              name="zipCode"
                              value={formData.zipCode}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <Separator className="my-6" />

                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id="sameBillingAddress"
                        checked={formData.sameBillingAddress}
                        onCheckedChange={handleBillingAddressToggle}
                      />
                      <Label htmlFor="sameBillingAddress" className="cursor-pointer">
                        La dirección de facturación es la misma que la dirección de envío
                      </Label>
                    </div>

                    {!formData.sameBillingAddress && (
                      <div className="space-y-6 border-l-2 border-primary/20 pl-4">
                        <div className="flex justify-between items-center">
                          <h2 className="text-xl font-semibold">Dirección de facturación</h2>
                          {showNewBillingAddress && (
                            <Button type="button" variant="outline" size="sm" onClick={copyShippingToBilling}>
                              Copiar dirección de envío
                            </Button>
                          )}
                        </div>

                        {/* Display existing addresses for billing */}
                        {isAuthenticated &&
                          currentUser &&
                          currentUser.addresses &&
                          currentUser.addresses.length > 0 && (
                            <div className="mb-6">
                              <RadioGroup
                                value={selectedBillingAddressId || ""}
                                onValueChange={(value) => handleSelectBillingAddress(value)}
                                className="space-y-2"
                              >
                                {currentUser.addresses
                                  .filter(
                                    (addr) =>
                                      addr.addressType === AddressType.billing || addr.addressType === AddressType.both,
                                  )
                                  .map((address) =>
                                    renderAddressCard(
                                      address,
                                      selectedBillingAddressId === address.id,
                                      () => handleSelectBillingAddress(address.id),
                                      false,
                                    ),
                                  )}
                              </RadioGroup>

                              <Button
                                variant="outline"
                                className="mt-3 flex items-center gap-2"
                                onClick={() => setShowNewBillingAddress(true)}
                              >
                                <Plus className="h-4 w-4" />
                                Agregar nueva dirección de facturación
                              </Button>
                            </div>
                          )}

                        {/* New billing address form */}
                        {(showNewBillingAddress || !isAuthenticated || !currentUser?.addresses?.length) && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="billingAddress">Dirección</Label>
                                <Input
                                  id="billingAddress"
                                  name="billingAddress"
                                  value={formData.billingAddress}
                                  onChange={handleInputChange}
                                  required={!formData.sameBillingAddress}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="billingPhone">Teléfono</Label>
                                <Input
                                  id="billingPhone"
                                  name="billingPhone"
                                  value={formData.billingPhone}
                                  onChange={handleInputChange}
                                  required={!formData.sameBillingAddress}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="billingApartment">Apartamento, suite, etc. (opcional)</Label>
                                <Input
                                  id="billingApartment"
                                  name="billingApartment"
                                  value={formData.billingApartment}
                                  onChange={handleInputChange}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="billingCity">Ciudad</Label>
                                <Input
                                  id="billingCity"
                                  name="billingCity"
                                  value={formData.billingCity}
                                  onChange={handleInputChange}
                                  required={!formData.sameBillingAddress}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="billingState">Departamento/Provincia</Label>
                                <Input
                                  id="billingState"
                                  name="billingState"
                                  value={formData.billingState}
                                  onChange={handleInputChange}
                                  required={!formData.sameBillingAddress}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="billingZipCode">Código postal</Label>
                                <Input
                                  id="billingZipCode"
                                  name="billingZipCode"
                                  value={formData.billingZipCode}
                                  onChange={handleInputChange}
                                  required={!formData.sameBillingAddress}
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={prevStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Atrás
                      </Button>
                      <Button onClick={nextStep}>
                        Continuar
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Combined Shipping and Payment Methods */}
                {currentStep === STEPS.SHIPPING_PAYMENT && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    {/* Shipping Method Section */}
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold mb-4">Método de envío</h2>

                      {isLoading ? (
                        <div className="py-8 flex justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : (
                        <RadioGroup
                          value={formData.shippingMethod}
                          onValueChange={(value) => handleSelectChange("shippingMethod", value)}
                          className="space-y-4"
                        >
                          {shippingMethods.map((method) => (
                            <div
                              key={method.id}
                              className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                            >
                              <RadioGroupItem value={method.id} id={method.id} />
                              <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                                <div className="flex items-center">
                                  {method.name.toLowerCase().includes("express") ? (
                                    <Package className="mr-3 h-5 w-5 text-primary" />
                                  ) : (
                                    <Truck className="mr-3 h-5 w-5 text-primary" />
                                  )}
                                  <div>
                                    <p className="font-medium">{method.name}</p>
                                    <p className="text-sm text-gray-500">
                                      {method.description || method.estimatedDeliveryTime}
                                    </p>
                                  </div>
                                </div>
                              </Label>
                              <span className="font-medium">
                                {currency}
                                {Number(method.prices[0]?.price).toFixed(2) || "0.00"}
                              </span>
                            </div>
                          ))}
                        </RadioGroup>
                      )}
                    </div>

                    <Separator />

                    {/* Payment Method Section */}
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold mb-4">Método de pago</h2>

                      {isLoading ? (
                        <div className="py-8 flex justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : (
                        <RadioGroup
                          value={formData.paymentMethod}
                          onValueChange={(value) => handleSelectChange("paymentMethod", value)}
                          className="space-y-4"
                        >
                          {paymentProviders.map((provider) => (
                            <div
                              key={provider.id}
                              className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                            >
                              <RadioGroupItem value={provider.id} id={provider.id} />
                              <Label htmlFor={provider.id} className="flex-1 cursor-pointer">
                                <div className="flex items-center">
                                  {getPaymentIcon(provider.name)}
                                  <div>
                                    <p className="font-medium">{provider.name}</p>
                                    <p className="text-sm text-gray-500">{provider.description}</p>
                                  </div>
                                </div>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      )}

                      {formData.paymentMethod &&
                        paymentProviders
                          .find((p) => p.id === formData.paymentMethod)
                          ?.name.toLowerCase()
                          .includes("tarjeta") && (
                          <div className="space-y-4 pt-4 border-t">
                            <div className="space-y-2">
                              <Label htmlFor="cardNumber">Número de tarjeta</Label>
                              <Input
                                id="cardNumber"
                                name="cardNumber"
                                value={formData.cardNumber}
                                onChange={handleInputChange}
                                placeholder="1234 5678 9012 3456"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="cardName">Nombre en la tarjeta</Label>
                              <Input
                                id="cardName"
                                name="cardName"
                                value={formData.cardName}
                                onChange={handleInputChange}
                                placeholder="John Doe"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="expiryDate">Fecha de expiración</Label>
                                <Input
                                  id="expiryDate"
                                  name="expiryDate"
                                  value={formData.expiryDate}
                                  onChange={handleInputChange}
                                  placeholder="MM/AA"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="cvv">CVV</Label>
                                <Input
                                  id="cvv"
                                  name="cvv"
                                  value={formData.cvv}
                                  onChange={handleInputChange}
                                  placeholder="123"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-2 pt-4">
                      <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Instrucciones especiales para la entrega"
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={prevStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Atrás
                      </Button>
                      <Button onClick={submitOrder} disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>Finalizar compra</>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Confirmation */}
                {currentStep === STEPS.CONFIRMATION && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12 px-4 text-center"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>

                    <h2 className="text-3xl font-bold mb-4">¡Gracias por tu compra!</h2>

                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Tu pedido ha sido recibido y está siendo procesado.
                      {isAuthenticated && currentUser
                        ? " Hemos enviado un correo electrónico con los detalles de tu compra."
                        : ""}
                    </p>

                    <div className="bg-gray-50 p-4 rounded-lg mb-8 w-full max-w-md">
                      <p className="text-gray-800 font-medium mb-2">
                        Número de pedido:{" "}
                        <span className="font-bold">{orderId || `CL-${Math.floor(Math.random() * 10000)}`}</span>
                      </p>
                      <p className="text-gray-600 text-sm">Guarda este número para futuras referencias.</p>
                    </div>

                    <div className="w-full max-w-md mb-8">
                      <a
                        href={`https://wa.me/${shopSettings?.[0]?.phone?.replace(/\s+/g, "") || ""}?text=${encodeURIComponent(
                          `Hola, acabo de realizar el pedido #${orderId || `CL-${Math.floor(Math.random() * 10000)}`} y quisiera coordinar el pago.

*Detalles del pedido:*
${items
  .map(
    (item) =>
      `- ${item.product.title} - ${Object.entries(item.variant.attributes || {})
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ")} (${item.quantity} x ${currency}${Number(item.variant.prices[0].price).toFixed(2)})`,
  )
  .join("\n")}

*Subtotal:* ${currency}${Number(subtotal).toFixed(2)}
*IGV (18%):* ${currency}${Number(tax).toFixed(2)}
*Envío:* ${currency}${Number(shipping).toFixed(2)}
*Total:* ${currency}${Number(total).toFixed(2)}

*Dirección de envío:*
${formData.firstName} ${formData.lastName}
${formData.address}${formData.apartment ? `, ${formData.apartment}` : ""}
${formData.city}, ${formData.state} ${formData.zipCode}

${
  !formData.sameBillingAddress
    ? `*Dirección de facturación:*
  ${formData.billingAddress}${formData.billingApartment ? `, ${formData.billingApartment}` : ""}
${formData.billingCity}, ${formData.billingState} ${formData.billingZipCode}`
    : "*Dirección de facturación:* Misma que la dirección de envío"
}

Gracias.`,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-medium py-4 px-6 rounded-lg w-full transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="white"
                          stroke="currentColor"
                          strokeWidth="0"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Contactar por WhatsApp para gestionar el pago
                      </a>
                      <p className="text-sm text-gray-500 mt-2 text-center">
                        Nuestro equipo te ayudará a completar el proceso de pago y responderá todas tus dudas.
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" asChild>
                        <Link href="/productos">Seguir comprando</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/">Volver al inicio</Link>
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            {currentStep !== STEPS.CONFIRMATION && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                  <h2 className="text-xl font-semibold mb-4">Resumen del pedido</h2>

                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.variant.id} className="flex justify-between text-sm">
                        <span>
                          {item.product.title} ({item.quantity})
                        </span>
                        <span className="font-medium">
                          {currency}
                          {Number(item.variant.prices[0].price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>
                        {currency}
                        {Number(subtotal).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>IGV (18%){taxesIncluded ? " (incluido)" : ""}</span>
                      <span>
                        {currency}
                        {Number(tax).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Envío</span>
                      <span>
                        {currency}
                        {Number(shipping).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>
                      {currency}
                      {Number(total).toFixed(2)}
                    </span>
                  </div>

                  {/* Shipping Address Summary (only show in payment step) */}
                  {currentStep === STEPS.SHIPPING_PAYMENT && (
                    <div className="mt-6 pt-6 border-t">
                      <div className="flex items-start mb-4">
                        <MapPin className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Dirección de envío</h3>
                          {isAuthenticated && currentUser && selectedShippingAddressId ? (
                            // Display selected address from user's saved addresses
                            (() => {
                              const address = currentUser.addresses?.find((a) => a.id === selectedShippingAddressId)
                              return address ? (
                                <>
                                  <p className="text-sm text-gray-600">
                                    {address.address1}, {address.address2 && `${address.address2}, `}
                                    {address.city}, {address.province} {address.zip}
                                  </p>
                                  {address.phone && <p className="text-sm text-gray-600">Tel: {address.phone}</p>}
                                </>
                              ) : null
                            })()
                          ) : (
                            // Display address from form data
                            <>
                              <p className="text-sm text-gray-600">
                                {formData.address}, {formData.apartment && `${formData.apartment}, `}
                                {formData.city}, {formData.state} {formData.zipCode}
                              </p>
                              <p className="text-sm text-gray-600">Tel: {formData.shippingPhone}</p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Billing Address */}
                      <div className="flex items-start">
                        <CreditCard className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Dirección de facturación</h3>
                          {formData.sameBillingAddress ? (
                            <p className="text-sm text-gray-600 italic">Misma que la dirección de envío</p>
                          ) : isAuthenticated && currentUser && selectedBillingAddressId ? (
                            // Display selected address from user's saved addresses
                            (() => {
                              const address = currentUser.addresses?.find((a) => a.id === selectedBillingAddressId)
                              return address ? (
                                <>
                                  <p className="text-sm text-gray-600">
                                    {address.address1}, {address.address2 && `${address.address2}, `}
                                    {address.city}, {address.province} {address.zip}
                                  </p>
                                  {address.phone && <p className="text-sm text-gray-600">Tel: {address.phone}</p>}
                                </>
                              ) : null
                            })()
                          ) : !formData.sameBillingAddress ? (
                            // Display address from form data
                            <>
                              <p className="text-sm text-gray-600">
                                {formData.billingAddress},{" "}
                                {formData.billingApartment && `${formData.billingApartment}, `}
                                {formData.billingCity}, {formData.billingState} {formData.billingZipCode}
                              </p>
                              {formData.billingPhone && (
                                <p className="text-sm text-gray-600">Tel: {formData.billingPhone}</p>
                              )}
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
