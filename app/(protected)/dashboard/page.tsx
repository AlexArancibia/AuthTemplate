import type { Metadata } from "next"
import { UserDashboard } from "@/components/dashboard/user-dashboard"

export const metadata: Metadata = {
  title: "Dashboard de Usuario",
  description: "Gestiona tu información, direcciones y pedidos",
}

export default function DashboardPage() {
  return <UserDashboard />
}
