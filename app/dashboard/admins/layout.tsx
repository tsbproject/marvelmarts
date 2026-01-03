import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) redirect("/auth/sign-in");

  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const isAdmin = user.role === "ADMIN";

  if (!isSuperAdmin && !isAdmin) {
    return <div className="p-4 sm:p-6 md:p-8">Access denied</div>;
  }

  // Pass user down into the client component
  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>;
}
