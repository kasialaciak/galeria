import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Logo } from "./logo";
import { getSettings } from "@/lib/settings";
import { Camera, Mail } from "lucide-react";
import { ConditionalFooterLinks } from "./conditional-footer-links";

export async function Footer() {
  const t = await getTranslations("Nav");
  const settings = await getSettings();

  return (
    <footer className="border-t border-warm-gray bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <ConditionalFooterLinks><div className="mb-3"><Logo size={32} /></div><p className="text-sm text-charcoal/70 leading-relaxed max-w-sm">Zamówienia robione ręcznie, z sercem i pasją.</p></ConditionalFooterLinks>
            <div className="flex items-center gap-3 mt-4">
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-charcoal/60 hover:text-forest transition-colors"
                  aria-label="Instagram"
                >
                  <Camera className="h-5 w-5" />
                </a>
              )}
              {settings.contactEmail && (
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="text-charcoal/60 hover:text-forest transition-colors"
                  aria-label="Email"
                >
                  <Mail className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
          <ConditionalFooterLinks>
          <div>
            <h4 className="font-serif font-semibold text-charcoal mb-3">
              Szybkie linki
            </h4>
            <ul className="space-y-2 text-sm text-charcoal/80">
              <li>
                <Link href="/" className="hover:text-forest transition-colors">
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link href="/produkty" className="hover:text-forest transition-colors">
                  {t("products")}
                </Link>
              </li>
              <li>
                <Link href="/galeria" className="hover:text-forest transition-colors">
                  Galeria prac
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="hover:text-forest transition-colors">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif font-semibold text-charcoal mb-3">
              Informacje
            </h4>
            <ul className="space-y-2 text-sm text-charcoal/80">
              <li>
                <Link href="/regulamin" className="hover:text-forest transition-colors">
                  Regulamin
                </Link>
              </li>
              <li>
                <Link href="/polityka-prywatnosci" className="hover:text-forest transition-colors">
                  Polityka prywatności
                </Link>
              </li>
            </ul>
          </div>
          </ConditionalFooterLinks>
        </div>
        <div className="mt-8 pt-6 border-t border-warm-gray/60 text-center text-xs text-charcoal/50">
          &copy; {new Date().getFullYear()} Kasia Łaciak. Wszelkie prawa zastrzeżone.
        </div>
      </div>
    </footer>
  );
}



