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
    //Redirect to deniedpage if not Admin
    redirect("/auth/access-denied"); 
  }

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>;
}
