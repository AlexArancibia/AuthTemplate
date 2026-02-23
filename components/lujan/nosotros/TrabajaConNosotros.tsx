"use client";

/**
 * Sección "Trabaja con Nosotros" — imagen + títulos + párrafo
 * Origen: vitivinicolalujan-offline wp-json pages/1943 (0e8b0b1, cd7ffe7, a734c89, a28e06b)
 */

import Image from "next/image";
import { NosotrosTarjetasInner } from "./NosotrosTarjetas";

const TRABAJA_TEXT =
  "Buscamos aliados estratégicos para expandir nuestra presencia y llevar nuestros exclusivos piscos y vinos a más clientes. Si eres distribuidor, dueño de restaurante, bar, o estás organizando un evento, queremos ofrecerte productos de alta calidad y una colaboración sólida y confiable.";

export function TrabajaConNosotros() {
  return (
    <section className="lujan-nosotros-trabaja" aria-labelledby="trabaja-title">
      <div className="lujan-nosotros-trabaja__inner">
        {/* Imagen solo desktop */}
        <div className="lujan-nosotros-trabaja__img-desktop">
          <Image
            src="/lujan/nosotros/trabaja-imagen.webp"
            alt=""
            width={1518}
            height={2325}
            className="lujan-nosotros-trabaja__img"
          />
        </div>
        <div className="lujan-nosotros-trabaja__col">
          <div className="lujan-nosotros-trabaja__row-top">
            {/* Imagen solo tablet */}
            <div className="lujan-nosotros-trabaja__img-tablet">
              <Image
                src="/lujan/nosotros/trabaja-imagen.webp"
                alt=""
                width={1518}
                height={2325}
                className="lujan-nosotros-trabaja__img"
              />
            </div>
            <div className="lujan-nosotros-trabaja__headings">
              <h2 id="trabaja-title" className="lujan-nosotros-trabaja__h1">
                Trabaja con
              </h2>
              <h2 className="lujan-nosotros-trabaja__h2">Nosotros</h2>
              <span className="lujan-nosotros-trabaja__divider" aria-hidden />
              <div className="lujan-nosotros-trabaja__row-bottom">
                {/* Imagen solo móvil */}
                <div className="lujan-nosotros-trabaja__img-mobile">
                  <Image
                    src="/lujan/nosotros/trabaja-imagen.webp"
                    alt=""
                    width={1518}
                    height={2325}
                    className="lujan-nosotros-trabaja__img"
                  />
                </div>
                <p className="lujan-nosotros-trabaja__text">{TRABAJA_TEXT}</p>
              </div>
            </div>
          </div>
          <NosotrosTarjetasInner />
        </div>
      </div>
    </section>
  );
}
