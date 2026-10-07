import Image from "next/image";
import { Link } from "@/i18n/routing";

export interface CategoryItem {
  id: string;
  namePl: string;
  nameEn: string;
  slug: string;
  image?: string | null;
  parentId?: string | null;
  children?: CategoryItem[];
}

interface CategoryGridProps {
  categories: CategoryItem[];
  selectedCategory?: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: "1",
    namePl: "Ceramika",
    nameEn: "Ceramics",
    slug: "ceramika",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80",
    children: [
      { id: "1-1", namePl: "Kubki i czarki", nameEn: "Cups & Mugs", slug: "kubki-i-czarki", parentId: "1" },
      { id: "1-2", namePl: "Wazony", nameEn: "Vases", slug: "wazony", parentId: "1" },
      { id: "1-3", namePl: "Talerze i misy", nameEn: "Plates & Bowls", slug: "talerze-i-misy", parentId: "1" },
    ],
  },
  {
    id: "2",
    namePl: "Biżuteria",
    nameEn: "Jewelry",
    slug: "bizuteria",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
    children: [
      { id: "2-1", namePl: "Bransoletki", nameEn: "Bracelets", slug: "bransoletki", parentId: "2" },
      { id: "2-2", namePl: "Naszyjniki", nameEn: "Necklaces", slug: "naszyjniki", parentId: "2" },
      { id: "2-3", namePl: "Kolczyki", nameEn: "Earrings", slug: "kolczyki", parentId: "2" },
    ],
  },
  {
    id: "3",
    namePl: "Tkaniny & Len",
    nameEn: "Textiles & Linen",
    slug: "tkaniny",
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80",
    children: [
      { id: "3-1", namePl: "Pledy i koce", nameEn: "Blankets", slug: "pledy", parentId: "3" },
      { id: "3-2", namePl: "Obrusy i serwety", nameEn: "Tablecloths", slug: "obrusy", parentId: "3" },
    ],
  },
  {
    id: "4",
    namePl: "Dekoracje domu",
    nameEn: "Home Decor",
    slug: "dekoracje",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80",
    children: [
      { id: "4-1", namePl: "Świeczniki", nameEn: "Candleholders", slug: "swieczniki", parentId: "4" },
      { id: "4-2", namePl: "Makramy", nameEn: "Macrame", slug: "makramy", parentId: "4" },
    ],
  },
];

export function CategoryGrid({ categories, selectedCategory }: CategoryGridProps) {
  const displayCategories = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-2xl font-bold text-forest">
          Kategorie i podkategorie
        </h2>
        {selectedCategory && (
          <Link
            href="/produkty"
            className="text-xs font-semibold text-teal hover:underline"
          >
            Pokaż wszystkie produkty
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {displayCategories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;

          return (
            <div
              key={cat.id}
              className={`group flex flex-col rounded-xl border overflow-hidden bg-white shadow-xs transition-all ${
                isSelected
                  ? "border-forest ring-2 ring-forest/30"
                  : "border-warm-gray hover:border-teal/50 hover:shadow-md"
              }`}
            >
              <Link
                href={`/produkty?kategoria=${cat.slug}`}
                className="relative aspect-16/10 w-full overflow-hidden bg-cream block"
              >
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.namePl}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-sage/30 text-forest font-serif font-semibold text-lg">
                    {cat.namePl}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                  <span className="font-serif text-white font-bold text-base drop-shadow-xs">
                    {cat.namePl}
                  </span>
                </div>
              </Link>

              {/* Podkategorie */}
              {cat.children && cat.children.length > 0 && (
                <div className="p-3 bg-white border-t border-warm-gray/60 flex flex-wrap gap-1.5">
                  {cat.children.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/produkty?kategoria=${sub.slug}`}
                      className={`text-[11px] px-2 py-0.5 rounded-full transition-colors ${
                        selectedCategory === sub.slug
                          ? "bg-forest text-white font-semibold"
                          : "bg-sage/40 text-charcoal/80 hover:bg-forest hover:text-white"
                      }`}
                    >
                      {sub.namePl}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
