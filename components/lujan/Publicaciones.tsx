"use client";

/**
 * Sección «Publicaciones» / Nuestras redes sociales – migrada desde vitivinicolalujan-offline.
 * Fuente: index.html ~líneas 1735–1851 (contenedor b45492c: título, subtítulo, divisor, 4 tarjetas con imagen + iconos sociales).
 * Imágenes: public/lujan/publications/POSTTTMesa-de-trabajo-*.webp
 * Iconos: elementskit (icon-facebook, icon-message-1) + SVG Instagram.
 */

import { useEffect, useRef, useState } from "react";

const POSTS = [
  { id: "1", image: "/lujan/publications/POSTTTMesa-de-trabajo-11.webp", alt: "Post redes sociales 1" },
  { id: "2", image: "/lujan/publications/POSTTTMesa-de-trabajo-12-1.webp", alt: "Post redes sociales 2" },
  { id: "3", image: "/lujan/publications/POSTTTMesa-de-trabajo-13.webp", alt: "Post redes sociales 3" },
  { id: "4", image: "/lujan/publications/POSTTTMesa-de-trabajo-14.webp", alt: "Post redes sociales 4" },
] as const;

const FACEBOOK_URL = "https://www.facebook.com/VitivinicolaLujaneHijos";
const INSTAGRAM_URL = "https://www.instagram.com/lujan.peru/";
const CONTACT_URL = "/contactanos";

export function Publicaciones() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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

  return (
    <section
      ref={sectionRef}
      className={`lujan-publicaciones${isVisible ? " lujan-publicaciones--visible" : ""}`}
      aria-label="Publicaciones y redes sociales"
    >
      <div className="lujan-publicaciones__inner">
        <header className="lujan-publicaciones__header">
          <h2 className="lujan-publicaciones__title">Publicaciones</h2>
          <p className="lujan-publicaciones__subtitle">Nuestras redes sociales</p>
          <span className="lujan-publicaciones__divider" aria-hidden />
        </header>

        <div className="lujan-publicaciones__grid">
          {POSTS.map((post) => (
            <article key={post.id} className="lujan-publicaciones__card">
              <a
                href={post.image}
                target="_blank"
                rel="noopener noreferrer"
                className="lujan-publicaciones__image-link"
                aria-label={`Ver publicación ${post.id}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.image}
                  alt={post.alt}
                  className="lujan-publicaciones__image"
                  loading="lazy"
                  decoding="async"
                />
              </a>
              <ul className="lujan-publicaciones__social" aria-label="Enlaces a redes">
                <li>
                  <a
                    href={FACEBOOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="lujan-publicaciones__social-link lujan-publicaciones__social-link--facebook"
                  >
                    <span className="icon icon-facebook" aria-hidden />
                  </a>
                </li>
                <li>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="lujan-publicaciones__social-link lujan-publicaciones__social-link--instagram"
                  >
                    <InstagramIcon />
                  </a>
                </li>
                <li>
                  <a
                    href={CONTACT_URL}
                    aria-label="Contáctanos"
                    className="lujan-publicaciones__social-link lujan-publicaciones__social-link--contact"
                  >
                    <span className="icon icon-message-1" aria-hidden />
                  </a>
                </li>
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        fill="currentColor"
        d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
      />
    </svg>
  );
}
