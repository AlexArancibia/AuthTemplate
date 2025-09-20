"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { useCartStore } from "@/stores/cartStore"
import { useEmailStore } from "@/stores/emailStore"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { toast } from "sonner"
import { OrderFinancialStatus, OrderFulfillmentStatus, ShippingStatus } from "@/types/common"
import { type AddressCreateData, useUserStore } from "@/stores/userStore"
import { formatUserName } from "@/lib/user-utils"
import type { Order } from "@/types/order"
import { CartReviewStep } from "@/components/checkout/cart-review-step"
import { CustomerInfoStep } from "@/components/checkout/customer-info-step"
import { ShippingPaymentStep } from "@/components/checkout/shipping-payment-step"
import { ConfirmationStep } from "@/components/checkout/confirmation-step"
import { OrderSummary } from "@/components/checkout/order-summary"
import { CheckoutSteps } from "@/components/checkout/checkout-steps"
import { CreditCard } from "lucide-react"
import Image from "next/image"
import { useMainStore } from "@/stores/mainStore"
import { AddressType } from "@/types/auth"

// Helper function to safely get price from variant (copied from order-summary.tsx)
const getSafePrice = (variant: any): number => {
  try {
    if (!variant) {
      console.warn("Variant is undefined or null")
      return 0
    }

    if (!variant.prices || !Array.isArray(variant.prices)) {
      console.warn("Variant prices is undefined or not an array:", variant)
      return 0
    }

    if (variant.prices.length === 0) {
      console.warn("Variant prices array is empty:", variant)
      return 0
    }

    const price = variant.prices[0]?.price
    
    // Convert to number and validate
    const numericPrice = Number(price)
    if (isNaN(numericPrice) || numericPrice < 0) {
      console.warn("Invalid price value:", price, "for variant:", variant)
      return 0
    }

    return numericPrice
  } catch (error) {
    console.error("Error getting price from variant:", error, variant)
    return 0
  }
}

const STEPS = {
  CART_REVIEW: 0,
  CUSTOMER_INFO: 1,
  SHIPPING_PAYMENT: 2,
  CONFIRMATION: 3,
}

