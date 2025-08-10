"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useMainStore } from "@/stores/mainStore"
import { ProductStatus } from "@/types/common"
import { ProductCard } from "@/components/ProductCard"
import { useCurrencyStore } from "@/stores/currency"

export default function OfertasPage() {
  const { products } = useMainStore()
  const { selectedCurrencyId, acceptedCurrencies } = useCurrencyStore()

  // Filtrar productos que no estén en estado DRAFT y ordenar por fecha de creación (más recientes primero)
  const filteredProducts = products
    .filter((product) => product.status !== ProductStatus.DRAFT)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0)
      const dateB = new Date(b.createdAt || 0)
      return dateB.getTime() - dateA.getTime()
    })
    .slice(0, 10) // Tomar solo los 10 más recientes

  return (
    <main>
      {/* Sección hero con animación */}
      <motion.section
        className="relative py-24 sm:py-32 px-4 text-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/productsBanner.jpg')`,
          backgroundSize: '105%',
          backgroundPosition: 'center 19%',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 z-0 bg-blue-600/20"></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/100 via-black/40 to-black/30"></div>

        <div className="relative z-10 w-full max-w-[1600px] mx-auto flex flex-col items-center gap-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-white text-center mb-6">
            Descubre Nuestras
            <br className="hidden sm:inline" />
            Ofertas
          </h1>

          {/* Botón */}
          <Link href="/productos">
            <button className="bg-white text-black text-sm font-medium px-6 py-3 rounded-xs cursor-pointer">
              Ver más
            </button>
          </Link>

          {/* Logos */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-24 px-4">
            <img src="/xiom.png" alt="Xiom" className="h-8 w-auto" />
            <img src="/sanwei.png" alt="Sanwei" className="h-8 w-auto" />
            <img src="/butter2.png" alt="Butterfly" className="h-8 w-auto" />
            <img src="/victas_logo2.png" alt="Victas" className="h-8 w-auto" />
          </div>
        </div>
      </motion.section>

      {/* Sección de productos con animación */}
      <motion.section
        className="py-12 px-4 sm:px-6 lg:px-8 bg-white"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                selectedCurrencyId={selectedCurrencyId}
                acceptedCurrencies={acceptedCurrencies}
              />
            ))}
          </div>
        </div>
      </motion.section>
    </main>
  )
}
