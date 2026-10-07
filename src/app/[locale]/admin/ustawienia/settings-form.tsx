"use client";

import { useActionState, useEffect } from "react";
import { updateSettings, AdminSettingsState } from "@/actions/admin-settings";
import { SiteSettings } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsForm({ initialData }: { initialData: SiteSettings }) {
  const [state, formAction, isPending] = useActionState<AdminSettingsState, FormData>(updateSettings, null);

  useEffect(() => {
    if (state?.success) {
      toast.success("Ustawienia zostały zapisane.");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-serif text-forest">Status Sklepu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="storeEnabled" 
              name="storeEnabled" 
              value="true"
              defaultChecked={initialData.storeEnabled === "true"} 
              className="h-4 w-4 rounded border-warm-gray text-forest focus:ring-forest"
            />
            <label htmlFor="storeEnabled" className="text-sm font-medium">
              Sklep widoczny dla klientów
            </label>
          </div>
          <p className="text-xs text-charcoal/60 mt-1">
            Gdy wyłączone, linki do sklepu znikną, a dostęp do koszyka i produktów będzie zablokowany.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-serif text-forest">Kontakt i social media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="contactEmail" className="text-sm font-medium">Email kontaktowy</label>
              <Input
                id="contactEmail"
                name="contactEmail"
                defaultValue={initialData.contactEmail}
              />
              {state?.fieldErrors?.contactEmail?.map((err, i) => (
                <p key={i} className="text-xs text-destructive">{err}</p>
              ))}
            </div>
            <div className="space-y-2">
              <label htmlFor="contactPhone" className="text-sm font-medium">Telefon kontaktowy</label>
              <Input
                id="contactPhone"
                name="contactPhone"
                defaultValue={initialData.contactPhone}
              />
              {state?.fieldErrors?.contactPhone?.map((err, i) => (
                <p key={i} className="text-xs text-destructive">{err}</p>
              ))}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="instagramUrl" className="text-sm font-medium">Link do Instagrama</label>
              <Input
                id="instagramUrl"
                name="instagramUrl"
                defaultValue={initialData.instagramUrl}
              />
              {state?.fieldErrors?.instagramUrl?.map((err, i) => (
                <p key={i} className="text-xs text-destructive">{err}</p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-serif text-forest">Dane sprzedawcy (do regulaminu i stopki)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="sellerName" className="text-sm font-medium">Nazwa firmy / imię i nazwisko</label>
            <Input
              id="sellerName"
              name="sellerName"
              defaultValue={initialData.sellerName}
            />
            {state?.fieldErrors?.sellerName?.map((err, i) => (
              <p key={i} className="text-xs text-destructive">{err}</p>
            ))}
          </div>
          <div className="space-y-2">
            <label htmlFor="sellerAddress" className="text-sm font-medium">Adres</label>
            <Input
              id="sellerAddress"
              name="sellerAddress"
              defaultValue={initialData.sellerAddress}
            />
            {state?.fieldErrors?.sellerAddress?.map((err, i) => (
              <p key={i} className="text-xs text-destructive">{err}</p>
            ))}
          </div>
          <div className="space-y-2">
            <label htmlFor="sellerNip" className="text-sm font-medium">NIP (opcjonalnie)</label>
            <Input
              id="sellerNip"
              name="sellerNip"
              defaultValue={initialData.sellerNip}
            />
            {state?.fieldErrors?.sellerNip?.map((err, i) => (
              <p key={i} className="text-xs text-destructive">{err}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-serif text-forest">Czas realizacji i URLOPY</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-w-xs">
            <label htmlFor="shippingDays" className="text-sm font-medium">Dni robocze na wysyłkę</label>
            <Input
              id="shippingDays"
              name="shippingDays"
              type="number"
              min="1"
              max="999"
              defaultValue={initialData.shippingDays}
            />
            {state?.fieldErrors?.shippingDays?.map((err, i) => (
              <p key={i} className="text-xs text-destructive">{err}</p>
            ))}
          </div>
          <div className="space-y-2">
            <label htmlFor="holidayDates" className="text-sm font-medium">Dni wolne od pracy (odliczane od limitu wysyłki)</label>
            <p className="text-xs text-charcoal/60 mb-2">
              Wpisz każdą datę w nowej linii. Format: <strong>YYYY-MM-DD</strong>, np. 2026-11-01. Możesz tu wpisać swój urlop lub święta.
            </p>
            <textarea
              id="holidayDates"
              name="holidayDates"
              rows={5}
              className="w-full rounded-md border border-warm-gray px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-forest bg-transparent"
              defaultValue={initialData.holidayDates}
              placeholder="2026-11-01&#10;2026-11-11&#10;2026-12-24"
            />
            {state?.fieldErrors?.holidayDates?.map((err, i) => (
              <p key={i} className="text-xs text-destructive">{err}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto bg-forest hover:bg-forest/90 text-white"
      >
        {isPending ? "Zapisywanie..." : "Zapisz ustawienia"}
      </Button>
    </form>
  );
}
