import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(priceInGrosze: number): string {
  const zloty = priceInGrosze / 100;
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(zloty);
}

export function getRemainingBusinessDays(createdAt: Date, maxDays: number = 21, holidayDatesStr: string = ""): number {
  const holidays = new Set(
    holidayDatesStr
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0)
  );

  const current = new Date();
  const created = new Date(createdAt);
  
  let businessDaysPassed = 0;
  const tempDate = new Date(created);
  tempDate.setHours(0,0,0,0);
  current.setHours(0,0,0,0);
  
  while (tempDate < current) {
    tempDate.setDate(tempDate.getDate() + 1);
    const day = tempDate.getDay();
    const dateString = tempDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
    
    // Tylko dni powszednie, które NIE SĄ na liście świąt
    if (day !== 0 && day !== 6 && !holidays.has(dateString)) {
      businessDaysPassed++;
    }
  }
  
  return maxDays - businessDaysPassed;
}

