"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { registerUser, type AuthState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { User, Mail, Lock } from "lucide-react";

export default function RegisterPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerUser, null);

  useEffect(() => {
    if (state?.success) {
      toast.success("Konto utworzone pomyślnie! Zaloguj się.");
      router.push("/konto/logowanie");
    }
  }, [state, router]);

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
      <Card className="w-full max-w-md bg-white border border-warm-gray shadow-md">
        <CardHeader className="space-y-1 text-center border-b border-warm-gray pb-6">
          <CardTitle className="font-serif text-2xl font-bold text-forest">
            {t("registerTitle")}
          </CardTitle>
          <CardDescription className="text-sm text-charcoal/60">
            Załóż bezpłatne konto, aby kupować rękodzieło i śledzić zamówienia
          </CardDescription>
        </CardHeader>

        <form action={formAction}>
          <CardContent className="space-y-4 pt-6">
            {state?.error && (
              <div className="p-3 text-xs rounded-md bg-red-50 border border-red-200 text-red-700 font-medium">
                {state.error}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-xs font-semibold text-charcoal flex items-center gap-1.5"
              >
                <User className="h-3.5 w-3.5 text-forest" />
                {t("name")}
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Jan Kowalski"
                required
                autoComplete="name"
              />
              {state?.fieldErrors?.name && (
                <p className="text-xs text-red-600">
                  {state.fieldErrors.name[0]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-charcoal flex items-center gap-1.5"
              >
                <Mail className="h-3.5 w-3.5 text-forest" />
                {t("email")}
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="twoj@email.pl"
                required
                autoComplete="email"
              />
              {state?.fieldErrors?.email && (
                <p className="text-xs text-red-600">
                  {state.fieldErrors.email[0]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-charcoal flex items-center gap-1.5"
              >
                <Lock className="h-3.5 w-3.5 text-forest" />
                {t("password")} (min. 10 znaków)
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={10}
                autoComplete="new-password"
              />
              {state?.fieldErrors?.password && (
                <p className="text-xs text-red-600">
                  {state.fieldErrors.password[0]}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 border-t border-warm-gray/60 pt-6">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-forest hover:bg-forest/90 text-white font-medium"
            >
              {isPending ? "Tworzenie konta..." : t("registerButton")}
            </Button>

            <div className="text-center text-xs text-charcoal/70">
              {t("hasAccount")}{" "}
              <Link
                href="/konto/logowanie"
                className="font-semibold text-forest underline hover:text-teal transition-colors"
              >
                {t("loginTitle")}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
