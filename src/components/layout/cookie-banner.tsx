"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { X, Cookie } from "lucide-react";
import { useTranslations } from "next-intl";

export function CookieBanner() {
  const [show, setShow] = useState(false);
  const t = useTranslations("Cookies");

  useEffect(() => {
    // Check if the user has already answered the cookie consent
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      // Small delay so it doesn't pop up too aggressively
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookieConsent", "all");
    setShow(false);
    // Here you could initialize analytics like Google Analytics
  };

  const handleAcceptEssential = () => {
    localStorage.setItem("cookieConsent", "essential");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-md z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="bg-white border border-warm-gray shadow-xl rounded-t-2xl sm:rounded-2xl p-5 space-y-4 relative">
        
        <button 
          onClick={handleAcceptEssential}
          className="absolute top-4 right-4 text-charcoal/40 hover:text-charcoal transition-colors"
          aria-label={t("close")}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="mt-1 bg-forest/10 p-2 rounded-full text-forest">
            <Cookie className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-forest text-lg">{t("title")}</h3>
            <p className="text-xs text-charcoal/70 mt-1 leading-relaxed">
              {t("description")}{" "}
              <Link href="/polityka-prywatnosci" className="text-forest font-semibold hover:underline">
                {t("privacyLink")}
              </Link>.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button 
            onClick={handleAcceptAll}
            className="flex-1 bg-forest hover:bg-forest/90 text-white font-medium text-xs sm:text-sm"
          >
            {t("acceptAll")}
          </Button>
          <Button 
            onClick={handleAcceptEssential}
            variant="outline"
            className="flex-1 border-warm-gray text-charcoal text-xs sm:text-sm"
          >
            {t("acceptEssential")}
          </Button>
        </div>
      </div>
    </div>
  );
}
