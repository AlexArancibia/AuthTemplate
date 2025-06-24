import { Suspense, use } from "react"
import ProductSkeleton from "../_components/ProductSkeleton"
import ProductDetails from "../_components/ProductDetails"
 
 

export default function ProductPage({ params }: { params: Promise<{ id: string }> }){
  const resolvedParams = use(params)
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetails slug={resolvedParams.id} />
    </Suspense>
  )
}
  
