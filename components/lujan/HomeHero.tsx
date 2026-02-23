export function HomeHero() {
  return (
    <section
      className="lujan-hero relative flex w-full flex-col justify-end bg-cover bg-top bg-no-repeat px-16 py-0 md:px-16"
      style={{
        backgroundImage: "url(/lujan/home/hero.webp)",
      }}
    >
      {/* Texto: desktop padding 4em (px-16); tablet/móvil lo aplica .lujan-hero en CSS */}
      <div className="lujan-hero-content relative z-10 mx-auto w-full">
        <p className="lujan-hero-title">
          Donde la tierra
          <br />
          y el tiempo
        </p>
        <p className="lujan-hero-tagline mt-[18.4px] mb-[14.4px] inline-block">
          se transforman en vino
        </p>
      </div>
    </section>
  );
}
