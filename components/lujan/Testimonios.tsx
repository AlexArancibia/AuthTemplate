"use client";

/**
 * Sección «Testimonios» – migrada desde vitivinicolalujan-offline.
 * Fuente: index.html ~líneas 1520–1586 (Elementor + Elements Kit Testimonial, style_6 + block-style-three).
 *
 * Imágenes: public/lujan/h1-bckg-img-3-1.jpg (fondo), public/lujan/testimonials/*.jpg (avatares).
 */

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

export type TestimonialItem = {
  id: string;
  name: string;
  quote: string;
  image: string;
};

const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "1",
    name: "Celia Huapaya",
    quote:
      "¡Felicitaciones! El vino estuvo espectacular, y el mosto verde es altamente recomendable. Mis más sinceras felicitaciones por su excelente trabajo en equipo.",
    image: "/lujan/testimonials/WhatsApp-Image-2025-01-21-at-7.51.55-PM.jpg",
  },
  {
    id: "2",
    name: "Andrea Saavedra",
    quote:
      "Inflable el tinto en cualquier plan hemos disfrutado de esa delicia en todo su esplendor, el que sabe sabe!",
    image: "/lujan/testimonials/WhatsApp-Image-2025-01-21-at-7.52.15-PM.jpg",
  },
  {
    id: "3",
    name: "Dina QL",
    quote:
      "Son licores muy agradables, lo probamos en casa cada fin de semana y realmente puedo saborear no solo la cálida del producto si no la experiencia, lo máximo!",
    image: "/lujan/testimonials/WhatsApp-Image-2025-01-21-at-7.52.04-PM.jpg",
  },
];

function TestimonialSlide({ item }: { item: TestimonialItem }) {
  return (
    <div className="lujan-testimonios__slide-inner">
      <div className="lujan-testimonios__card">
        <div className="lujan-testimonios__avatar-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image}
            alt=""
            className="lujan-testimonios__avatar"
            width={70}
            height={70}
          />
        </div>
        <div className="lujan-testimonios__profile">
          <strong className="lujan-testimonios__author-name">{item.name}</strong>
        </div>
        <div className="lujan-testimonios__content">
          <p>{item.quote}</p>
        </div>
      </div>
    </div>
  );
}

const autoplayPlugin = Autoplay({ delay: 4000, stopOnInteraction: true });

export function Testimonios() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: false,
      align: "center",
      skipSnaps: false,
      duration: 20,
    },
    [autoplayPlugin]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi]);

  return (
    <section
      className="lujan-testimonios"
      aria-label="Testimonios de clientes"
    >
      <div className="lujan-testimonios__inner">
        <div className="lujan-testimonios__slider" ref={emblaRef}>
          <div className="lujan-testimonios__track">
            {TESTIMONIALS.map((item) => (
              <div key={item.id} className="lujan-testimonios__slide">
                <TestimonialSlide item={item} />
              </div>
            ))}
          </div>
        </div>

        <div
          className="lujan-testimonios__dots"
          role="tablist"
          aria-label="Páginas del carrusel de testimonios"
        >
          {TESTIMONIALS.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === selectedIndex}
              aria-label={`Ver testimonio ${index + 1}`}
              className={`lujan-testimonios__dot${
                index === selectedIndex ? " lujan-testimonios__dot--active" : ""
              }`}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
