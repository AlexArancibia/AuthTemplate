// Sección de Confianza (Trust & Guarantees Section)
// Requiere: npm i lucide-react
// Tailwind CSS para estilos utilitarios

import { BadgeCheck, Headset, Truck, RefreshCcw, Shield } from "lucide-react";

export default function TrustSection() {
  const items = [
    {
      title: "Calidad",
      text:
        "Todos nuestros productos son adquiridos a través de las matrices, la calidad está garantizada.",
      Icon: BadgeCheck,
    },
    {
      title: "Servicio al Cliente",
      text:
        "Estamos para servirte, nuestro asesoramiento es gratuito. Ante cualquier duda o consulta te atenderemos de inmediato.",
      Icon: Headset,
    },
    {
      title: "Entrega Rápida",
      text:
        "Necesitas con urgencia algún producto? Contáctanos y coordinemos la atención de tu necesidad.",
      Icon: Truck,
    },
    {
      title: "Cambios y Devoluciones",
      text:
        "La confianza es la base de una relación comercial. Nosotros procederemos con cambios y devoluciones si no estás satisfecho con el producto.",
      Icon: RefreshCcw,
    },
    {
      title: "Compra Segura",
      text:
        "Nuestro certificado SSL garantiza una compra sin contratiempos.",
      Icon: Shield,
    },
  ];

  return (
    <section className="bg-[#f5f9fc]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-10 text-center">
          {items.map(({ title, text, Icon }, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-start"
              style={{ minHeight: 220 }} // mantiene altura homogénea
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-4">
                <Icon size={40} strokeWidth={1.75} aria-hidden="true" />
              </div>

              <h3 className="text-lg font-semibold mb-2">{title}</h3>

              <p className="text-sm leading-6 text-muted-foreground max-w-[260px]">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
