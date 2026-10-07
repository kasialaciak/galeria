import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

interface AboutSectionProps {
  titlePl?: string | null;
  titleEn?: string | null;
  descriptionPl?: string | null;
  descriptionEn?: string | null;
  imageUrl?: string | null;
}

export async function AboutSection({
  titlePl,
  titleEn,
  descriptionPl,
  descriptionEn,
  imageUrl,
}: AboutSectionProps) {
  const t = await getTranslations("Home");

  const title = titlePl || "Tradycja, natura i pasja tworzenia";
  const description =
    descriptionPl ||
    "W naszej pracowni wierzymy, że przedmioty codziennego użytku powinny nieść ze sobą ciepło ludzkich rąk i szacunek do natury. Każdy egzemplarz ceramiki, biżuterii i tkaniny powstaje z ekologicznych materiałów, według tradycyjnych technik rzemieślniczych. Nie tworzymy masowo – tworzymy z myślą o trwałości, pięknie i niepowtarzalnym charakterze.";

  const image =
    imageUrl ||
    "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80";

  return (
    <section className="bg-sage/40 border-t border-warm-gray py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Miejsce na zdjęcie z panelu admina */}
          <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden shadow-lg border border-warm-gray">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Miejsce na opis z panelu admina */}
          <div className="space-y-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-teal">
              {t("aboutTitle")}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-forest leading-tight">
              {title}
            </h2>
            <div className="text-charcoal/80 text-base sm:text-lg leading-relaxed space-y-4">
              <p>{description}</p>
            </div>
            <div className="pt-2">
              <Button asChild size="lg" className="bg-forest hover:bg-forest/90 text-white font-medium">
                <Link href="/kontakt">Odwiedź naszą pracownię</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
