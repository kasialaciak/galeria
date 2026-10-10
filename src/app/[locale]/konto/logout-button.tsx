"use client";

import { useTranslations } from "next-intl";
import { logoutUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const t = useTranslations("Account");
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => logoutUser()}
      className="text-xs text-charcoal/60 hover:text-red-600 hover:bg-red-50 flex items-center gap-1.5 cursor-pointer"
    >
      <LogOut className="h-3.5 w-3.5" />
      <span>{t("logout")}</span>
    </Button>
  );
}
