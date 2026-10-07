import { getSettings } from "@/lib/settings";

export async function DeliveryBanner() {
  const settings = await getSettings();
  
  return (
    <div className="bg-forest text-white text-xs py-1.5 text-center px-4">
      Każdy produkt jest robiony ręcznie na zamówienie – czas realizacji i wysyłki do {settings.shippingDays} dni roboczych.
    </div>
  );
}
