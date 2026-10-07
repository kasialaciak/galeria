import Image from "next/image";

export function Logo({ size = 36 }: { size?: number }) {
  // PodmieĹ„ public/logo.svg wĹ‚asnym kwadratowym logo (ta sama nazwa pliku).
  return (
    <span className="flex items-center gap-2">
      <Image src="/logo.svg" alt="Kasia Łaciak â€“ logo" width={size} height={size} className="rounded-md" priority />
      <span className="font-serif text-xl font-bold text-forest">Kasia Łaciak</span>
    </span>
  );
}
