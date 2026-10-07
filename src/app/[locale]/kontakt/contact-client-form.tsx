"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { sendContactMessage } from "@/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { toast } from "sonner";

export function ContactClientForm() {
  const t = useTranslations("Contact");
  const [state, formAction, isPending] = useActionState(sendContactMessage, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success(t("sent"));
      formRef.current?.reset();
    }
  }, [state, t]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md font-medium">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-xs font-semibold text-charcoal">
            {t("name")} *
          </label>
          <Input id="name" name="name" required placeholder="Twoje imię" />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-charcoal">
            {t("email")} *
          </label>
          <Input id="email" name="email" type="email" required placeholder="twoj@email.pl" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="subject" className="text-xs font-semibold text-charcoal">
          {t("subject")} *
        </label>
        <Input id="subject" name="subject" required placeholder="W jakiej sprawie piszesz?" />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="message" className="text-xs font-semibold text-charcoal">
          {t("message")} *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Napisz swoją wiadomość..."
          className="flex w-full rounded-md border border-warm-gray bg-white px-3 py-2 text-sm text-charcoal shadow-sm transition-colors placeholder:text-charcoal/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forest"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        size="lg"
        className="w-full sm:w-auto bg-forest hover:bg-forest/90 text-white font-medium px-8"
      >
        <Send className="h-4 w-4 mr-2" />
        <span>{isPending ? "Wysyłanie..." : t("send")}</span>
      </Button>
    </form>
  );
}
