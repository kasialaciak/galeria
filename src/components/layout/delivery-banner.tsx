import { getSettings } from "@/lib/settings";
import { getTranslations } from "next-intl/server";

export async function DeliveryBanner() {
  const settings = await getSettings();
  const t = await getTranslations("DeliveryBanner");
  
  return (
    <div className="bg-forest text-white text-xs py-1.5 text-center px-4">
      {t("message", { days: settings.shippingDays })}
    </div>
  );
}
