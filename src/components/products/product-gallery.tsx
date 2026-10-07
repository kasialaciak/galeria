"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: { id: string; url: string; alt?: string | null }[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const displayImages =
    images && images.length > 0
      ? images
      : [
          {
            id: "default",
            url: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1000&q=80",
            alt: title,
          },
        ];

  const currentImage = displayImages[selectedIndex] || displayImages[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Duże zdjęcie główne */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-cream border border-warm-gray shadow-xs">
        <Image
          src={currentImage.url}
          alt={currentImage.alt || title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {/* Miniaturki jeśli jest więcej niż 1 zdjęcie */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {displayImages.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative h-20 w-20 rounded-xl overflow-hidden border-2 shrink-0 bg-cream cursor-pointer transition-all ${
                selectedIndex === idx
                  ? "border-forest shadow-xs scale-102"
                  : "border-warm-gray opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt || `${title} miniatura ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
