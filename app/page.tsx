import type { Metadata } from "next";
import { HomeHero } from "@/components/lujan/HomeHero";
import { EsfuerzoTransciende } from "@/components/lujan/EsfuerzoTransciende";
import { CategoriasProducto } from "@/components/lujan/CategoriasProducto";

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
    </>
  );
}
