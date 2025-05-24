"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useUserStore } from "@/stores/userStore"
import { formatUserName } from "@/lib/user-utils"
import { UserProfileForm } from "@/components/dashboard/user-profile-form"
import { UserAddresses } from "@/components/dashboard/user-addresses"
import { UserOrders } from "@/components/dashboard/user-orders"
import { UserPasswordForm } from "@/components/dashboard/user-password-form"
import { LogOut, User, MapPin, ShoppingBag, Lock } from "lucide-react"

export function UserDashboard() {
  const router = useRouter()
  const { currentUser, loading, error, fetchUserByEmail, clearUserData } = useUserStore()
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/auth/session")

        if (!response.ok) {
          throw new Error("Failed to fetch session")
        }

        const session = await response.json()

        if (session && session.user && session.user.email) {
          await fetchUserByEmail(session.user.email)
        } else {
          // Redirect to login if no session
          router.push("/login")
          toast.error("Por favor inicia sesión para acceder a tu dashboard")
        }
      } catch (error) {
        console.error("Error fetching session:", error)
        toast.error("Error al cargar la sesión")
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()
  }, [fetchUserByEmail, router])

 

  if (isLoading || loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto py-10 px-4">
        <Card className="p-8 text-center">
          <CardTitle className="text-xl mb-4">Error al cargar el dashboard</CardTitle>
          <CardDescription className="text-base mb-6">{error}</CardDescription>
          <Button onClick={() => router.push("/")}>Volver al inicio</Button>
        </Card>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="container max-w-6xl mx-auto py-10 px-4">
        <Card className="p-8 text-center">
          <CardTitle className="text-xl mb-4">No se encontró información de usuario</CardTitle>
          <CardDescription className="text-base mb-6">
            Por favor inicia sesión para acceder a tu dashboard
          </CardDescription>
          <Button onClick={() => router.push("/login")}>Iniciar sesión</Button>
        </Card>
      </div>
    )
  }

  // Format user name
  const { firstName, lastName } = formatUserName(currentUser)
  const fullName = [firstName, lastName].filter(Boolean).join(" ")

  return (
    <div className="container max-w-6xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenido{fullName ? `, ${fullName}` : ""}. Gestiona tu información, direcciones y pedidos.
          </p>
        </div>
 
      </div>

      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 h-auto p-1">
          <TabsTrigger value="profile" className="flex items-center gap-2 py-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="addresses" className="flex items-center gap-2 py-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Direcciones</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2 py-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Pedidos</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 py-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Seguridad</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de perfil</CardTitle>
              <CardDescription>
                Actualiza tu información personal. Esta información se mostrará en tu perfil y en tus pedidos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserProfileForm user={currentUser} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Direcciones</CardTitle>
              <CardDescription>
                Gestiona tus direcciones de envío y facturación. Puedes agregar, editar y eliminar direcciones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserAddresses user={currentUser} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de pedidos</CardTitle>
              <CardDescription>Consulta el estado y los detalles de tus pedidos anteriores.</CardDescription>
            </CardHeader>
            <CardContent>
              <UserOrders userId={currentUser.id} userEmail={currentUser.email} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>Actualiza tu contraseña y gestiona la seguridad de tu cuenta.</CardDescription>
            </CardHeader>
            <CardContent>
              <UserPasswordForm user={currentUser} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="container max-w-6xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Skeleton className="h-10 w-40 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />

        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            <Skeleton className="h-10 w-32 mt-4" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
