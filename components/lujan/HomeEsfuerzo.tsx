/**
 * Sección "Esfuerzo que Transciende" (#acerca).
 * Contrato: spec-home-esfuerzo-que-transciende.md.
 * Estructura DOM exacta; no simplificar wrappers; dos h2 separados, sin <br>.
 */
export function HomeEsfuerzo() {
  return (
    <section id="acerca" className="lujan-esfuerzo">
      <div className="lujan-esfuerzo__inner">
        <div className="lujan-esfuerzo__col-left">
          <div className="lujan-esfuerzo__content">
            <div className="lujan-esfuerzo__heading-wrapper">
              <h2 className="lujan-esfuerzo__title-line1">Esfuerzo que</h2>
            </div>
            <div className="lujan-esfuerzo__heading-wrapper">
              <h2 className="lujan-esfuerzo__title-line2">Transciende</h2>
            </div>
            <div className="lujan-esfuerzo__divider-wrapper">
              <span className="lujan-esfuerzo__divider-line"></span>
            </div>
            <div className="lujan-esfuerzo__text-wrapper">
              <p className="lujan-esfuerzo__text">
                Luján es esfuerzo, amor y pasión de quienes laboran desde el
                camino hasta la bodega. Es un espejo de diversidad, riqueza y
                audacia de la naturaleza. Nuestros productos al ser degustado por
                cada persona, tienen la capacidad de evocar un sinfín de
                recuerdos, y sentimientos en cualquier momento.
              </p>
            </div>
          </div>
        </div>
        <div className="lujan-esfuerzo__col-right"></div>
      </div>
    </section>
  );
}
