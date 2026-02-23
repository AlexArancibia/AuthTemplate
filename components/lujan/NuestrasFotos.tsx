"use client";

/**
 * Sección «Nuestras Fotos» – migrada desde vitivinicolalujan-offline.
 * Fuente: index.html ~líneas 1597–1631 (Elementor + JKit gallery grid + image carousel móvil).
 *
 * Imágenes: public/lujan/gallery/ (descargar con el script PowerShell indicado en la migración).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const GALLERY_IMAGES = [
  { id: "1", src: "/lujan/gallery/Sin-titulo-1Mesa-de-trabajo-7.webp", alt: "Experiencia Luján" },
  { id: "2", src: "/lujan/gallery/Sin-titulo-1Mesa-de-trabajo-7-copia.webp", alt: "Experiencia Luján" },
  { id: "3", src: "/lujan/gallery/h1-img-4.jpg", alt: "Viñedo y cosecha" },
  { id: "4", src: "/lujan/gallery/h1-img-5.jpg", alt: "Uvas y tradición" },
  { id: "5", src: "/lujan/gallery/Sin-titulo-1Mesa-de-trabajo-7-copia-4.webp", alt: "Experiencia Luján" },
  { id: "6", src: "/lujan/gallery/Sin-titulo-1Mesa-de-trabajo-7-copia-5.webp", alt: "Experiencia Luján" },
] as const;

const BREAKPOINT_DESKTOP = 1025;
const BREAKPOINT_TABLET = 768;
/** Tablet: 3 slides, gap 15px (original data-settings). Mobile: 1 slide, gap 8px. */
const CAROUSEL_GAP_TABLET = 15;
const CAROUSEL_GAP_MOBILE = 8;

function GalleryItem({ item }: { item: (typeof GALLERY_IMAGES)[number] }) {
  return (
    <div className="lujan-nuestras-fotos__item">
      <div className="lujan-nuestras-fotos__thumb-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.src}
          alt={item.alt}
          className="lujan-nuestras-fotos__thumb"
          width={1516}
          height={1114}
        />
        <span className="lujan-nuestras-fotos__overlay" aria-hidden />
      </div>
    </div>
  );
}

const autoplayPlugin = Autoplay({ delay: 3000, stopOnInteraction: true });

export function NuestrasFotos() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [slidesPerView, setSlidesPerView] = useState(1);
  const [gap, setGap] = useState(CAROUSEL_GAP_MOBILE);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      loop: true,
      skipSnaps: false,
      containScroll: false,
      dragFree: true,
      duration: 12, // mitad del default (25) = animación al doble de velocidad
    },
    [autoplayPlugin]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const updateBreakpoint = useCallback(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : BREAKPOINT_DESKTOP;
    const desktop = w >= BREAKPOINT_DESKTOP;
    setIsDesktop(desktop);
    if (!desktop) {
      const tablet = w >= BREAKPOINT_TABLET;
      setSlidesPerView(tablet ? 3 : 1);
      setGap(tablet ? CAROUSEL_GAP_TABLET : CAROUSEL_GAP_MOBILE);
    }
  }, []);

  useEffect(() => {
    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, [updateBreakpoint]);

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
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
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
      autoplayPlugin.play();
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
    if (emblaApi && !isDesktop) emblaApi.reInit();
  }, [emblaApi, isDesktop, slidesPerView, gap]);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  /** Embla recomendado: padding en slide + margin negativo en track → gap uniforme incluido en loop */
  const slideFlexBasis =
    slidesPerView === 1
      ? `calc(100% + ${gap}px)`
      : `calc((100% + ${gap}px) / ${slidesPerView})`;

  return (
    <section
      ref={sectionRef}
      className={`lujan-nuestras-fotos${isVisible ? " lujan-nuestras-fotos--visible" : ""}`}
      aria-label="Nuestras Fotos"
    >
      <div className="lujan-nuestras-fotos__inner">
        <h2 className="lujan-nuestras-fotos__heading">Nuestras Fotos</h2>
        <p className="lujan-nuestras-fotos__subheading">Brindamos experiencias</p>
        <span className="lujan-nuestras-fotos__divider" aria-hidden />

        {/* Grid: solo desktop */}
        <div className="lujan-nuestras-fotos__grid" aria-hidden={!isDesktop}>
          {GALLERY_IMAGES.map((item) => (
            <GalleryItem key={item.id} item={item} />
          ))}
        </div>

        {/* Carrusel: tablet 3 slides / móvil 1 slide */}
        <div className="lujan-nuestras-fotos__carousel" aria-hidden={isDesktop}>
          <div className="lujan-nuestras-fotos__carousel-viewport" ref={emblaRef}>
            <div
              className="lujan-nuestras-fotos__track"
              style={{
                marginLeft: isDesktop ? undefined : -gap,
                width: isDesktop ? undefined : "100%",
              }}
            >
              {GALLERY_IMAGES.map((item) => (
                <div
                  key={item.id}
                  className="lujan-nuestras-fotos__slide"
                  style={{
                    flex: isDesktop ? undefined : `0 0 ${slideFlexBasis}`,
                    paddingLeft: isDesktop ? undefined : gap,
                  }}
                >
                  <div className="lujan-nuestras-fotos__slide-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="lujan-nuestras-fotos__slide-img"
                      width={600}
                      height={441}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className="lujan-nuestras-fotos__dots"
            role="tablist"
            aria-label="Páginas del carrusel de fotos"
          >
            {GALLERY_IMAGES.map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={index === selectedIndex}
                aria-label={`Foto ${index + 1} de ${GALLERY_IMAGES.length}`}
                className={`lujan-nuestras-fotos__dot${index === selectedIndex ? " lujan-nuestras-fotos__dot--active" : ""}`}
                onClick={() => scrollTo(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
