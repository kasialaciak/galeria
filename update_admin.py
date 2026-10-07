import os
import re

path = 'src/app/[locale]/admin/strona-glowna/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('import { EditAboutForm } from "./edit-about-form";', 'import { EditAboutForm } from "./edit-about-form";\nimport { EditPromoForm } from "./edit-promo-form";')

promo_fetch = """  let aboutSection: any = null;
  let promoSection: any = null;

  try {
    slides = await db
      .select()
      .from(homepageContent)
      .where(eq(homepageContent.section, "carousel"))
      .orderBy(homepageContent.sortOrder);

    const [about] = await db
      .select()
      .from(homepageContent)
      .where(eq(homepageContent.section, "about"))
      .limit(1);

    aboutSection = about;

    const [promo] = await db
      .select()
      .from(homepageContent)
      .where(eq(homepageContent.section, "gallery_promo"))
      .limit(1);
    
    promoSection = promo;
  }"""

content = re.sub(
    r'  let aboutSection: any = null;.*?  \}',
    promo_fetch,
    content,
    flags=re.DOTALL
)

promo_comp = """      {/* 2. Sekcja O nas na dole strony głownej */}
      <div className="space-y-6 pt-6 border-t border-warm-gray">
        <div>
          <h2 className="font-serif text-xl font-bold text-forest">
            2. Dolna sekcja: Zdjęcie oraz Opis pracowni
          </h2>
          <p className="text-xs text-charcoal/60 mt-0.5">
            Zmieniaj treść i fotografię widoczną na samym dole strony głównej
          </p>
        </div>

        <Card className="bg-white border-warm-gray shadow-xs max-w-3xl">
          <CardContent className="p-6">
            <EditAboutForm
              initialTitle={aboutSection?.titlePl || ""}
              initialDescription={aboutSection?.descriptionPl || ""}
              initialImageUrl={aboutSection?.imageUrl || ""}
            />
          </CardContent>
        </Card>
      </div>

      {/* 3. Sekcja Promo Galerii */}
      <div className="space-y-6 pt-6 border-t border-warm-gray">
        <div>
          <h2 className="font-serif text-xl font-bold text-forest">
            3. Sekcja zachęcająca do Galerii
          </h2>
          <p className="text-xs text-charcoal/60 mt-0.5">
            Zmieniaj tekst zachęcający do przejścia do galerii prac (sekcja widoczna przed sekcją "O nas").
          </p>
        </div>

        <Card className="bg-white border-warm-gray shadow-xs max-w-3xl">
          <CardContent className="p-6">
            <EditPromoForm
              initialTitle={promoSection?.titlePl || ""}
              initialDescription={promoSection?.descriptionPl || ""}
            />
          </CardContent>
        </Card>
      </div>"""

content = re.sub(
    r'      \{\/\* 2\. Sekcja O nas na dole strony.*?<\/Card>\n      <\/div>',
    promo_comp,
    content,
    flags=re.DOTALL
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated admin page.tsx')