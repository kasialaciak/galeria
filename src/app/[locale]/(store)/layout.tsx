import { redirect } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { getLocale } from "next-intl/server";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const locale = await getLocale();

  if (settings.storeEnabled === "false") {
    // Redirect to home if store is disabled
    redirect(`/${locale}`);
  }

  return <>{children}</>;
}
