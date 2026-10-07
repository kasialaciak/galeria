"use client";

import { usePathname } from "@/i18n/routing";

export function ConditionalFooterLinks({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isGalleryPage = pathname === "/" || pathname === "/pl" || pathname === "/en";

  if (isGalleryPage) {
    return null;
  }

  return <>{children}</>;
}
