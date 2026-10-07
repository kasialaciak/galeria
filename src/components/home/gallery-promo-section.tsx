import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Compass } from "lucide-react";

export function GalleryPromoSection() {
  const previewImages = [
    {
      src: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80",
      alt: "Ceramika artystyczna",
      label: "Pracownia ceramiki",
    },
    {
      src: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
      alt: "Ręcznie robiona biżuteria",
      label: "Kamienie naturalne",
    },
    {
      src: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
      alt: "Proces tworzenia rękodzieła",
      label: "Za kulisami",
    },
  ];

  return (
    <section className="bg-cream/60 border-t border-warm-gray py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Tekst zachęcający */}
          <div className="lg:col-span-5 space-y-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-teal">
              <Sparkles className="h-4 w-4" />
              Inspiracje & Rzemiosło
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest leading-tight">
              Galeria naszych prac i kulisy pracowni
            </h2>
            <p className="text-charcoal/75 text-sm sm:text-base leading-relaxed">
              Odkryj autorskie projekty, niepowtarzalne zamówienia indywidualne oraz proces powstawania naszych wyrobów krok po kroku. Zobacz, jak kawałek gliny, srebra czy lnu zamienia się w małe dzieło sztuki.
            </p>
            <div className="pt-2">
              <Button asChild size="lg" className="bg-forest hover:bg-forest/90 text-white font-medium text-xs sm:text-sm">
                <Link href="/galeria" className="flex items-center gap-2">
                  <span>Przejdź do Galerii prac</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Grid miniatury galerii */}
          <div className="lg:col-span-7 grid grid-cols-3 gap-3 sm:gap-4">
            {previewImages.map((img, i) => (
              <Link
                key={i}
                href="/galeria"
                className="group relative aspect-3/4 rounded-xl overflow-hidden border border-warm-gray shadow-xs block"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2.5 sm:p-3">
                  <span className="text-[11px] sm:text-xs font-semibold text-white truncate">
                    {img.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
