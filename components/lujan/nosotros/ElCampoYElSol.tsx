"use client";

/**
 * Sección "El Campo y el Sol" — página Nosotros
 * Origen: vitivinicolalujan-offline wp-json pages/1943 (05f62c8, 0e74521, be6f272)
 */

import Image from "next/image";

const CAMPO_TEXT =
  "En el arte abstracto, las formas, los colores y las composiciones no suelen representar objetos o escenas figurativas de manera directa, sino que buscan transmitir ideas, emociones o conceptos a través de elementos no figurativos. La «unión de bebedores» podría simbolizar varias ideas";

export function ElCampoYElSol() {
  return (
    <section
      className="lujan-nosotros-campo"
      aria-labelledby="campo-title-1 campo-title-2"
    >
      <div className="lujan-nosotros-campo__inner">
        <div className="lujan-nosotros-campo__col-text">
          <div className="lujan-nosotros-campo__headings">
            <h2 id="campo-title-1" className="lujan-nosotros-campo__h1">
              El Campo y
            </h2>
            <h2 id="campo-title-2" className="lujan-nosotros-campo__h2">
              el Sol
            </h2>
          </div>
          <span className="lujan-nosotros-campo__divider" aria-hidden />
          <p className="lujan-nosotros-campo__text">{CAMPO_TEXT}</p>
        </div>
        <div className="lujan-nosotros-campo__col-img">
          <Image
            src="/lujan/nosotros/campo-sol-luchy.webp"
            alt=""
            width={2248}
            height={1949}
            className="lujan-nosotros-campo__img"
          />
        </div>
      </div>
    </section>
  );
}
