import { getTranslations } from "next-intl/server";
import { ContactClientForm } from "./contact-client-form";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, CalendarDays, Sparkles } from "lucide-react";
import { getSettings } from "@/lib/settings";

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const t = await getTranslations("Contact");
  const settings = await getSettings();

  // Bezpieczne parsowanie Instagram URL i wyodrębnienie nazwy profilu
  let formattedInstagramUser = "cosmic_loop.craft";
  let safeInstagramUrl = "https://instagram.com/cosmic_loop.craft";

  try {
    if (settings.instagramUrl && typeof settings.instagramUrl === "string") {
      const parsedUrl = new URL(settings.instagramUrl.trim());
      if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
        safeInstagramUrl = parsedUrl.href;
        const cleanPath = parsedUrl.pathname.replace(/^\/+|\/+$/g, "");
        if (cleanPath) {
          formattedInstagramUser = cleanPath;
        }
      }
    }
  } catch {
    // Fallback w przypadku niepoprawnego formatu adresu w bazie
    safeInstagramUrl = "https://instagram.com/cosmic_loop.craft";
    formattedInstagramUser = "cosmic_loop.craft";
  }

  // Sanityzacja danych kontaktowych
  const safeEmail = (settings.contactEmail || "kasialaciak.gallery+shoop@gmail.com").replace(/[^a-zA-Z0-9@.+_-]/g, "");
  const safePhone = settings.contactPhone ? settings.contactPhone.replace(/[^\d+]/g, "") : "";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-semibold uppercase tracking-widest text-teal">
          Zapraszamy do kontaktu
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-forest mt-1">
          {t("title")}
        </h1>
        <p className="text-sm sm:text-base text-charcoal/70 mt-3">
          Chcesz zapytać o indywidualne zamówienie, dostępność wariantu lub współpracę? Napisz do nas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 items-start">
        {/* Informacje o marce i kontakt */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white border-warm-gray shadow-xs">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-serif text-xl font-bold text-forest border-b border-warm-gray pb-3">
                Kasia Łaciak
              </h3>

              <div className="space-y-4 text-xs sm:text-sm text-charcoal/80">
                <div className="flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-forest shrink-0 mt-0.5"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  <div>
                    <p className="font-semibold text-charcoal">Odwiedź nas na instagramie</p>
                    <a
                      href={safeInstagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-forest hover:underline"
                    >
                      @{formattedInstagramUser}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-forest shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-charcoal">Napisz bezpośrednio</p>
                    <a
                      href={`mailto:${safeEmail}`}
                      className="text-forest hover:underline"
                    >
                      {settings.contactEmail || "kasialaciak.gallery+shoop@gmail.com"}
                    </a>
                  </div>
                </div>

                {settings.contactPhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-forest shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-charcoal">Zadzwoń do nas</p>
                      <a
                        href={`tel:${safePhone}`}
                        className="text-forest hover:underline"
                      >
                        {settings.contactPhone}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <CalendarDays className="h-5 w-5 text-forest shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-charcoal">Dni pracy</p>
                    <p>Poniedziałek - Piątek</p>
                    <p className="text-forest font-medium mt-1">Najbliższe dni wolne od pracy:</p>
                    <p>{settings.holidayDates?.trim() ? settings.holidayDates : "Brak"}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-sage/40 rounded-xl border border-warm-gray/60 text-xs text-charcoal/70 flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-forest shrink-0" />
                <span>Realizujemy także unikatowe zamówienia na specjalne życzenie!</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formularz kontaktowy */}
        <div className="lg:col-span-2">
          <Card className="bg-white border-warm-gray shadow-md">
            <CardContent className="p-6 sm:p-8">
              <h2 className="font-serif text-2xl font-bold text-forest mb-2">
                {t("formTitle")}
              </h2>
              <p className="text-xs text-charcoal/60 mb-6">
                Odpowiadamy zazwyczaj w ciągu 24 godzin roboczych.
              </p>

              <ContactClientForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


