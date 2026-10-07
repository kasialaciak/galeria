"use client";

import { useTransition } from "react";
import { updateUserProfile } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AccountProfileFormProps {
  user: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
}

export function AccountProfileForm({ user }: AccountProfileFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateUserProfile(formData);
      if (res.success) {
        toast.success("Dane osobowe zostały zaktualizowane");
      } else {
        toast.error(res.error || "Wystąpił błąd");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-charcoal">
          Adres email (login)
        </label>
        <Input
          type="email"
          value={user.email || ""}
          disabled
          className="bg-cream/50 text-charcoal/60 cursor-not-allowed text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="name" className="text-xs font-semibold text-charcoal">
          Imię i nazwisko
        </label>
        <Input
          id="name"
          name="name"
          defaultValue={user.name || ""}
          required
          placeholder="Twoje imię i nazwisko"
          className="text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="phone" className="text-xs font-semibold text-charcoal">
          Numer telefonu
        </label>
        <Input
          id="phone"
          name="phone"
          defaultValue={user.phone || ""}
          placeholder="+48 123 456 789"
          className="text-xs"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-forest hover:bg-forest/90 text-white text-xs h-9"
      >
        {isPending ? "Zapisywanie..." : "Zapisz zmiany"}
      </Button>
    </form>
  );
}
