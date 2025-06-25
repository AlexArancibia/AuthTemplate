"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useCartStore } from "@/stores/cartStore"
import { useEmailStore } from "@/stores/emailStore" // Add email store import
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { toast } from "sonner"
import { OrderFinancialStatus, OrderFulfillmentStatus, ShippingStatus } from "@/types/common"
 
import { type AddressCreateData, useUserStore } from "@/stores/userStore"
import { formatUserName } from "@/lib/user-utils"
import type { Order } from "@/types/order"

// Import modular components
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
    shippingMethods, // Esta será la lista de métodos de envío, actualizada por la nueva función
    paymentProviders,
    createOrder,
    fetchShippingMethodsByLocation, // <--- Nueva función importada
    fetchGeoCountries,
    fetchGeoStates,
    fetchGeoCities,
    calculateShippingCost, // <--- Importar la nueva función
  } = useMainStore()
  const { currentUser, loading: userLoading, fetchUserByEmail, createAddress } = useUserStore()
  const { sendOrderEmails } = useEmailStore()

  // --- INICIO: Estados para datos geográficos ---
  const [countries, setCountries] = useState<GeoCountry[]>([])
  const [states, setStates] = useState<GeoState[]>([])
  const [geoCities, setGeoCities] = useState<GeoCity[]>([]) // Renombrado para evitar conflicto con formData.city

  const [selectedCountryCode, setSelectedCountryCode] = useState<string | undefined>(undefined)
  const [selectedStateCode, setSelectedStateCode] = useState<string | undefined>(undefined) // Almacenará el CÓDIGO del estado
  const [selectedCityName, setSelectedCityName] = useState<string | undefined>(undefined)
  const [calculatedShippingCostDetails, setCalculatedShippingCostDetails] = useState<any | null>(null) // <--- Nuevo estado
  const [cartWeight, setCartWeight] = useState<number>(0) // <--- Nuevo estado para el peso del carrito
  // --- FIN: Estados para datos geográficos ---

  // State for user session
  const [session, setSession] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const [showNewShippingAddress, setShowNewShippingAddress] = useState(false)
  const [showNewBillingAddress, setShowNewBillingAddress] = useState(false)
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState<string | null>(null)
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<string | null>(null)

  const [currentStep, setCurrentStep] = useState(STEPS.CART_REVIEW)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
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
    shippingPhone: "",
    countryCode: "", // Nuevo campo para el código de país seleccionado
    stateCode: "", // Nuevo campo para el código de estado/provincia seleccionado

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

  // Initial page loading & Fetch Countries
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await fetchGeoCountries().then(setCountries).catch(console.error);
        setPageLoading(false)
      } catch (error) {
        console.error("Error loading initial data:", error)
        setPageLoading(false)
      }
    }

    loadInitialData()
    const timeout = setTimeout(() => setPageLoading(false), 3000) // Fallback
    return () => clearTimeout(timeout)
  }, [fetchGeoCountries]) // Dependencia de fetchGeoCountries

  // Fetch user session and data
  useEffect(() => {
    const fetchSessionAndUser = async () => {
      console.log("🔍 Starting to fetch session and user data...")
      try {
        // For client components, we need to use a different approach to get the session
        // Instead of importing auth directly, we'll make a fetch request to an API endpoint
        const response = await fetch("/api/auth/session")
        console.log("📡 Session API response status:", response.status)

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
          setSelectedShippingAddressId(shippingAddressToUse.id)
          setShippingAddressId(shippingAddressToUse.id)

          // Poblar formData con la dirección existente
          setFormData((prev) => ({
            ...prev,
            address: shippingAddressToUse.address1,
            apartment: shippingAddressToUse.address2 || "",
            city: shippingAddressToUse.city, // Nombre de la ciudad
            state: shippingAddressToUse.province || "", // Nombre o código del estado. Asumimos que es el nombre aquí.
            zipCode: shippingAddressToUse.zip,
            shippingPhone: shippingAddressToUse.phone || currentUser.phone || "",
            countryCode: shippingAddressToUse.country, // Código del país
             // stateCode se establecerá después de cargar los estados
          }))

          setSelectedCountryCode(shippingAddressToUse.country);
          setSelectedCityName(shippingAddressToUse.city); // Guardar nombre de ciudad para el fetch de shipping methods

          // Cargar estados y luego ciudades, y finalmente el stateCode
          if (shippingAddressToUse.country) {
            fetchGeoStates(shippingAddressToUse.country).then(loadedStates => {
              setStates(loadedStates);
              // 'shippingAddressToUse.province' podría ser el nombre o el código.
              // Intentamos encontrar el estado por nombre o código.
              const stateObj = loadedStates.find(s => s.code === shippingAddressToUse.province || s.name === shippingAddressToUse.province);
              if (stateObj) {
                setSelectedStateCode(stateObj.code); // Guardar el CÓDIGO del estado
                setFormData(prev => ({...prev, stateCode: stateObj.code, state: stateObj.name})); // Actualizar formData
                fetchGeoCities(stateObj.id).then(loadedCities => {
                  setGeoCities(loadedCities);
                  // No es necesario setSelectedCityName aquí si ya se hizo arriba y formData.city se actualiza
                }).catch(console.error);
              } else if (shippingAddressToUse.province) {
                // Si no se encontró el estado, al menos guardar el valor original en formData
                // y asumir que shippingAddressToUse.province podría ser el código que necesitamos
                setSelectedStateCode(shippingAddressToUse.province);
                setFormData(prev => ({...prev, stateCode: shippingAddressToUse.province, state: shippingAddressToUse.province}));
              }
            }).catch(console.error);
          }
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
  }, [currentUser, fetchGeoStates, fetchGeoCities]) // Añadidas dependencias fetchGeoStates, fetchGeoCities


  // Set default shipping (será manejado por el useEffect de abajo) y payment methods
  useEffect(() => {
    // Quitar la lógica de shippingMethods de aquí, será manejada por el useEffect de abajo
    // if (shippingMethods.length > 0 && !formData.shippingMethod) {
    //   setFormData((prev) => ({
    //     ...prev,
    //     shippingMethod: shippingMethods[0].id,
    //   }))
    // }

    if (paymentProviders.length > 0 && !formData.paymentMethod) {
      setFormData((prev) => ({
        ...prev,
        paymentMethod: paymentProviders[0].id,
      }))
    }
  }, [paymentProviders, formData.paymentMethod]) // Removido shippingMethods y formData.shippingMethod de dependencias

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Si cambia zipCode, el useEffect de fetchShippingMethodsByLocation se activará.
  }

  // Handle select changes (geográficos y otros)
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value })); // Actualiza el campo correspondiente en formData

    if (name === "countryCode") {
      setSelectedCountryCode(value);
      setStates([]);
      setSelectedStateCode(undefined);
      setFormData(p => ({...p, stateCode: "", state: ""})); // Limpia state y stateCode
      setGeoCities([]);
      setSelectedCityName(undefined);
      setFormData(p => ({...p, city: ""})); // Limpia city
      if (value) {
        fetchGeoStates(value).then(setStates).catch(console.error);
      } else {
        // Si se deselecciona el país, limpiar también los métodos de envío
        useMainStore.setState({ shippingMethods: [] });
        setFormData(p => ({...p, shippingMethod: ""}));
      }
    } else if (name === "stateCode") {
      setSelectedStateCode(value); // value es el CÓDIGO del estado
      const stateObj = states.find(s => s.code === value);
      setFormData(p => ({...p, state: stateObj?.name || value })); // Guardar nombre del estado en formData.state
      setGeoCities([]);
      setSelectedCityName(undefined);
      setFormData(p => ({...p, city: ""}));
      if (stateObj?.id) {
        fetchGeoCities(stateObj.id).then(setGeoCities).catch(console.error);
      }
    } else if (name === "city") {
      setSelectedCityName(value); // value es el NOMBRE de la ciudad
      // Actualiza formData.city para que se muestre en el input (si es texto) o se use en submitOrder
      setFormData(prev => ({...prev, city: value}));
      const cityObj = geoCities.find(c => c.name === value);
      if (cityObj?.postalCode) {
        setFormData(p => ({...p, zipCode: cityObj.postalCode}));
      }
    }
  };

  // useEffect para cargar métodos de envío por ubicación
  useEffect(() => {
    if (selectedCountryCode) { // Solo intentar cargar si hay un país seleccionado
      setIsLoading(true);
      fetchShippingMethodsByLocation(
        selectedCountryCode,
        selectedStateCode,
        selectedCityName,
        formData.zipCode,
      )
        .then((methods) => {
          if (methods && methods.length > 0) {
            // Si el método actual no está en la nueva lista, o no hay ninguno, seleccionar el primero
            if (!formData.shippingMethod || !methods.find(m => m.id === formData.shippingMethod)) {
              setFormData((prev) => ({ ...prev, shippingMethod: methods[0].id }));
            }
          } else { // No hay métodos para la ubicación
            setFormData((prev) => ({ ...prev, shippingMethod: "" }));
            if (currentStep === STEPS.SHIPPING_PAYMENT && (selectedCountryCode || selectedStateCode || selectedCityName || formData.zipCode)) {
                 toast.info("No hay métodos de envío disponibles para la ubicación seleccionada.");
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching shipping methods by location:", error);
          if (currentStep === STEPS.SHIPPING_PAYMENT) { // Solo mostrar error si estamos en el paso de envío
            toast.error("No se pudieron cargar los métodos de envío para tu ubicación.");
          }
          setFormData((prev) => ({ ...prev, shippingMethod: "" }));
        })
        .finally(() => setIsLoading(false));
    } else {
      // Si no hay país seleccionado, limpiar los métodos de envío.
      useMainStore.setState({ shippingMethods: [] });
      setFormData((prev) => ({ ...prev, shippingMethod: "" }));
    }
  }, [selectedCountryCode, selectedStateCode, selectedCityName, formData.zipCode, fetchShippingMethodsByLocation, currentStep]);
  // Removido formData.shippingMethod de las dependencias para evitar bucles si la selección del primer método dispara el efecto.

  // --- INICIO: Calcular peso del carrito ---
  const calculateCartWeight = () => {
    let totalWeight = 0;
    items.forEach(item => {
      const itemWeight = item.variant.weightValue || 0; // Usar 0 si no hay peso definido
      if (item.variant.weightValue == null) { // null o undefined
        console.warn(`[CART WEIGHT] Variante ${item.variant.title} (ID: ${item.variant.id}) no tiene peso definido. Usando 0kg.`);
      }
      totalWeight += itemWeight * item.quantity;
    });
    return totalWeight;
  };

  useEffect(() => {
    setCartWeight(calculateCartWeight());
  }, [items]);
  // --- FIN: Calcular peso del carrito ---

  // --- INICIO: useEffect para calcular costo de envío detallado ---
  useEffect(() => {
    if (formData.shippingMethod && selectedCountryCode && cartWeight > 0) { // Requiere método, país y peso
      // setIsLoading(true); // Podríamos usar un loader específico para esto si no queremos usar el global
      console.log(`Solicitando cálculo de costo: methodId=${formData.shippingMethod}, weight=${cartWeight}, country=${selectedCountryCode}, state=${selectedStateCode}, city=${selectedCityName}, zip=${formData.zipCode}`);
      calculateShippingCost(
        formData.shippingMethod,
        cartWeight,
        selectedCountryCode,
        selectedStateCode,
        selectedCityName,
        formData.zipCode
      )
      .then(details => {
        setCalculatedShippingCostDetails(details);
        console.log("[SHIPPING COST] Detalles de costo calculado:", details);
      })
      .catch(error => {
        console.error("Error calculating shipping cost details:", error);
        setCalculatedShippingCostDetails(null); // Limpiar en caso de error
        // No mostramos toast aquí directamente, getShippingCost() usará el precio base como fallback
      })
      // .finally(() => setIsLoading(false)); // Controlar loader si es específico
    } else {
      // Limpiar detalles si no se cumplen las condiciones para calcular
      if (calculatedShippingCostDetails !== null) { // Evitar re-render innecesario
        setCalculatedShippingCostDetails(null);
      }
    }
  }, [
    formData.shippingMethod,
    cartWeight,
    selectedCountryCode,
    selectedStateCode,
    selectedCityName,
    formData.zipCode,
    calculateShippingCost
  ]);
  // --- FIN: useEffect para calcular costo de envío detallado ---

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
    const address = currentUser?.addresses?.find(addr => addr.id === addressId);
    if (address) {
        setSelectedShippingAddressId(addressId);
        setShippingAddressId(addressId);
        setShowNewShippingAddress(false);

        // Poblar formData y estados geo como en el useEffect de currentUser
        setFormData(prev => ({
            ...prev,
            address: address.address1,
            apartment: address.address2 || "",
            city: address.city,
            state: address.province || "", // Nombre o código
            zipCode: address.zip,
            shippingPhone: address.phone || currentUser?.phone || "",
            countryCode: address.country,
            stateCode: "", // Se actualizará después de cargar estados
        }));

        setSelectedCountryCode(address.country);
        setSelectedCityName(address.city); // Para el fetch de shipping methods
        setStates([]); // Limpiar estados anteriores
        setGeoCities([]); // Limpiar ciudades anteriores
        setSelectedStateCode(undefined);


        if (address.country) {
            fetchGeoStates(address.country).then(loadedStates => {
                setStates(loadedStates);
                const stateObj = loadedStates.find(s => s.code === address.province || s.name === address.province);
                if (stateObj) {
                    setSelectedStateCode(stateObj.code);
                    setFormData(prev => ({ ...prev, stateCode: stateObj.code, state: stateObj.name }));
                    fetchGeoCities(stateObj.id).then(loadedCities => {
                        setGeoCities(loadedCities);
                        // El nombre de la ciudad ya está en formData.city
                    }).catch(console.error);
                } else if (address.province) {
                    // Si no se encontró, asumir que address.province es el código
                    setSelectedStateCode(address.province);
                    setFormData(prev => ({ ...prev, stateCode: address.province, state: address.province }));
                }
            }).catch(console.error);
        }

        if (formData.sameBillingAddress) {
            setSelectedBillingAddressId(addressId);
            setBillingAddressId(addressId);
            // También se deberían poblar los campos de billing address en formData si es necesario
        }
    }
  };

  // Handle selecting an existing address for billing
  const handleSelectBillingAddress = (addressId: string) => {
    setSelectedBillingAddressId(addressId)
    setBillingAddressId(addressId)
    setShowNewBillingAddress(false)
  }

  // Save a new address to the user profile
  const saveNewAddress = async (isBilling: boolean) => {
    if (!isAuthenticated || !currentUser) {
      return null
    }

    try {
      // Prepare the new address data
      const newAddress: AddressCreateData = isBilling
        ? {
            addressType: AddressType.BILLING,
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
            addressType: AddressType.SHIPPING,
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

      console.log(
        `Creating new ${isBilling ? "billing" : "shipping"} address for user ID: ${currentUser.id}`,
        newAddress,
      )

      // Create the new address using the user store
      const createdAddress = await createAddress(currentUser.id, newAddress)

      if (createdAddress) {
        console.log(`Successfully created address with ID: ${createdAddress.id}`)

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
      } else {
        console.error("No address was created - returned null or undefined")
        return null
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
        totalTax = subtotalPrice - subtotalPrice / taxDivisor
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
      // Generate a random order number between 1 and 1000
      const orderNumber = Math.floor(Math.random() * 1000) + 1

      const orderData = {
        storeId: process.env.NEXT_PUBLIC_STORE_ID || "store_default", // Use environment variable with fallback
        orderNumber: orderNumber, // Add the orderNumber field
        currencyId: currencyId,
        totalPrice,
        subtotalPrice,
        totalTax,
        totalDiscounts: 0,
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
        couponId: null, // Set to null when no coupon
        paymentProviderId: formData.paymentMethod || null, // Set to null when no payment method
        shippingMethodId: formData.shippingMethod || null, // Set to null when no shipping method
        financialStatus: OrderFinancialStatus.PENDING,
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
            console.error("❌ Error sending order emails:", emailError)
            // Don't throw here, we don't want to fail the order if email fails
            // The order was created successfully, email failure is not critical
          }
        } catch (error) {
          console.error(`Order creation attempt ${retryCount + 1} failed:`, error)
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
        description: `Pedido #${orderId} creado. Recibirás un correo con los detalles de tu compra.`,
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
    // Si tenemos detalles del cálculo de la API, usamos el costo total de ahí
    if (calculatedShippingCostDetails && typeof calculatedShippingCostDetails.totalCost === 'number') {
      return calculatedShippingCostDetails.totalCost;
    }
    // Fallback al precio base del método si no hay cálculo detallado (o si el cálculo falló y es null)
    // Esto mantiene el comportamiento anterior si el cálculo avanzado no está disponible.
    if (!formData.shippingMethod || shippingMethods.length === 0) return 0;
    const selectedMethod = shippingMethods.find((method) => method.id === formData.shippingMethod);
    // Asegurarse que selectedMethod y selectedMethod.prices existen y tienen elementos
    if (selectedMethod && selectedMethod.prices && selectedMethod.prices.length > 0) {
        return selectedMethod.prices[0].price || 0;
    }
    return 0; // Fallback final si no se encuentra nada
  }

  // Calculate totals
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
                    currentUser={currentUser}
                    showNewShippingAddress={showNewShippingAddress}
                    setShowNewShippingAddress={setShowNewShippingAddress}
                    showNewBillingAddress={showNewBillingAddress}
                    setShowNewBillingAddress={setShowNewBillingAddress}
                    selectedShippingAddressId={selectedShippingAddressId}
                    selectedBillingAddressId={selectedBillingAddressId}
                    handleSelectShippingAddress={handleSelectShippingAddress}
                    handleSelectBillingAddress={handleSelectBillingAddress}
                    handleBillingAddressToggle={handleBillingAddressToggle}
                    copyShippingToBilling={copyShippingToBilling}
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
                  shippingMethods={shippingMethods}
                  paymentProviders={paymentProviders}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
// --- INICIO: Tipos Geo ---
// Estos tipos deben coincidir con los definidos en `stores/mainStore.ts`
interface GeoCountry {
  id: string; code: string; name: string; [key: string]: any;
}
interface GeoState {
  id: string; code: string; name: string; countryCode: string; [key: string]: any;
}
interface GeoCity {
  id: string; name: string; stateId: string; [key: string]: any;
}
// --- FIN: Tipos Geo ---
