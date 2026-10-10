"use client";

import { useTransition } from "react";
import { updateOrderStatusAction } from "@/actions/admin-orders";
import { toast } from "sonner";

interface OrderStatusSelectorProps {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusSelector({
  orderId,
  currentStatus,
}: OrderStatusSelectorProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: string) => {
    let extraData = undefined;
    if (newStatus === "shipped") {
      const url = window.prompt("Wprowadź link do śledzenia przesyłki (opcjonalnie, klient otrzyma go w mailu):");
      if (url === null) return; // User cancelled
      if (url.trim() !== "") {
        extraData = url.trim();
      }
    } else if (newStatus === "cancelled") {
      const reason = window.prompt("Podaj powód anulowania zamówienia (zostanie wysłany do klienta):");
      if (reason === null) return; // User cancelled
      extraData = reason.trim() !== "" ? reason.trim() : "Anulowane przez administratora.";
    }

    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, newStatus, extraData);
      if (res.success) {
        toast.success(`Zaktualizowano status zamówienia na: ${newStatus}`);
      } else {
        toast.error(res.error || "Błąd aktualizacji statusu");
      }
    });
  };

  return (
    <select
      value={currentStatus}
      disabled={isPending}
      onChange={(e) => handleStatusChange(e.target.value)}
      className="h-8 rounded-md border border-warm-gray bg-white px-2 py-1 text-xs text-charcoal focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
    >
      <option value="pending">Oczekuje na płatność</option>
      <option value="paid">Opłacone (czeka na akceptację)</option>
      <option value="accepted">Zaakceptowane (czeka na rozpoczęcie realizacji)</option>
      <option value="processing">W trakcie realizacji</option>
      <option value="completed">Zrealizowano (czeka na wysyłkę)</option>
      <option value="shipped">Wysłane</option>
      <option value="delivered">Doręczone</option>
      <option value="cancelled">Anulowane</option>
    </select>
  );
}
