import Link from "next/link"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

type PendingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function PendingPage({ searchParams }: PendingPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const externalReference = resolvedSearchParams.external_reference
  const orderReference =
    typeof externalReference === "string" ? externalReference : undefined

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Clock className="h-8 w-8" />
        </div>

        <h1 className="mb-3 text-2xl font-semibold text-gray-900">
          Pago pendiente
        </h1>

        <p className="mb-6 text-gray-600">
          MercadoPago esta procesando tu pago. Te avisaremos cuando la
          confirmacion se complete.
        </p>

        {orderReference ? (
          <p className="mb-6 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-700">
            Referencia del pedido:{" "}
            <span className="font-medium">{orderReference}</span>
          </p>
        ) : null}

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/">Volver a la tienda</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/cart">Ver carrito</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
