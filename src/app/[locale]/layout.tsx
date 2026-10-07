import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Providers } from "@/components/providers";
import { DeliveryBanner } from "@/components/layout/delivery-banner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { Toaster } from "sonner";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Cosmic Loop",
    default: "Cosmic Loop | Ręcznie robione na zamówienie",
  },
  description: "Sklep internetowy Cosmic Loop. Każdy produkt robiony ręcznie na zamówienie: szydełko, biżuteria z modeliny i gliny, ceramika.",
  openGraph: {
    siteName: "Cosmic Loop",
  }
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-cream font-sans text-charcoal antialiased">
        <Providers>
          <NextIntlClientProvider locale={locale}>
            <DeliveryBanner />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CookieBanner />
            <Toaster position="top-right" richColors />
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
