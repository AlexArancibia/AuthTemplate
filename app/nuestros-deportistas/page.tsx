import { Suspense } from "react"
import ProductSkeleton from "../productos/_components/ProductSkeleton"
import ProductDetails from "../productos/_components/ProductDetails"
import TrustSection from "../productos/_components/TrustSection"
 

export default function NuestrosDeportistasPage(){
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetails id="prod_3ef3b6c8-b084" />
      <TrustSection/>
    </Suspense>
  )
}
  

