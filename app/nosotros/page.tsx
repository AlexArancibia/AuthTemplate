import type { Metadata } from "next";
import {
  NosotrosHero,
  TrabajaConNosotros,
  NosotrosTarjetas,
  VisitaVitivinicolaNosotros,
  ElCampoYElSol,
} from "@/components/lujan/nosotros";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Somos Luján. Trabaja con nosotros. Precios competitivos para distribuidores, restaurantes y eventos.",
};

/**
 * Página Nosotros — Vitivinícola Luján.
 * Migrada desde vitivinicolalujan-offline (wp-json pages/1943).
 * Sin header ni footer; contenido full-page.
 */
export default function NosotrosPage() {
  return (
    <>
      <NosotrosHero />
      <TrabajaConNosotros />
      <NosotrosTarjetas />
      <VisitaVitivinicolaNosotros />
      <ElCampoYElSol />
    </>
  );
}
