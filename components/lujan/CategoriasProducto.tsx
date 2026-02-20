"use client";

/**
 * Sección «Categorías de producto» (Vinos, Piscos, Cremas y Macerados, Personaliza)
 * Spec: docs/analisis-categorias-producto-vinos-piscos-html-css.md
 *
 * Imágenes esperadas en public/home/: copa-vino.png, copa-pisco.png, cafe.png, oackging.png, cata-bodega.jpg
 */

import { useEffect, useRef, useState } from "react";

const CATEGORIAS = [
  {
    id: "vinos",
    titulo: "Vinos",
    imagen: "/home/copa-vino.png",
    descripcion:
      "Cada vino cuenta una historia. Inspirados por la majestuosidad de Luján elaboramos vinos que reflejan la pasión, dedicación y el carácter único de esta tierra.",
  },
  {
    id: "piscos",
    titulo: "Piscos",
    imagen: "/home/copa-pisco.png",
    descripcion:
      "El pisco, bebida espirituosa tradicional Luján, se elabora destilando uvas seleccionadas y el proceso de destilación y la tradición.",
  },
  {
    id: "cremas-macerados",
    titulo: "Cremas y Macerados",
    imagen: "/home/cafe.png",
    descripcion:
      "Los macerados de fruta son versátiles y se pueden usar en una variedad de preparaciones y eventos.",
  },
  {
    id: "personaliza",
    titulo: "Personaliza",
    imagen: "/home/oackging.png",
    descripcion:
      "Ahora puedes personalizar tu etiqueta con nosotros, para tu empresa o regalo a tus clientes.",
  },
] as const;

export function CategoriasProducto() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`lujan-categorias${isVisible ? " lujan-categorias--visible" : ""}`}
      aria-label="Categorías de producto"
    >
      <div className="lujan-categorias__inner">
        <div className="lujan-categorias__grid">
          {CATEGORIAS.map((cat) => (
            <article
              key={cat.id}
              className={`lujan-categorias__card lujan-categorias__card--${cat.id}`}
              aria-labelledby={`lujan-cat-${cat.id}`}
            >
              <div className="lujan-categorias__card-image-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.imagen}
                  alt=""
                  className="lujan-categorias__card-image"
                />
              </div>
              <div className="lujan-categorias__card-content">
                <h2
                  id={`lujan-cat-${cat.id}`}
                  className="lujan-categorias__card-title"
                >
                  {cat.titulo}
                </h2>
                <span
                  className="lujan-categorias__card-divider"
                  aria-hidden
                />
                <p className="lujan-categorias__card-desc">{cat.descripcion}</p>
              </div>
            </article>
          ))}
        </div>
        <div
          className="lujan-categorias__banner"
          role="img"
          aria-label="Cata en bodega Luján"
        />
      </div>
    </section>
  );
}
