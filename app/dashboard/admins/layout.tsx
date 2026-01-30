


import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import AdminLayoutClient from "./AdminLayoutClient";
import prisma from "@/app/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  // 1. Auth Guard
  if (!user) redirect("/auth/sign-in");

  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const isAdmin = user.role === "ADMIN";

  if (!isSuperAdmin && !isAdmin) {
    redirect("/auth/access-denied"); 
  }

  // 2. Fetch Revenue Data for the Mobile Widget
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = await prisma.order.aggregate({
    where: {
      createdAt: { gte: today },
      paymentStatus: true,
    },
    _sum: {
      total: true,
    },
  });

  // Convert Decimal to Number to prevent serialization errors
  const todayRevenue = Number(stats._sum.total || 0);

  // 3. Fetch Settings
  const settings = await prisma.siteSettings.findFirst() || {
    footerDesc: "Africa's most trusted marketplace.",
    supportPhone: "+234 800-MARVEL",
    supportEmail: "help@marvelmarts.com"
  };

  return (
    <AdminLayoutClient user={user} todayRevenue={todayRevenue}>
      {children}
    </AdminLayoutClient>
  );
}
