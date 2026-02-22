import type { Metadata } from "next";
import { HomeHero } from "@/components/lujan/HomeHero";
import { EsfuerzoTransciende } from "@/components/lujan/EsfuerzoTransciende";
import { CategoriasProducto } from "@/components/lujan/CategoriasProducto";
import { NuestrosProductos } from "@/components/lujan/NuestrosProductos";
import { Testimonios } from "@/components/lujan/Testimonios";
import { NuestrasFotos } from "@/components/lujan/NuestrasFotos";
import { VenANuestraVitivinicola } from "@/components/lujan/VenANuestraVitivinicola";
import { VideoSection } from "@/components/lujan/VideoSection";
import { Publicaciones } from "@/components/lujan/Publicaciones";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Donde la tierra y el tiempo se transforman en vino. Vitivinícola Luján.",
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <EsfuerzoTransciende />
      <CategoriasProducto />
      <NuestrosProductos />
      <Testimonios />
      <NuestrasFotos />
      <VenANuestraVitivinicola />
      <VideoSection />
      <Publicaciones />
    </>
  );
}
