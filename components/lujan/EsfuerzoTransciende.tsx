/**
 * Sección «Esfuerzo que Transciende» (#acerca)
 * Spec: docs/analisis-esfuerzo-transciende-html-css.md + spec-home-esfuerzo-que-transciende.md
 */

export function EsfuerzoTransciende() {
  return (
    <section
      id="acerca"
      className="lujan-esfuerzo"
      aria-labelledby="esfuerzo-title-1 esfuerzo-title-2"
    >
      <div className="lujan-esfuerzo__inner">
        {/* Columna izquierda: texto */}
        <div className="lujan-esfuerzo__col-text">
          <div className="lujan-esfuerzo__content">
            <div className="lujan-esfuerzo__heading-wrap lujan-esfuerzo__heading-wrap--first">
              <h2 id="esfuerzo-title-1" className="lujan-esfuerzo__title">
                Esfuerzo que
              </h2>
            </div>
            <div className="lujan-esfuerzo__heading-wrap">
              <h2 id="esfuerzo-title-2" className="lujan-esfuerzo__title lujan-esfuerzo__title--accent">
                Transciende
              </h2>
              <span className="lujan-esfuerzo__title-underline" aria-hidden />
            </div>
            <div className="lujan-esfuerzo__body-wrap">
              <p className="lujan-esfuerzo__body">
                Luján es esfuerzo, amor y pasión de quienes laboran desde el camino hasta la bodega. Es un espejo de diversidad, riqueza y audacia de la naturaleza. Nuestros productos al ser degustado por cada persona, tienen la capacidad de evocar un sinfín de recuerdos, y sentimientos en cualquier momento.
              </p>
            </div>
          </div>
        </div>
        {/* Columna derecha: imagen de fondo */}
        <div
          className="lujan-esfuerzo__col-image"
          role="img"
          aria-label="Pareja en viña con uvas, Luján"
        />
      </div>
    </section>
  );
}