export default function CheckoutPage() {
  const { items, clearCart, getTotal } = useCartStore()
  const { shopSettings, shippingMethods, paymentProviders, coupons, couponCode, createOrder } = useMainStore()
  const { currentUser, loading: userLoading, fetchUserByEmail, createAddress, deleteAddress } = useUserStore()
  const { sendOrderEmails } = useEmailStore()
  const searchParams = useSearchParams()

  const [session, setSession] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authCheckComplete, setAuthCheckComplete] = useState(false)
  const [showNewShippingAddress, setShowNewShippingAddress] = useState(false)
  const [showNewBillingAddress, setShowNewBillingAddress] = useState(false)
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState<string | null>(null)
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<string | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  
  // Determinar el paso inicial basado en si viene del login
  const getInitialStep = () => {
    const fromLogin = searchParams.get('fromLogin')
    return fromLogin === 'true' ? STEPS.CUSTOMER_INFO : STEPS.CART_REVIEW
  }
  
  const [currentStep, setCurrentStep] = useState(getInitialStep())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [shippingAddressId, setShippingAddressId] = useState<string | null>(null)
  const [billingAddressId, setBillingAddressId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    shippingPhone: "",
    sameBillingAddress: true,
    billingAddress: "",
    billingApartment: "",
    billingCity: "",
    billingState: "",
    billingZipCode: "",
    billingPhone: "",
    shippingMethod: "",
    paymentMethod: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    notes: "",
    preferredDeliveryDate: new Date().toISOString(),
  })


  useEffect(() => {
    if (couponCode && couponCode.trim() !== "") {
      applyCoupon()
    } else {
      setAppliedCoupon(null)
    }
  }, [couponCode])


  const applyCoupon = () => {
    
    if (!couponCode || !coupons || coupons.length === 0) {
      setAppliedCoupon(null)
      return
    }

    const foundCoupon = coupons.find((coupon) => coupon.code === couponCode)
    
    if (!foundCoupon) {
      toast.error("El cupón ingresado no es válido")
      setAppliedCoupon(null)
      return
    }


    // Verify coupon is active and within date range
    const now = new Date()
    const startDate = new Date(foundCoupon.startDate)
    const endDate = new Date(foundCoupon.endDate)

    if (!foundCoupon.isActive || now < startDate || now > endDate) {
      console.log("❌ Coupon not active or expired:", {
        isActive: foundCoupon.isActive,
        now: now.toISOString(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        beforeStart: now < startDate,
        afterEnd: now > endDate
      })
      toast.error("El cupón no está disponible o ha expirado")
      setAppliedCoupon(null)
      return
    }

    // Verify minimum purchase if specified
    const subtotal = getTotal()
    if (foundCoupon.minPurchase && subtotal < foundCoupon.minPurchase) {
      console.log("❌ Minimum purchase not met:", {
        minPurchase: foundCoupon.minPurchase,
        subtotal: subtotal
      })
      toast.error(`El cupón requiere un mínimo de compra de ${foundCoupon.minPurchase}`)
      setAppliedCoupon(null)
      return
    }

    // Verify max uses if specified
    if (foundCoupon.maxUses && foundCoupon.usedCount >= foundCoupon.maxUses) {
      console.log("❌ Max uses reached:", {
        maxUses: foundCoupon.maxUses,
        usedCount: foundCoupon.usedCount
      })
      toast.error("Este cupón ha alcanzado su límite de usos")
      setAppliedCoupon(null)
      return
    }

    
    setAppliedCoupon(foundCoupon)
    toast.success(`Cupón "${foundCoupon.code}" aplicado correctamente`)
  }

  const calculateDiscounts = () => {
    
    if (!appliedCoupon) return 0

    // Si el cupón no tiene restricciones específicas, se aplica a todo el carrito
    const hasSpecificRestrictions = (
      appliedCoupon.applicableProducts?.length > 0 ||
      appliedCoupon.applicableCategories?.length > 0 ||
      appliedCoupon.applicableCollections?.length > 0
    )

    if (!hasSpecificRestrictions) {
      // Cupón para todo el carrito
      const subtotal = getTotal()
      if (appliedCoupon.type === "PERCENTAGE") {
        return subtotal * (Number(appliedCoupon.value) / 100)
      } else if (appliedCoupon.type === "FIXED_AMOUNT") {
        return Math.min(Number(appliedCoupon.value), subtotal)
      }
    }

    // Cupón con restricciones específicas
    const isFeaturedCoupon = appliedCoupon.code === "TEST4"
    
    
    return items.reduce((totalDiscount, item) => {
      
      const isProductEligible = appliedCoupon.applicableProducts?.some(
        (prod: any) => prod.id === item.product.id
      )
      
      const isCategoryEligible = item.product.categories?.some(
        cat => appliedCoupon.applicableCategories?.some(
          (coupCat: { id: string }) => coupCat.id === cat.id
        )
      )
      
      const isCollectionEligible = item.product.collections?.some(
        col => appliedCoupon.applicableCollections?.some(
          (coupCol: { id: string }) => coupCol.id === col.id
        )
      )

      const isEligible = isProductEligible || isCategoryEligible || isCollectionEligible
      
      if (isFeaturedCoupon) {
        console.log(`  Elegibilidad: Producto=${isProductEligible}, Categoría=${isCategoryEligible}, Colección=${isCollectionEligible} = ${isEligible}`)
      }

      if (isEligible) {
        // Usar la función segura para obtener el precio
        const itemPrice = getSafePrice(item.variant)
        
        const discount = appliedCoupon.type === "PERCENTAGE" 
          ? (itemPrice * (Number(appliedCoupon.value) / 100) * item.quantity)
          : Number(appliedCoupon.value) * item.quantity
        
        if (isFeaturedCoupon) {
          console.log(`  ✅ Descuento aplicado: ${discount}`)
        }
        return totalDiscount + discount
      }
      return totalDiscount
    }, 0)
  }


  // Initial page loading
  useEffect(() => {
    const loadInitialData = async () => {
      try {
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

  // Fetch user session and data
  useEffect(() => {
    const fetchSessionAndUser = async () => {
      try {
        // For client components, we need to use a different approach to get the session
        // Instead of importing auth directly, we'll make a fetch request to an API endpoint
        const response = await fetch("/api/auth/session")

        if (!response.ok) {
          throw new Error(`Failed to fetch session: ${response.status}`)
        }

        const sessionData = await response.json()
        console.log("🔐 Session data:", sessionData)

        if (sessionData && sessionData.user && sessionData.user.email) {
          console.log("👤 User is authenticated, email:", sessionData.user.email)
          setSession(sessionData)
          setIsAuthenticated(true)

          // Fetch user data by email instead of ID
          console.log("🔄 Fetching user data for email:", sessionData.user.email)
          const userData = await fetchUserByEmail(sessionData.user.email)
          console.log("📋 User data fetched:", userData ? "Success" : "Failed")

          if (userData) {
            console.log("ℹ️ User info:", {
              name: userData.firstName + " " + userData.lastName,
              email: userData.email,
              hasAddresses: userData.addresses && userData.addresses.length > 0,
            })
          }
        } else {
          console.log("🔒 No authenticated user session found")
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("❌ Error fetching session or user data:", error)
        setIsAuthenticated(false)
      } finally {
        setAuthCheckComplete(true)
      }
    }

    fetchSessionAndUser()
  }, [fetchUserByEmail])

  // Populate form with user data when currentUser changes
  useEffect(() => {
    console.log("🔄 currentUser changed, checking for data to populate form...")

    if (currentUser) {
      console.log("👤 User data loaded:", {
        id: currentUser.id,
        name: `${currentUser.firstName || ""} ${currentUser.lastName || ""}`,
        email: currentUser.email,
        addressCount: currentUser.addresses?.length || 0,
      })

      // Populate form with user data
      console.log("📝 Populating form with user data...")
      setFormData((prev) => {
        const newFormData = {
          ...prev,
          firstName: currentUser.firstName || prev.firstName,
          lastName: currentUser.lastName || prev.lastName,
          email: currentUser.email || prev.email,
          phone: currentUser.phone || prev.phone,
          company: currentUser.company || prev.company,
          shippingPhone: currentUser.phone || prev.shippingPhone,
        }
        console.log("📋 Form data updated with user info:", {
          firstName: newFormData.firstName,
          lastName: newFormData.lastName,
          email: newFormData.email,
        })
        return newFormData
      })

      // Set customer ID
      setCustomerId(currentUser.id)
      console.log("🆔 Customer ID set:", currentUser.id)

      // If user has addresses, select the default one
      if (currentUser.addresses && currentUser.addresses.length > 0) {
        console.log("🏠 User has addresses:", currentUser.addresses.length)
        console.log(
          "🏠 Address details:",
          currentUser.addresses.map((addr) => ({
            id: addr.id,
            type: addr.addressType,
            isDefault: addr.isDefault,
            address: addr.address1,
          })),
        )

        // Find default shipping address
        const defaultShippingAddress = currentUser.addresses.find(
          (addr) =>
            addr.isDefault && (addr.addressType === AddressType.SHIPPING || addr.addressType === AddressType.BOTH),
        )
        console.log("🚚 Default shipping address:", defaultShippingAddress ? defaultShippingAddress.id : "None")

        // Find default billing address
        const defaultBillingAddress = currentUser.addresses.find(
          (addr) =>
            addr.isDefault && (addr.addressType === AddressType.BILLING || addr.addressType === AddressType.BOTH),
        )
        console.log("💳 Default billing address:", defaultBillingAddress ? defaultBillingAddress.id : "None")

        // If no default addresses, use the first appropriate address
        const firstShippingAddress = currentUser.addresses.find(
          (addr) => addr.addressType === AddressType.SHIPPING || addr.addressType === AddressType.BOTH,
        )
        console.log("🚚 First shipping address:", firstShippingAddress ? firstShippingAddress.id : "None")

        const firstBillingAddress = currentUser.addresses.find(
          (addr) => addr.addressType === AddressType.BILLING || addr.addressType === AddressType.BOTH,
        )
        console.log("💳 First billing address:", firstBillingAddress ? firstBillingAddress.id : "None")

        // Set shipping address
        const shippingAddressToUse = defaultShippingAddress || firstShippingAddress
        if (shippingAddressToUse) {
          console.log("🚚 Using shipping address:", shippingAddressToUse.id)
          setSelectedShippingAddressId(shippingAddressToUse.id)
          setShippingAddressId(shippingAddressToUse.id)

          // Also populate shipping form fields with the selected address data
          console.log("📝 Populating shipping form fields with address data...")
          setFormData((prev) => {
            const newFormData = {
              ...prev,
              address: shippingAddressToUse.address1,
              apartment: shippingAddressToUse.address2 || "",
              city: shippingAddressToUse.city,
              state: shippingAddressToUse.province || "",
              zipCode: shippingAddressToUse.zip,
              shippingPhone: shippingAddressToUse.phone || currentUser.phone || "",
            }
            console.log("📋 Shipping form fields updated:", {
              address: newFormData.address,
              city: newFormData.city,
              zipCode: newFormData.zipCode,
            })
            return newFormData
          })
        } else {
          console.log("🚚 No shipping address found, showing new address form")
          setShowNewShippingAddress(true)
        }

        // Set billing address
        const billingAddressToUse = defaultBillingAddress || firstBillingAddress
        if (billingAddressToUse) {
          console.log("💳 Using billing address:", billingAddressToUse.id)
          setSelectedBillingAddressId(billingAddressToUse.id)
          setBillingAddressId(billingAddressToUse.id)

          // Determine if shipping and billing are the same
          const isSameAddress = shippingAddressToUse?.id === billingAddressToUse?.id
          console.log("🔄 Shipping and billing addresses are the same:", isSameAddress)

          setFormData((prev) => {
            const newFormData = {
              ...prev,
              sameBillingAddress: isSameAddress,
              // Only populate billing fields if not using same address
              ...(isSameAddress
                ? {}
                : {
                    billingAddress: billingAddressToUse.address1,
                    billingApartment: billingAddressToUse.address2 || "",
                    billingCity: billingAddressToUse.city,
                    billingState: billingAddressToUse.province || "",
                    billingZipCode: billingAddressToUse.zip,
                    billingPhone: billingAddressToUse.phone || currentUser.phone || "",
                  }),
            }
            if (!isSameAddress) {
              console.log("📋 Billing form fields updated:", {
                billingAddress: newFormData.billingAddress,
                billingCity: newFormData.billingCity,
                billingZipCode: newFormData.billingZipCode,
              })
            }
            return newFormData
          })
        } else if (shippingAddressToUse) {
          // Use shipping address for billing if no billing address exists
          console.log("💳 No billing address found, using shipping address")
          setSelectedBillingAddressId(shippingAddressToUse.id)
          setBillingAddressId(shippingAddressToUse.id)
          setFormData((prev) => ({ ...prev, sameBillingAddress: true }))
        } else {
          console.log("💳 No billing address found, showing new address form")
          setShowNewBillingAddress(true)
        }
      } else {
        // If no addresses, show the new address form
        console.log("🏠 User has no addresses, showing new address forms")
        setShowNewShippingAddress(true)
      }
    } else {
      console.log("👤 No user data available")
    }
  }, [currentUser])

  // Set loading to false since data is already being fetched elsewhere
  useEffect(() => {
    setIsLoading(false)
  }, [])

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
    // Minimizar el formulario cuando se selecciona una dirección existente
    setShowNewShippingAddress(false)
    
    // Limpiar el formulario de nueva dirección
    setFormData((prev) => ({
      ...prev,
      address: "",
      apartment: "",
      city: "",
      state: "",
      zipCode: "",
      shippingPhone: "",
      country: "",
      countryCode3: "",
      stateId: "",
      cityId: "",
    }))

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
    // Minimizar el formulario cuando se selecciona una dirección existente
    setShowNewBillingAddress(false)
    
    // Limpiar el formulario de nueva dirección de facturación
    setFormData((prev) => ({
      ...prev,
      billingAddress: "",
      billingApartment: "",
      billingCity: "",
      billingState: "",
      billingZipCode: "",
      billingPhone: "",
      billingCountry: "",
      billingCountryCode: "",
      billingCountryCode3: "",
      billingStateId: "",
      billingCityId: "",
    }))
  }

  // Handle deselecting shipping address (for new address form)
  const handleDeselectShippingAddress = () => {
    setSelectedShippingAddressId(null)
    setShippingAddressId(null)
  }

  // Handle deselecting billing address (for new address form)
  const handleDeselectBillingAddress = () => {
    setSelectedBillingAddressId(null)
    setBillingAddressId(null)
  }

  // Handle editing an address
  const handleEditAddress = async (addressId: string) => {
    if (!isAuthenticated || !currentUser) return
    
    try {
      // La funcionalidad de edición se maneja en el componente CustomerInfoStep
      // Esta función es solo un placeholder para la interfaz
      console.log("Editing address:", addressId)
    } catch (error) {
      console.error("Error editing address:", error)
      toast.error("Error al editar la dirección")
    }
  }

  // Handle deleting an address
  const handleDeleteAddress = async (addressId: string) => {
    if (!isAuthenticated || !currentUser) return
    
    try {
      await deleteAddress(addressId)
      // Si la dirección eliminada estaba seleccionada, deseleccionarla
      if (selectedShippingAddressId === addressId) {
        setSelectedShippingAddressId(null)
        setShippingAddressId(null)
      }
      if (selectedBillingAddressId === addressId) {
        setSelectedBillingAddressId(null)
        setBillingAddressId(null)
      }
      toast.success("Dirección eliminada correctamente")
    } catch (error) {
      console.error("Error deleting address:", error)
      toast.error("Error al eliminar la dirección")
    }
  }

  // Save new addresses based on the intelligent logic
  const saveNewAddresses = async () => {
    if (!isAuthenticated || !currentUser) {
      return { shippingAddressId: null, billingAddressId: null }
    }

    try {
      let shippingAddressId = null
      let billingAddressId = null

      // Check if user has existing billing addresses
      const hasExistingBillingAddress = currentUser.addresses?.some(
        addr => addr.addressType === AddressType.BILLING || addr.addressType === AddressType.BOTH
      )

      console.log("=== ADDRESS CREATION LOGIC ===")
      console.log("Same billing address:", formData.sameBillingAddress)
      console.log("Has existing billing address:", hasExistingBillingAddress)
      console.log("Show new shipping address:", showNewShippingAddress)
      console.log("Show new billing address:", showNewBillingAddress)

      if (formData.sameBillingAddress) {
        // Scenario 1: Same billing address - Create ONE address of type BOTH
        console.log("Creating ONE address of type BOTH")
        
        const bothAddress: AddressCreateData = {
          addressType: AddressType.BOTH,
          address1: formData.address,
          address2: formData.apartment || undefined,
          city: formData.city,
          province: formData.state || undefined,
          zip: formData.zipCode,
          country: "PE",
          phone: formData.shippingPhone || undefined,
          company: formData.company || undefined,
          isDefault: !currentUser.addresses?.length,
        }

        const createdAddress = await createAddress(currentUser.id, bothAddress)
        if (createdAddress) {
          shippingAddressId = createdAddress.id
          billingAddressId = createdAddress.id
          setSelectedShippingAddressId(createdAddress.id)
          setSelectedBillingAddressId(createdAddress.id)
          setShippingAddressId(createdAddress.id)
          setBillingAddressId(createdAddress.id)
          toast.success("Nueva dirección guardada (envío y facturación)")
        }
      } else if (hasExistingBillingAddress && showNewShippingAddress && !showNewBillingAddress) {
        // Scenario 2: Has existing billing address and only creating shipping - Create ONE address of type SHIPPING only
        console.log("Creating ONE address of type SHIPPING (existing billing address)")
        
        const shippingAddress: AddressCreateData = {
          addressType: AddressType.SHIPPING,
          address1: formData.address,
          address2: formData.apartment || undefined,
          city: formData.city,
          province: formData.state || undefined,
          zip: formData.zipCode,
          country: "PE",
          phone: formData.shippingPhone || undefined,
          company: formData.company || undefined,
          isDefault: !currentUser.addresses?.length,
        }

        const createdAddress = await createAddress(currentUser.id, shippingAddress)
        if (createdAddress) {
          shippingAddressId = createdAddress.id
          setSelectedShippingAddressId(createdAddress.id)
          setShippingAddressId(createdAddress.id)
          toast.success("Nueva dirección de envío guardada")
        }
      } else if (!showNewShippingAddress && showNewBillingAddress) {
        // Scenario 2.5: Using existing shipping address and only creating billing - Create ONE address of type BILLING only
        console.log("Creating ONE address of type BILLING (existing shipping address)")
        
        const billingAddress: AddressCreateData = {
          addressType: AddressType.BILLING,
          address1: formData.billingAddress,
          address2: formData.billingApartment || undefined,
          city: formData.billingCity,
          province: formData.billingState || undefined,
          zip: formData.billingZipCode,
          country: "PE",
          phone: formData.billingPhone || undefined,
          company: formData.company || undefined,
          isDefault: false, // Don't set as default since we're using existing shipping
        }

        const createdAddress = await createAddress(currentUser.id, billingAddress)
        if (createdAddress) {
          billingAddressId = createdAddress.id
          setSelectedBillingAddressId(createdAddress.id)
          setBillingAddressId(createdAddress.id)
          toast.success("Nueva dirección de facturación guardada")
        }
      } else if (showNewShippingAddress && showNewBillingAddress) {
        // Scenario 3: Create TWO addresses - one SHIPPING and one BILLING
        console.log("Creating TWO addresses - SHIPPING and BILLING")
        
        // Create shipping address first
        const shippingAddress: AddressCreateData = {
          addressType: AddressType.SHIPPING,
          address1: formData.address,
          address2: formData.apartment || undefined,
          city: formData.city,
          province: formData.state || undefined,
          zip: formData.zipCode,
          country: "PE",
          phone: formData.shippingPhone || undefined,
          company: formData.company || undefined,
          isDefault: !currentUser.addresses?.length,
        }

        const createdShippingAddress = await createAddress(currentUser.id, shippingAddress)
        if (createdShippingAddress) {
          shippingAddressId = createdShippingAddress.id
          setSelectedShippingAddressId(createdShippingAddress.id)
          setShippingAddressId(createdShippingAddress.id)
        }

        // Create billing address
        const billingAddress: AddressCreateData = {
          addressType: AddressType.BILLING,
          address1: formData.billingAddress,
          address2: formData.billingApartment || undefined,
          city: formData.billingCity,
          province: formData.billingState || undefined,
          zip: formData.billingZipCode,
          country: "PE",
          phone: formData.billingPhone || undefined,
          company: formData.company || undefined,
          isDefault: false, // Don't set as default since shipping was created first
        }

        const createdBillingAddress = await createAddress(currentUser.id, billingAddress)
        if (createdBillingAddress) {
          billingAddressId = createdBillingAddress.id
          setSelectedBillingAddressId(createdBillingAddress.id)
          setBillingAddressId(createdBillingAddress.id)
        }

        if (createdShippingAddress && createdBillingAddress) {
          toast.success("Nuevas direcciones de envío y facturación guardadas")
        }
      }

      console.log("=== ADDRESS CREATION COMPLETE ===")
      console.log("Shipping Address ID:", shippingAddressId)
      console.log("Billing Address ID:", billingAddressId)

      return { shippingAddressId, billingAddressId }
    } catch (error) {
      console.error("Error saving new addresses:", error)
      toast.error("Error al guardar las direcciones")
      return { shippingAddressId: null, billingAddressId: null }
    }
  }

  // Legacy function for backward compatibility (now calls the new logic)
  const saveNewAddress = async (isBilling: boolean) => {
    const result = await saveNewAddresses()
    return isBilling ? result.billingAddressId : result.shippingAddressId
  }


  // Agregar cerca de las otras funciones (antes de submitOrder)
const applyCouponIfExists = () => {
  if (!couponCode || !coupons || coupons.length === 0) {
    return null;
  }

  const foundCoupon = coupons.find((coupon) => coupon.code === couponCode);
  
  if (!foundCoupon) {
    toast.error("El cupón ingresado no es válido");
    return null;
  }

  // Verificar si el cupón está activo y vigente
  const now = new Date();
  const startDate = new Date(foundCoupon.startDate);
  const endDate = new Date(foundCoupon.endDate);

  if (!foundCoupon.isActive || now < startDate || now > endDate) {
    toast.error("El cupón no está disponible o ha expirado");
    return null;
  }
  console.log("GAAAAA", foundCoupon)
  setAppliedCoupon(foundCoupon);
  return foundCoupon;
};

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

        // Initialize with selected address IDs if they exist
        if (selectedShippingAddressId) {
          calculatedShippingAddressId = selectedShippingAddressId
        }
        if (selectedBillingAddressId) {
          calculatedBillingAddressId = selectedBillingAddressId
        }

        console.log("=== ADDRESS ID INITIALIZATION ===")
        console.log("Selected shipping address ID:", selectedShippingAddressId)
        console.log("Selected billing address ID:", selectedBillingAddressId)
        console.log("Calculated shipping address ID:", calculatedShippingAddressId)
        console.log("Calculated billing address ID:", calculatedBillingAddressId)
        console.log("Show new shipping address:", showNewShippingAddress)
        console.log("Show new billing address:", showNewBillingAddress)

        // Save any new addresses using the intelligent logic
        if (showNewShippingAddress || showNewBillingAddress) {
          const addressResult = await saveNewAddresses()
          if (addressResult.shippingAddressId) {
            calculatedShippingAddressId = addressResult.shippingAddressId
          }
          if (addressResult.billingAddressId) {
            calculatedBillingAddressId = addressResult.billingAddressId
          }
        }

        console.log("=== FINAL ADDRESS IDS ===")
        console.log("Final calculated shipping address ID:", calculatedShippingAddressId)
        console.log("Final calculated billing address ID:", calculatedBillingAddressId)
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
      const coupon = applyCouponIfExists();

 

// Preparar line items con descuentos
const lineItems = prepareLineItems()

// Calcular el total de descuentos

      console.log("Prepared line items:", lineItems)

      // 4. Calculate totals
      const subtotalPrice = getTotal();
      const totalDiscounts = lineItems.reduce((sum, item) => sum + item.totalDiscount, 0);
      const subtotalAfterDiscount = subtotalPrice - totalDiscounts;

      let totalTax = 0;
      let totalPrice = 0;

      if (taxesIncluded) {
        const taxDivisor = 1 + taxRate;
        totalTax = subtotalAfterDiscount - subtotalAfterDiscount / taxDivisor;
        totalPrice = subtotalAfterDiscount + Number(getShippingCost());
      } else {
        totalTax = subtotalAfterDiscount * taxRate;
        totalPrice = subtotalAfterDiscount + totalTax + Number(getShippingCost());
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
      // Generate a random order number between 1 and 1000
      const orderNumber = Math.floor(Math.random() * 1000) + 1

      const orderData = {
        storeId: process.env.NEXT_PUBLIC_STORE_ID || "store_default", // Use environment variable with fallback
        orderNumber: orderNumber, // Add the orderNumber field
        currencyId: currencyId,
        totalPrice,
        subtotalPrice,
        totalTax,
        totalDiscounts,
        
        lineItems,
        // Create customerInfo JSON object with properly formatted name
        customerInfo: (() => {
          // Use the formatUserName utility function
          const { firstName, lastName } = formatUserName({
            firstName: formData.firstName || currentUser?.firstName || null,
            lastName: formData.lastName || currentUser?.lastName || null,
            name: currentUser?.name || null,
          })

          return {
            firstName,
            lastName,
            email: formData.email || currentUser?.email || "",
            phone: formData.phone || currentUser?.phone || "",
            company: formData.company || currentUser?.company || "",
            isAuthenticated: isAuthenticated,
            userId: currentUser?.id || null,
          }
        })(),
        // Create shippingAddress JSON object
        shippingAddress:
          isAuthenticated && calculatedShippingAddressId
            ? { id: calculatedShippingAddressId }
            : {
                address1: formData.address,
                address2: formData.apartment || undefined,
                city: formData.city,
                province: formData.state,
                zip: formData.zipCode,
                country: "PE",
                phone: formData.shippingPhone,
              },
        // Create billingAddress JSON object
        billingAddress: formData.sameBillingAddress
          ? null
          : isAuthenticated && calculatedBillingAddressId
            ? { id: calculatedBillingAddressId }
            : {
                address1: formData.billingAddress,
                address2: formData.billingApartment || undefined,
                city: formData.billingCity,
                province: formData.billingState,
                zip: formData.billingZipCode,
                country: "PE",
                phone: formData.billingPhone,
              },
        couponId: coupon?.id || null,
        paymentProviderId: formData.paymentMethod || null, // Set to null when no payment method
        shippingMethodId: formData.shippingMethod || null, // Set to null when no shipping method
        financialStatus:
          formData.paymentMethod === "pp_9c77d30e-6d2b"
            ? OrderFinancialStatus.PAID
            : OrderFinancialStatus.PENDING,
        fulfillmentStatus: OrderFulfillmentStatus.UNFULFILLED,
        shippingStatus: ShippingStatus.PENDING,
        customerNotes: formData.notes || "",
        internalNotes: "",
        source: "web",
        preferredDeliveryDate: formData.preferredDeliveryDate,
      }

      console.log("========== COMPLETE ORDER PAYLOAD ==========")
      console.log(JSON.stringify(orderData, null, 2))
      console.log("===========================================")

      console.log("========== DATOS COMPLETOS DE LA ORDEN ==========")
      console.log(JSON.stringify(orderData, null, 2))
      console.log("=================================================")

      // 6. Create the order
      console.log("Sending order data to server...")
      let orderCreationSuccess = false
      let retryCount = 0
      const maxRetries = 3

      while (!orderCreationSuccess && retryCount < maxRetries) {
        try {
          console.log(`Attempt ${retryCount + 1} to create order with orderNumber: ${orderData.orderNumber}`)
          const order = await createOrder(orderData)
          console.log("Order creation response:", order)

          if (!order || !order.id) {
            console.error("Failed to create order - no order ID returned")
            throw new Error("Failed to create order")
          }

          console.log("Order created successfully with ID:", order.id)
          setOrderId(order.id)
          orderCreationSuccess = true

          // 7. Send order confirmation emails using emailStore
          try {
            console.log("📧 Preparing to send order confirmation emails...")

            // Prepare order data for email templates using the Order schema
            const emailOrderData: Order = {
              id: order.id,
              storeId: order.storeId || process.env.NEXT_PUBLIC_STORE_ID || "store_default",
              orderNumber: order.orderNumber || orderNumber,
              currencyId: currencyId,
              // Use the complete Currency object from shopSettings
              currency: shopSettings?.[0]?.defaultCurrency || {
                id: currencyId,
                code: "PEN",
                name: "Nuevo Sol Peruano",
                symbol: "S/",
                decimalPlaces: 2,
                symbolPosition: "before",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              // customerInfo as Record<string, any> to match schema
              customerInfo: {
                name:
                  `${formData.firstName || currentUser?.firstName || ""} ${formData.lastName || currentUser?.lastName || ""}`.trim() ||
                  "Cliente",
                email: formData.email || currentUser?.email || "",
                phone: formData.phone || currentUser?.phone || "",
                company: formData.company || currentUser?.company || "",
                userId: currentUser?.id || null,
                isAuthenticated: isAuthenticated,
              },
              // shippingAddress as Record<string, any> to match schema
              shippingAddress: {
                name: `${formData.firstName || currentUser?.firstName || ""} ${formData.lastName || currentUser?.lastName || ""}`.trim(),
                address1: formData.address,
                address2: formData.apartment || "",
                city: formData.city,
                state: formData.state || "",
                postalCode: formData.zipCode,
                country: "PE",
                phone: formData.shippingPhone || formData.phone || currentUser?.phone || "",
              },
              // billingAddress as Record<string, any> to match schema
              billingAddress: formData.sameBillingAddress
                ? null
                : {
                    name: `${formData.firstName || currentUser?.firstName || ""} ${formData.lastName || currentUser?.lastName || ""}`.trim(),
                    address1: formData.billingAddress,
                    address2: formData.billingApartment || "",
                    city: formData.billingCity,
                    state: formData.billingState || "",
                    postalCode: formData.billingZipCode,
                    country: "PE",
                    phone: formData.billingPhone || formData.phone || currentUser?.phone || "",
                  },
              lineItems: lineItems.map((item) => ({
                id: `item_${Date.now()}_${Math.random()}`,
                orderId: order.id,
                variantId: item.variantId,
                title: item.title,
                quantity: item.quantity,
                price: item.price,
                totalDiscount: item.totalDiscount || 0,
                refundLineItems: [],
                createdAt: new Date(),
                updatedAt: new Date(),
              })),
              subtotalPrice: subtotalPrice,
              totalTax: totalTax,
              totalDiscounts: 0,
              totalPrice: totalPrice,
              financialStatus: OrderFinancialStatus.PENDING,
              fulfillmentStatus: OrderFulfillmentStatus.UNFULFILLED,
              shippingStatus: ShippingStatus.PENDING,
              paymentProvider: paymentProviders.find((p) => p.id === formData.paymentMethod) || null,
              paymentProviderId: formData.paymentMethod || null,
              shippingMethod: shippingMethods.find((m) => m.id === formData.shippingMethod) || null,
              shippingMethodId: formData.shippingMethod || null,
              customerNotes: formData.notes || "",
              trackingNumber: null,
              estimatedDeliveryDate: null,
              refunds: [],
              createdAt: new Date(),
              updatedAt: new Date(),
              // Optional fields that might be needed
              couponId: null,
              paymentStatus: null,
              paymentDetails: null,
              trackingUrl: null,
              shippedAt: null,
              deliveredAt: null,
              internalNotes: "",
              source: "web",
              preferredDeliveryDate: formData.preferredDeliveryDate ? new Date(formData.preferredDeliveryDate) : null,
              paymentTransactions: [],
            }

            console.log("📧 Email order data prepared:", emailOrderData)

            // Send both emails (client confirmation and admin notification) with shopSettings
            const emailResults = await sendOrderEmails(emailOrderData, shopSettings?.[0])

            if (emailResults.clientResult.success) {
              console.log("✅ Client confirmation email sent successfully")
            } else {
              console.error("❌ Failed to send client confirmation email:", emailResults.clientResult.message)
            }

            if (emailResults.adminResult.success) {
              console.log("✅ Admin notification email sent successfully")
            } else {
              console.error("❌ Failed to send admin notification email:", emailResults.adminResult.message)
            }

            // Show success message even if some emails failed
            if (emailResults.clientResult.success || emailResults.adminResult.success) {
              console.log("📧 At least one email was sent successfully")
            } else {
              console.warn("⚠️ Both emails failed to send, but order was created successfully")
            }
          } catch (emailError) {
            const emailErrorMessage = emailError instanceof Error ? emailError.message : String(emailError)
            console.error("❌ Error sending order emails:", emailErrorMessage)
            // Don't throw here, we don't want to fail the order if email fails
            // The order was created successfully, email failure is not critical
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          console.error(`Order creation attempt ${retryCount + 1} failed:`, errorMessage)
          retryCount++
          if (retryCount < maxRetries) {
            // Generate a new orderNumber for the retry
            orderData.orderNumber = Math.floor(Math.random() * 1000) + 1
            console.log(`Retrying with new orderNumber: ${orderData.orderNumber}`)
          } else {
            console.error("Max retries reached. Order creation failed.")
            toast.error("Error al procesar el pedido. Por favor, intenta nuevamente.")
            setIsSubmitting(false)
            return
          }
        }
      }

      // 8. Success
      console.log("Order process completed successfully")
      toast.success("¡Pedido realizado con éxito!", {
        description: `Pedido creado. Recibirás un correo con los detalles de tu compra.`,
      })

      clearCart()
      setCurrentStep(STEPS.CONFIRMATION)
    } catch (error) {
      console.error("Error submitting order:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error("Error details:", errorMessage)
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

  // Calculate totals
  const totalDiscounts = calculateDiscounts()
const subtotal = Number(getTotal())
const shipping = Number(getShippingCost())
const taxesIncluded = shopSettings?.[0]?.taxesIncluded || false
const taxRate = Number(shopSettings?.[0]?.taxValue || 18) / 100

// Calcular subtotal después de descuentos
const subtotalAfterDiscount = Math.max(0, subtotal - totalDiscounts)

let tax = 0
let total = 0

if (taxesIncluded) {
  // Si los impuestos están incluidos en el precio:
  // 1. Extraer el impuesto del subtotal original (antes de descuentos)
  const taxDivisor = 1 + taxRate
  const taxBeforeDiscount = subtotal - subtotal / taxDivisor
  
  // 2. Calcular qué porcentaje del impuesto corresponde al subtotal después de descuentos
  tax = (subtotalAfterDiscount / subtotal) * taxBeforeDiscount
  
  // 3. Calcular total (subtotal con descuento + envío)
  total = subtotalAfterDiscount + shipping
} else {
  // Si los impuestos NO están incluidos:
  // Calcular impuestos sobre el subtotal después de descuentos
  tax = subtotalAfterDiscount * taxRate
  total = subtotalAfterDiscount + tax + shipping
}

  const prepareLineItems = () => {
    if (!appliedCoupon) {
      return items.map((item) => ({
        variantId: item.variant.id,
        title: `${item.product.title} - ${item.variant.title}`,
        price: item.variant.prices[0].price,
        quantity: item.quantity,
        totalDiscount: 0,
      }))
    }

    // Si el cupón no tiene restricciones específicas, se aplica a todo el carrito
    const hasSpecificRestrictions = (
      appliedCoupon.applicableProducts?.length > 0 ||
      appliedCoupon.applicableCategories?.length > 0 ||
      appliedCoupon.applicableCollections?.length > 0
    )

    return items.map((item) => {
      let discount = 0
      
      if (!hasSpecificRestrictions) {
        // Cupón para todo el carrito - distribuir el descuento proporcionalmente
        const itemTotal = Number(item.variant.prices[0].price) * item.quantity
        const subtotal = getTotal()
        
        if (appliedCoupon.type === "PERCENTAGE") {
          discount = itemTotal * (Number(appliedCoupon.value) / 100)
        } else if (appliedCoupon.type === "FIXED_AMOUNT") {
          discount = (itemTotal / subtotal) * Math.min(Number(appliedCoupon.value), subtotal)
        }
      } else {
        // Cupón con restricciones específicas
        const isProductEligible = appliedCoupon.applicableProducts?.some(
          (prod: any) => prod.id === item.product.id
        )
        
        const isCategoryEligible = item.product.categories?.some(
          cat => appliedCoupon.applicableCategories?.some(
            (coupCat: { id: string }) => coupCat.id === cat.id
          )
        )
        
        const isCollectionEligible = item.product.collections?.some(
          col => appliedCoupon.applicableCollections?.some(
            (coupCol: { id: string }) => coupCol.id === col.id
          )
        )

        const isEligible = isProductEligible || isCategoryEligible || isCollectionEligible
        
        if (isEligible) {
          if (appliedCoupon.type === "PERCENTAGE") {
            discount = (Number(item.variant.prices[0].price) * (Number(appliedCoupon.value) / 100) * item.quantity)
          } else if (appliedCoupon.type === "FIXED_AMOUNT") {
            discount = Number(appliedCoupon.value) * item.quantity
          }
        }
      }

      return {
        variantId: item.variant.id,
        title: `${item.product.title} - ${item.variant.title}`,
        price: item.variant.prices[0].price,
        quantity: item.quantity,
        totalDiscount: discount,
      }
    })
  }

    const resumeItems = items
        .map((item) => `${item.product.title}: ${item.quantity}`)
        .join("\n");
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

  // Define steps for the checkout process
  const checkoutSteps = [
    { step: STEPS.CART_REVIEW, label: "Carrito" },
    { step: STEPS.CUSTOMER_INFO, label: "Información" },
    { step: STEPS.SHIPPING_PAYMENT, label: "Envío y Pago" },
    { step: STEPS.CONFIRMATION, label: "Confirmación" },
  ]

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen py-12">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        {/* Checkout Header */}
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
            Checkout
          </h1>

          {/* Progress Steps */}
          <CheckoutSteps steps={checkoutSteps} currentStep={currentStep} />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className={currentStep === STEPS.CONFIRMATION ? "lg:col-span-3" : "lg:col-span-2"}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-xl shadow-md border border-slate-100 p-6 sm:p-8"
              >
                {/* Step 1: Cart Review */}
                {currentStep === STEPS.CART_REVIEW && (
                  <CartReviewStep items={items} currency={currency} nextStep={nextStep} />
                )}

                {/* Step 2: Customer Information */}
                {currentStep === STEPS.CUSTOMER_INFO && (
                  <CustomerInfoStep
                    formData={formData}
                    handleInputChange={handleInputChange}
                    nextStep={nextStep}
                    prevStep={prevStep}
                    isAuthenticated={isAuthenticated}
                    authCheckComplete={authCheckComplete}
                    currentUser={currentUser}
                    showNewShippingAddress={showNewShippingAddress}
                    setShowNewShippingAddress={setShowNewShippingAddress}
                    showNewBillingAddress={showNewBillingAddress}
                    setShowNewBillingAddress={setShowNewBillingAddress}
                    selectedShippingAddressId={selectedShippingAddressId}
                    selectedBillingAddressId={selectedBillingAddressId}
                    handleSelectShippingAddress={handleSelectShippingAddress}
                    handleSelectBillingAddress={handleSelectBillingAddress}
                    handleDeselectShippingAddress={handleDeselectShippingAddress}
                    handleDeselectBillingAddress={handleDeselectBillingAddress}
                    handleBillingAddressToggle={handleBillingAddressToggle}
                    copyShippingToBilling={copyShippingToBilling}
                    onEditAddress={handleEditAddress}
                    onDeleteAddress={handleDeleteAddress}
                  />
                )}

                {/* Step 3: Combined Shipping and Payment Methods */}
                {currentStep === STEPS.SHIPPING_PAYMENT && (
                  <ShippingPaymentStep
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSelectChange={handleSelectChange}
                    prevStep={prevStep}
                    submitOrder={submitOrder}
                    isSubmitting={isSubmitting}
                    isLoading={isLoading}
                    shippingMethods={shippingMethods}
                    paymentProviders={paymentProviders}
                    getPaymentIcon={getPaymentIcon}
                    total={total}
                    resumeItems={resumeItems}
                    orderId={orderId}
                  />
                )}

                {/* Step 4: Confirmation */}
                {currentStep === STEPS.CONFIRMATION && (
                <ConfirmationStep
                  orderId={orderId}
                  isAuthenticated={isAuthenticated}
                  currentUser={currentUser}
                  formData={formData}
                  items={items}
                  subtotal={subtotal}
                  tax={tax}
                  shipping={shipping}
                  total={total}
                  currency={currency}
                  shopSettings={shopSettings}
                  selectedShippingAddressId={selectedShippingAddressId}
                  selectedBillingAddressId={selectedBillingAddressId}
                />
                )}
              </motion.div>
            </div>

            {/* Order Summary */}
            {currentStep !== STEPS.CONFIRMATION && (
              <div className="lg:col-span-1">
                <OrderSummary
                  items={items}
                  subtotal={subtotal}
                  tax={tax}
                  shipping={shipping}
                  total={total}
                  currency={currency}
                  currentStep={currentStep}
                  formData={formData}
                  totalDiscounts={totalDiscounts}
                  shippingMethods={shippingMethods}
                  paymentProviders={paymentProviders}
                  isAuthenticated={isAuthenticated}
                  currentUser={currentUser}
                  selectedShippingAddressId={selectedShippingAddressId}
                  selectedBillingAddressId={selectedBillingAddressId}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
