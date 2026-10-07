"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export interface CarouselSlide {
  id: string;
  imageUrl: string;
  titlePl?: string | null;
  titleEn?: string | null;
  descriptionPl?: string | null;
  descriptionEn?: string | null;
  linkUrl?: string | null;
}

interface HeroCarouselProps {
  slides?: CarouselSlide[];
}

const DEFAULT_SLIDES: CarouselSlide[] = [
  {
    id: "1",
    imageUrl:
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1600&q=80",
    titlePl: "Ceramika tworzona z duszą",
    titleEn: "Ceramics created with soul",
    descriptionPl: "Ręcznie toczone naczynia, misy i filiżanki z naturalnej gliny",
    descriptionEn: "Handcrafted pottery, bowls and cups made from natural clay",
    linkUrl: "/produkty",
  },
  {
    id: "2",
    imageUrl:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=80",
    titlePl: "Artystyczna biżuteria",
    titleEn: "Artistic Jewelry",
    descriptionPl: "Pojedyncze, niepowtarzalne egzemplarze z naturalnymi minerałami",
    descriptionEn: "One-of-a-kind unique pieces with natural gemstones",
    linkUrl: "/produkty",
  },
  {
    id: "3",
    imageUrl:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=80",
    titlePl: "Rękodzieło do Twojego domu",
    titleEn: "Handcrafted Home Decor",
    descriptionPl: "Ciepło, naturalne materiały i piękno w każdym detalu",
    descriptionEn: "Warmth, natural materials, and beauty in every detail",
    linkUrl: "/produkty",
  },
];

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const activeSlides = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30 },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full overflow-hidden bg-charcoal/5 border-b border-warm-gray">
      {/* Embla Viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {activeSlides.map((slide, index) => (
            <div
              key={slide.id || index}
              className="relative min-w-full h-[360px] sm:h-[480px] lg:h-[560px] flex items-center justify-center"
            >
              <Image
                src={slide.imageUrl}
                alt={slide.titlePl || "Rękodzieło baner"}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="100vw"
              />
              {/* Ciemniejszy gradient dla czytelności tekstu */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />

              {/* Treść slajdu */}
              <div className="relative z-10 mx-auto max-w-4xl px-4 text-center text-white space-y-4">
                {slide.titlePl && (
                  <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight drop-shadow-md">
                    {slide.titlePl}
                  </h2>
                )}
                {slide.descriptionPl && (
                  <p className="mx-auto max-w-xl text-sm sm:text-lg text-cream/90 font-light drop-shadow-xs">
                    {slide.descriptionPl}
                  </p>
                )}
                {slide.linkUrl && (
                  <div className="pt-2">
                    <Button
                      size="lg"
                      asChild
                      className="bg-forest hover:bg-forest/90 text-white font-medium shadow-md border border-white/20"
                    >
                      <Link href={slide.linkUrl as any}>Odkryj kolekcję</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nawigacja Strzałki */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-charcoal backdrop-blur-xs shadow-md hover:bg-white transition-all cursor-pointer"
        aria-label="Poprzednie zdjęcie"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-charcoal backdrop-blur-xs shadow-md hover:bg-white transition-all cursor-pointer"
        aria-label="Następne zdjęcie"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Kropki paginacji */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {activeSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`h-2.5 rounded-full transition-all cursor-pointer ${
              selectedIndex === index
                ? "w-8 bg-white"
                : "w-2.5 bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Przejdź do slajdu ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
