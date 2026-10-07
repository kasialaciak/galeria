"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { useLocale } from "next-intl";
import { ArrowLeft, ExternalLink, X } from "lucide-react";

export function GalleryClient({ categories, works, carousel, description }: any) {
  const locale = useLocale();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedWork, setSelectedWork] = useState<any | null>(null);

  const [emblaRef] = useEmblaCarousel({ loop: true, align: "center" }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);

  const filteredWorks = activeCategory 
    ? works.filter((w: any) => w.categoryId === activeCategory)
    : works;

  return (
    <div className="space-y-12">
      {/* Navbar / Back to shop */}
      <div className="container mx-auto px-4 pt-12 pb-6 flex flex-col items-center justify-center relative"><h1 className="text-4xl md:text-5xl font-serif font-bold text-forest text-center tracking-tight mb-6">Galeria Prac</h1><Link href="/sklep" className="absolute left-4 top-12 hidden md:block"><Button variant="outline" className="gap-2 rounded-full border-forest/20 hover:bg-forest/5 text-forest"><ArrowLeft className="h-4 w-4" /> Przejdź do sklepu</Button></Link><Link href="/sklep" className="md:hidden mb-4"><Button variant="outline" className="gap-2 rounded-full border-forest/20 hover:bg-forest/5 text-forest w-full"><ArrowLeft className="h-4 w-4" /> Przejdź do sklepu</Button></Link></div>

      {/* Carousel */}
      {carousel.length > 0 && (
        <section className="relative w-full max-w-5xl mx-auto px-4">
          <div className="overflow-hidden rounded-xl shadow-lg border" ref={emblaRef}>
            <div className="flex">
              {carousel.map((item: any) => (
                <div key={item.id} className="relative flex-[0_0_100%] min-w-0 aspect-[21/9] sm:aspect-[21/7]">
                  <Image 
                    src={item.imageUrl} 
                    alt="Gallery Carousel" 
                    fill 
                    className="object-cover" 
                    priority
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Description */}
      {description && (
        <section className="container mx-auto px-4 max-w-3xl text-center">
          <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {description}
          </p>
        </section>
      )}

      {/* Filter Categories */}
      <section className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Button 
            variant={activeCategory === null ? "default" : "outline"} 
            onClick={() => setActiveCategory(null)}
            className="rounded-full"
          >
            Wszystkie
          </Button>
          {categories.map((cat: any) => (
            <Button 
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"} 
              onClick={() => setActiveCategory(cat.id)}
              className="rounded-full"
            >
              {locale === "en" ? cat.nameEn : cat.namePl}
            </Button>
          ))}
        </div>

        {/* Works Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredWorks.map((work: any) => (
            <div 
              key={work.id} 
              className="group cursor-pointer rounded-lg overflow-hidden border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
              onClick={() => setSelectedWork(work)}
            >
              <div className="relative aspect-square overflow-hidden">
                <Image 
                  src={work.imageUrl} 
                  alt={work.titlePl} 
                  fill 
                  className="object-cover transition-transform duration-300 group-hover:scale-105" 
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-medium line-clamp-1">{locale === "en" ? work.titleEn : work.titlePl}</h3>
              </div>
            </div>
          ))}
          {filteredWorks.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Brak prac w tej kategorii.
            </div>
          )}
        </div>
      </section>

      {/* Custom Lightbox */}
      {selectedWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-lg shadow-xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row relative">
            <button 
              onClick={() => setSelectedWork(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-background/50 hover:bg-background rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto md:min-h-[400px]">
              <Image 
                src={selectedWork.imageUrl} 
                alt={selectedWork.titlePl} 
                fill 
                className="object-cover" 
              />
            </div>
            
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
              <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">
                {categories.find((c:any) => c.id === selectedWork.categoryId)?.namePl}
              </p>
              <h2 className="text-3xl font-serif mb-4">
                {locale === "en" ? selectedWork.titleEn : selectedWork.titlePl}
              </h2>
              <p className="text-base leading-relaxed text-foreground/80 flex-1">
                {locale === "en" ? selectedWork.descriptionEn : selectedWork.descriptionPl}
              </p>
              
              <div className="mt-8 pt-6 border-t flex justify-between items-center">
                <Button variant="outline" onClick={() => setSelectedWork(null)}>
                  Zamknij
                </Button>
                <Link href="/">
                  <Button className="gap-2">
                    <ExternalLink className="h-4 w-4" /> Do Sklepu
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

