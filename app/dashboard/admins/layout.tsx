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

  // Check against the model structure: role (singular) and roles (array)
  const isSuperAdmin = user.role === "SUPER_ADMIN" || user.roles?.includes("SUPER_ADMIN");
  const isAdmin = user.role === "ADMIN" || user.roles?.includes("ADMIN");

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

  const todayRevenue = Number(stats._sum.total || 0);

  // 3. Define Navigation Sections
  // This satisfies the 'sections' prop required by AdminLayoutClient
  const sections = {
    general: [
      { label: "Dashboard", href: "/dashboard/admins", visible: true },
      { label: "Treasury", href: "/dashboard/admins/treasury", visible: true },
      { label: "Review", href: "/dashboard/admins/review", visible: isSuperAdmin },
    ],
    management: [
       { label: "Activity", href: "/dashboard/admins/activity", visible: isSuperAdmin  },
   
   
      { label: "Users", href: "/dashboard/admins/users", visible: isSuperAdmin  },
      { label: "Blogs", href: "/dashboard/blogs", visible: isSuperAdmin  },
      { label: "Products", href: "/dashboard/admins/products", visible: isSuperAdmin  },
      { label: "Trending", href: "/dashboard/admins/trending", visible: isSuperAdmin  },
      { label: "Orders", href: "/dashboard/admins/orders", visible: isSuperAdmin  },
      { label: "Categories", href: "/dashboard/admins/categories", visible: isSuperAdmin  },
      { label: "Settings", href: "/dashboard/admins/settings", visible: isSuperAdmin  },
      { label: "Subscribers", href: "/dashboard/admins/Subscribers", visible: isSuperAdmin  },
      { label: "Support", href: "/dashboard/admins/support", visible: isSuperAdmin  },
      { label: "Vendors", href: "/dashboard/admins/vendors", visible: isSuperAdmin  },
      { label: "Verifications", href: "/dashboard/admins/verifications", visible: isSuperAdmin  },
      { label: "Vendorspayout", href: "/dashboard/admins/vendorspayout", visible: isSuperAdmin  },
    ],
   
  };

  return (
    <AdminLayoutClient 
      user={user} 
      todayRevenue={todayRevenue}
      // Use a valid single role for UI labels; fallback to 'ADMIN' if null
      role={user.role || (isSuperAdmin ? "SUPER_ADMIN" : "ADMIN")} 
      roles={user.roles || []} 
      sections={sections}
      permissions={user.permissions || {}}
    >
      {children}
    </AdminLayoutClient>
  );
}
