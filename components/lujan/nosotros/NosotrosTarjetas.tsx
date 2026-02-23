"use client";

/**
 * Tres tarjetas "Precios Competitivos" — página Nosotros
 * Origen: vitivinicolalujan-offline wp-json pages/1943 (11605ac, ebf821c, a9a43f9, 9737129)
 */

import Image from "next/image";

const CARDS = [
  {
    id: "1",
    modifier: "card-1",
    bg: "#005A6E",
    image: "/lujan/nosotros/card-1.png",
    imageWidth: 429,
    imageHeight: 485,
    title: "Precios\nCompetitivos",
    description:
      "Ofrecemos precios atractivos para compras por mayor, lo que te permitirá maximizar tus márgenes de ganancia.",
  },
  {
    id: "2",
    modifier: "card-2",
    bg: "#9A3C62",
    image: "/lujan/nosotros/card-2.png",
    imageWidth: 375,
    imageHeight: 390,
    title: "Precios\nCompetitivos",
    description:
      "Ofrecemos precios atractivos para compras por mayor, lo que te permitirá maximizar tus márgenes de ganancia.",
  },
  {
    id: "3",
    modifier: "card-3",
    bg: "#C8AA8F",
    image: "/lujan/nosotros/card-3.png",
    imageWidth: 279,
    imageHeight: 506,
    title: "Precios\nCompetitivos",
    description:
      "Ofrecemos precios atractivos para compras por mayor, lo que te permitirá maximizar tus márgenes de ganancia.",
  },
] as const;

/** Solo el bloque de tarjetas (inner + cards) para incrustar en otra sección */
export function NosotrosTarjetasInner() {
  return (
    <div className="lujan-nosotros-tarjetas__inner">
      {CARDS.map((card) => (
        <div
          key={card.id}
          className={`lujan-nosotros-tarjetas__card lujan-nosotros-tarjetas__card--${card.modifier}`}
          style={{ backgroundColor: card.bg }}
        >
          <div className="lujan-nosotros-tarjetas__card-img-wrap">
            <Image
              src={card.image}
              alt=""
              width={card.imageWidth}
              height={card.imageHeight}
              className="lujan-nosotros-tarjetas__card-img"
            />
          </div>
          <p className="lujan-nosotros-tarjetas__card-title">
            {card.title.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i === 0 && <br />}
              </span>
            ))}
          </p>
          <p className="lujan-nosotros-tarjetas__card-desc">
            {card.description}
          </p>
        </div>
      ))}
    </div>
  );
}

export function NosotrosTarjetas() {
  return (
    <section className="lujan-nosotros-tarjetas" aria-label="Beneficios">
      <NosotrosTarjetasInner />
    </section>
  );
}
