import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./settings-form";

export const metadata = {
  title: "Ustawienia sklepu",
};

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-forest">Ustawienia sklepu</h1>
        <p className="text-sm text-charcoal/60 mt-1">
          Zarządzaj danymi kontaktowymi, linkami do social mediów i informacjami o sprzedawcy.
        </p>
      </div>

      <SettingsForm initialData={settings} />
    </div>
  );
}
