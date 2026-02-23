"use client";

/**
 * Sección "¡Visita nuestra vitivinícola!" — página Nosotros
 * Origen: vitivinicolalujan-offline wp-json pages/1943 (dc933a3, c8fe567, ee54700)
 */

import Image from "next/image";

const VISITA_PARAGRAPH =
  "Necesaria para seguir el fascinante mundo de la elaboración de vinos y piscos, donde la pasión y el amor por crear grandes experiencias se hace día a día. Asimismo, la aceptación de zonas aledañas y de muchas provincias ha sido de mayor inspiración para salir siempre adelante.";

export function VisitaVitivinicolaNosotros() {
  return (
    <section
      className="lujan-nosotros-visita"
      aria-labelledby="visita-nosotros-title"
    >
      <div className="lujan-nosotros-visita__inner">
        {/* Imagen solo desktop */}
        <div className="lujan-nosotros-visita__img-desktop">
          <Image
            src="/lujan/nosotros/visita-nama.png"
            alt=""
            width={800}
            height={652}
            className="lujan-nosotros-visita__img"
          />
        </div>
        <div className="lujan-nosotros-visita__content">
          <p id="visita-nosotros-title" className="lujan-nosotros-visita__title">
            <span className="lujan-nosotros-visita__title-accent">¡</span>
            Visita nuestra vitivinícola
            <span className="lujan-nosotros-visita__title-accent">!</span>
          </p>
          <div className="lujan-nosotros-visita__row">
            {/* Imagen tablet/móvil */}
            <div className="lujan-nosotros-visita__img-tablet-mobile">
              <Image
                src="/lujan/nosotros/visita-nama.png"
                alt=""
                width={800}
                height={652}
                className="lujan-nosotros-visita__img"
              />
            </div>
            <p className="lujan-nosotros-visita__text">{VISITA_PARAGRAPH}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
