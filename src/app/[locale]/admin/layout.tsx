import { auth } from "@/auth";
import { redirect } from "@/i18n/routing";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Dodatkowe zabezpieczenie: tylko użytkownik z rolą 'admin'
  if ((session?.user as any)?.role !== "admin") {
    redirect({ href: "/", locale: "pl" });
  }

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] bg-cream/40">
      <AdminSidebar />
      <div className="flex-1 overflow-x-hidden p-6 sm:p-10 max-w-7xl">
        {children}
      </div>
    </div>
  );
}
