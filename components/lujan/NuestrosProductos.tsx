"use client";

/**
 * Sección «Nuestros Productos» – migrada desde vitivinicolalujan-offline.
 * Fuente: index.html ~líneas 1482–1518 (Elementor + JKit product carousel).
 *
 * Imágenes: copiar desde vitivinicolalujan-offline/vitivinicolalujan.com/wp-content/uploads/2025/01/
 * a public/lujan/products/ (nombres: Group-3-XX-600x600.png según el slug del producto).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";

const CURRENCY = "S/";

/** Cantidad de productos visibles por breakpoint: desktop 4, tablet 3, mobile 1 */
const SLIDES_PER_VIEW = { desktop: 4, tablet: 3, mobile: 1 } as const;
const BREAKPOINT_DESKTOP = 1025;
const BREAKPOINT_TABLET = 768;

export type ProductItem = {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  salePrice?: number;
};

const PRODUCTS: ProductItem[] = [
  { id: "1", name: "Licor de Crema Chocolate", slug: "licor-de-crema-chocolate", image: "/lujan/products/Group-3-16-600x600.png", price: 40, salePrice: 35 },
  { id: "2", name: "Licor de Crema Lúcuma", slug: "licor-de-crema-lucuma", image: "/lujan/products/Group-3-15-600x600.png", price: 40, salePrice: 35 },
  { id: "3", name: "Licor de Crema Arándanos", slug: "licor-de-crema-arandanos", image: "/lujan/products/Group-3-14-600x600.png", price: 40, salePrice: 35 },
  { id: "4", name: "Licor de Crema Cafe", slug: "licor-de-crema-cafe", image: "/lujan/products/Group-3-13-600x600.png", price: 40, salePrice: 35 },
  { id: "5", name: "Pisco Premiun Quebranta", slug: "pisco-premiun-quebranta", image: "/lujan/products/Group-3-12-600x600.png", price: 120, salePrice: 100 },
  { id: "6", name: "Pisco Premiun Italia", slug: "pisco-premiun-italia", image: "/lujan/products/Group-3-11-600x600.png", price: 120, salePrice: 100 },
  { id: "7", name: "Pisco Torontel 500ml", slug: "pisco-torontel-500ml", image: "/lujan/products/Group-3-10-600x630.png", price: 55 },
  { id: "8", name: "Pisco Acholado 500ml", slug: "pisco-acholado-500ml", image: "/lujan/products/Group-3-9-600x630.png", price: 36, salePrice: 30 },
];

function formatPrice(value: number) {
  return `${CURRENCY}${value.toFixed(2)}`;
}

function ProductCard({ product }: { product: ProductItem }) {
  const hasSale = product.salePrice != null && product.salePrice < product.price;
  return (
    <article className="lujan-nuestros-productos__card">
      <Link href={`/productos/${product.slug}`} className="lujan-nuestros-productos__link">
        <div className="lujan-nuestros-productos__image-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="lujan-nuestros-productos__image"
            width={600}
            height={600}
          />
        </div>
        <h2 className="lujan-nuestros-productos__title">{product.name}</h2>
        <span className="lujan-nuestros-productos__price">
          {hasSale ? (
            <>
              <del aria-hidden="true">
                <span className="lujan-nuestros-productos__amount">{formatPrice(product.price)}</span>
              </del>{" "}
              <ins aria-hidden="true">
                <span className="lujan-nuestros-productos__amount">{formatPrice(product.salePrice!)}</span>
              </ins>
            </>
          ) : (
            <span className="lujan-nuestros-productos__amount">{formatPrice(product.price)}</span>
          )}
        </span>
      </Link>
    </article>
  );
}

export function NuestrosProductos() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [gap, setGap] = useState(50);
  const [slidesPerView, setSlidesPerView] = useState(4);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    skipSnaps: false,
    containScroll: false,
    dragFree: true,
    duration: 12, // mitad del default (25) = animación al doble de velocidad
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const updateBreakpoint = useCallback(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1025;
    const gapPx = w >= BREAKPOINT_DESKTOP ? 50 : 10;
    const count =
      w >= BREAKPOINT_DESKTOP
        ? SLIDES_PER_VIEW.desktop
        : w >= BREAKPOINT_TABLET
          ? SLIDES_PER_VIEW.tablet
          : SLIDES_PER_VIEW.mobile;
    setGap(gapPx);
    setSlidesPerView(count);
  }, []);

  useEffect(() => {
    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, [updateBreakpoint]);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const totalDots = Math.ceil(PRODUCTS.length / slidesPerView);
  const selectedPageIndex = Math.min(
    Math.floor(selectedIndex / slidesPerView),
    totalDots - 1
  );
  const scrollToPage = useCallback(
    (pageIndex: number) => emblaApi?.scrollTo(pageIndex * slidesPerView),
    [emblaApi, slidesPerView]
  );

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap() % PRODUCTS.length);
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const alignToNearest = () => {
      const progress = emblaApi.scrollProgress();
      const snaps = emblaApi.scrollSnapList();
      if (snaps.length === 0) return;
      let nearest = 0;
      let minDist = Infinity;
      snaps.forEach((s, i) => {
        const dist = Math.abs(s - progress);
        if (dist < minDist) {
          minDist = dist;
          nearest = i;
        }
      });
      emblaApi.scrollTo(nearest, false);
    };

    const onPointerUp = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(alignToNearest, 1000);
    };

    emblaApi.on("pointerUp", onPointerUp);
    return () => {
      emblaApi.off("pointerUp", onPointerUp);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
  }, [emblaApi, slidesPerView, gap]);

  const slideFlexBasis =
    slidesPerView === 1
      ? "100%"
      : `calc((100% - ${(slidesPerView - 1) * gap}px) / ${slidesPerView})`;

  return (
    <section
      ref={sectionRef}
      className={`lujan-nuestros-productos${isVisible ? " lujan-nuestros-productos--visible" : ""}`}
      aria-label="Nuestros Productos"
    >
      <div className="lujan-nuestros-productos__inner">
        <h2 className="lujan-nuestros-productos__heading">Nuestros Productos</h2>
        <p className="lujan-nuestros-productos__subheading">Ingresa a Nuestra Tienda de Vinos y Piscos</p>
        <span className="lujan-nuestros-productos__divider" aria-hidden />

        <div className="lujan-nuestros-productos__carousel">
          <div className="lujan-nuestros-productos__carousel-viewport" ref={emblaRef}>
            <div
              className="lujan-nuestros-productos__track"
              style={{ gap, width: "100%" }}
            >
              {PRODUCTS.map((product) => (
                <div
                  key={product.id}
                  className="lujan-nuestros-productos__slide"
                  style={{ flex: `0 0 ${slideFlexBasis}` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lujan-nuestros-productos__dots" role="tablist" aria-label="Páginas del carrusel">
          {Array.from({ length: totalDots }, (_, pageIndex) => (
            <button
              key={pageIndex}
              type="button"
              role="tab"
              aria-selected={pageIndex === selectedPageIndex}
              aria-label={`Ir a página ${pageIndex + 1}`}
              className={`lujan-nuestros-productos__dot${pageIndex === selectedPageIndex ? " lujan-nuestros-productos__dot--active" : ""}`}
              onClick={() => scrollToPage(pageIndex)}
            />
          ))}
        </div>

        <div className="lujan-nuestros-productos__cta">
          <Link href="/productos" className="lujan-nuestros-productos__button">
            Ver Tienda
          </Link>
        </div>
      </div>
    </section>
  );
}
