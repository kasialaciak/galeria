"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword, ChangePasswordState } from "@/actions/password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState<ChangePasswordState, FormData>(changePassword, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success("Hasło zostało pomyślnie zmienione.");
      formRef.current?.reset();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="currentPassword" className="text-xs font-semibold text-charcoal">
          Obecne hasło
        </label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className="text-xs"
        />
        {state?.fieldErrors?.currentPassword?.map((err, i) => (
          <p key={i} className="text-[10px] text-destructive mt-1">{err}</p>
        ))}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="newPassword" className="text-xs font-semibold text-charcoal">
          Nowe hasło (min. 10 znaków, w tym cyfra i litera)
        </label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          className="text-xs"
        />
        {state?.fieldErrors?.newPassword?.map((err, i) => (
          <p key={i} className="text-[10px] text-destructive mt-1">{err}</p>
        ))}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="text-xs font-semibold text-charcoal">
          Potwierdź nowe hasło
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className="text-xs"
        />
        {state?.fieldErrors?.confirmPassword?.map((err, i) => (
          <p key={i} className="text-[10px] text-destructive mt-1">{err}</p>
        ))}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-forest hover:bg-forest/90 text-white text-xs h-9"
      >
        {isPending ? "Zmienianie..." : "Zmień hasło"}
      </Button>
    </form>
  );
}
