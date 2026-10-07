import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Sparkles, Compass } from "lucide-react";
import { useLocale } from "next-intl";

interface GalleryPromoSectionProps {
  titlePl?: string | null;
  titleEn?: string | null;
  descriptionPl?: string | null;
  descriptionEn?: string | null;
}

export function GalleryPromoSection({
  titlePl,
  titleEn,
  descriptionPl,
  descriptionEn,
}: GalleryPromoSectionProps) {
  const locale = useLocale();
  const isPl = locale === "pl";

  const defaultTitle = "Galeria naszych prac i kulisy pracowni";
  const defaultDesc = "Odkryj autorskie projekty, niepowtarzalne zamówienia indywidualne oraz proces powstawania naszych wyrobów krok po kroku. Zobacz, jak kawałek gliny, srebra czy lnu zamienia się w małe dzieło sztuki.";

  const displayTitle = isPl ? (titlePl || defaultTitle) : (titleEn || titlePl || defaultTitle);
  const displayDesc = isPl ? (descriptionPl || defaultDesc) : (descriptionEn || descriptionPl || defaultDesc);

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
    <section className="bg-cream/60 py-16 sm:py-24 border-y border-warm-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          <div className="lg:col-span-5 space-y-6">
            <h2 className="font-serif text-3xl sm:text-4xl text-forest leading-tight">
              {displayTitle}
            </h2>
            <p className="text-charcoal/80 text-base leading-relaxed whitespace-pre-wrap">
              {displayDesc}
            </p>
            <div className="pt-4">
              <Button asChild size="lg" className="bg-forest hover:bg-forest/90 text-white rounded-none px-8 font-medium">
                <Link href="/galeria">
                  Przejdź do galerii prac
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
