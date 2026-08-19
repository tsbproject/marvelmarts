import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";

import AdminLayoutClient from "./AdminLayoutClient";

import { OrderService } from "@/app/lib/services/order.service";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  /* -------------------------------------------------------------------------- */
  /*                                  SESSION                                   */
  /* -------------------------------------------------------------------------- */

  const session = await getServerSession(authOptions);

  const user = session?.user;

  /* -------------------------------------------------------------------------- */
  /*                                AUTH GUARD                                  */
  /* -------------------------------------------------------------------------- */

  if (!user) {
    redirect("/auth/sign-in");
  }

  /* -------------------------------------------------------------------------- */
  /*                               ROLE CHECKS                                  */
  /* -------------------------------------------------------------------------- */

  const isSuperAdmin =
    user.role === "SUPER_ADMIN" ||
    user.roles?.includes("SUPER_ADMIN");

  const isAdmin =
    user.role === "ADMIN" ||
    user.roles?.includes("ADMIN");

  /* -------------------------------------------------------------------------- */
  /*                              ACCESS CONTROL                                */
  /* -------------------------------------------------------------------------- */

  if (!isSuperAdmin && !isAdmin) {
    redirect("/auth/access-denied");
  }

  /* -------------------------------------------------------------------------- */
  /*                           DASHBOARD STATISTICS                             */
  /* -------------------------------------------------------------------------- */

  const todayRevenue =
    await OrderService.getTodayRevenue();

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <AdminLayoutClient
      user={user}
      todayRevenue={todayRevenue}
    >
      {children}
    </AdminLayoutClient>
  );
}
