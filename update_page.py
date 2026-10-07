import os
import re

path = 'src/app/[locale]/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('let aboutContent: any = null;', 'let aboutContent: any = null;\n  let promoContent: any = null;')

promo_fetch = """    // 4. Pobierz tresc sekcji "Promo Galerii"
    const promoData = await db
      .select()
      .from(homepageContent)
      .where(eq(homepageContent.section, "gallery_promo"))
      .limit(1);

    if (promoData && promoData.length > 0) {
      promoContent = promoData[0];
    }
  } catch (error) {"""

content = content.replace('  } catch (error) {', promo_fetch)

promo_comp = """      {/* 3. Sekcja: Odnosnik do Galerii prac */}
      <GalleryPromoSection
        titlePl={promoContent?.titlePl}
        titleEn={promoContent?.titleEn}
        descriptionPl={promoContent?.descriptionPl}
        descriptionEn={promoContent?.descriptionEn}
      />"""

content = re.sub(
    r'\{\/\* 3\. Sekcja.*?<GalleryPromoSection \/>',
    promo_comp,
    content,
    flags=re.DOTALL
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated page.tsx')