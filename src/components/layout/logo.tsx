import Image from "next/image";

export function Logo({ size = 36 }: { size?: number }) {
  // Podmień public/logo.svg własnym kwadratowym logo (ta sama nazwa pliku).
  return (
    <span className="flex items-center gap-2">
      <Image src="/logo.svg" alt="Cosmic Loop – logo" width={size} height={size} className="rounded-md" priority />
      <span className="font-serif text-xl font-bold text-forest">Cosmic Loop</span>
    </span>
  );
}
