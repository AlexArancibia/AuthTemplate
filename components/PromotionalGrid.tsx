import Image from 'next/image';
import Link from 'next/link';

const PromotionalGrid = () => {
  const promotionalItems = [
    {
      id: 0,
      href: "/product/dignic-09c",
      imageSrc: "/assets/prom1.png",
      alt: "0"
    },
    {
      id: 1,
      href: "/product/dignics-05",
      imageSrc: "/assets/prom2.jpg",
      alt: "1"
    },
    {
      id: 2,
      href: "/product/tenergy-05-fx",
      imageSrc: "/assets/prom3.png",
      alt: "2"
    }
  ];

  return (
    <div style={{ opacity: 1, transform: 'none' }}>
      <section className="container-section py-12">
        <div className="content-section grid grid-cols-1 md:grid-cols-3 gap-1">
          {promotionalItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="rounded-sm block group relative overflow-hidden aspect-[4/4]"
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-active:scale-110">
                <Image
                  alt={item.alt}
                  src={item.imageSrc}
                  width={500}
                  height={400}
                  className="object-contain w-full h-full"
                  loading="lazy"
                  decoding="async"
                  style={{ color: 'transparent' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PromotionalGrid;
