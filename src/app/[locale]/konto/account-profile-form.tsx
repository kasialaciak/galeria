"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("Account");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateUserProfile(formData);
      if (res.success) {
        toast.success(t("profileUpdated"));
      } else {
        toast.error(res.error || t("errorOccurred"));
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-charcoal">
          {t("emailLabel")}
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
          {t("nameLabel")}
        </label>
        <Input
          id="name"
          name="name"
          defaultValue={user.name || ""}
          required
          placeholder={t("namePlaceholder")}
          className="text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="phone" className="text-xs font-semibold text-charcoal">
          {t("phoneLabel")}
        </label>
        <Input
          id="phone"
          name="phone"
          defaultValue={user.phone || ""}
          placeholder={t("phonePlaceholder")}
          className="text-xs"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-forest hover:bg-forest/90 text-white text-xs h-9"
      >
        {isPending ? t("saving") : t("saveChanges")}
      </Button>
    </form>
  );
}
