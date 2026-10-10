import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ProductCard, type ProductCardProps } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface FeaturedProductsProps {
  products: ProductCardProps[];
}

export async function FeaturedProducts({ products }: FeaturedProductsProps) {
  const t = await getTranslations("Home");
  const tProd = await getTranslations("Products");
  const tFP = await getTranslations("FeaturedProducts");

  // Jeśli baza danych nie zawiera jeszcze dodanych produktów, podajemy przykładowe rękodzieło
  const displayProducts =
    products && products.length > 0
      ? products
      : [
          {
            id: "sample-1",
            namePl: "Ręcznie toczony wazon z kamionki",
            nameEn: "Hand-thrown stoneware vase",
            slug: "recznie-toczony-wazon-z-kamionki",
            descriptionPl: "Unikatowy wazon w odcieniach mchu i leśnej zieleni, wypalany w wysokiej temperaturze.",
            descriptionEn: "Unique vase in moss and forest green shades, fired at high temperature.",
            price: 18900,
            compareAtPrice: 22000,
            imageUrl: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80",
            isFeatured: true,
            stock: 3,
          },
          {
            id: "sample-2",
            namePl: "Bransoletka z surowym szmaragdem",
            nameEn: "Raw emerald gemstone bracelet",
            slug: "bransoletka-z-surowym-szmaragdem",
            descriptionPl: "Srebro próby 925 połączone z naturalnym, nieszlifowanym szmaragdem i rzemieniem.",
            descriptionEn: "Sterling silver 925 combined with raw uncut emerald and cord.",
            price: 24500,
            imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            isFeatured: true,
            stock: 2,
          },
          {
            id: "sample-3",
            namePl: "Lniany pled z frędzlami",
            nameEn: "Linen throw blanket with fringes",
            slug: "lniany-pled-z-fredzlami",
            descriptionPl: "100% zmiękczany len w kolorze naturalnego piasku i szałwii. Tkany ręcznie.",
            descriptionEn: "100% pre-washed linen in natural sand and sage color. Handwoven.",
            price: 32000,
            compareAtPrice: 38000,
            imageUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
            isFeatured: true,
            stock: 5,
          },
          {
            id: "sample-4",
            namePl: "Ceramiczna czarka do herbaty",
            nameEn: "Ceramic tea bowl",
            slug: "ceramiczna-czarka-do-herbaty",
            descriptionPl: "Japońska technika shino, subtelny turkusowy akcent szkliwa.",
            descriptionEn: "Japanese shino technique with subtle turquoise glaze accents.",
            price: 7900,
            imageUrl: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
            isFeatured: true,
            stock: 8,
          },
        ];

  return (
    <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-teal">
            {tFP("selected")}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1">
            {t("featuredTitle")}
          </h2>
        </div>
        <Button variant="ghost" asChild className="group text-forest hover:bg-sage/40">
          <Link href="/produkty" className="flex items-center gap-1.5 font-medium">
            <span>{t("viewAll")}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  );
}
