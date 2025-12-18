import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import DashboardHeader from "@/app/_components/DashboardHeader";
import CategoriesTable, { CategoryRow } from "./CategoriesTable";
import { redirect } from "next/navigation";

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) redirect("/auth/sign-in");

  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const canViewPage = isSuperAdmin || user.role === "ADMIN";
  const canManageCategories = isSuperAdmin || user.permissions?.manageCategories;

  if (!canViewPage) return <div className="p-8">Access denied</div>;

  // 🔹 Fetch categories
  const categories = await prisma.category.findMany({
    include: { parent: true, children: true },
    orderBy: { position: "asc" },
  });

  // 🔹 Normalize for table
  const normalizedCategories: CategoryRow[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    position: c.position,
    parentName: c.parent?.name ?? null,
    childrenCount: c.children.length,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <DashboardSidebar>
      <div className="p-8 w-full">
        <DashboardHeader
          title="Categories"
          showAddButton={canManageCategories}
          addButtonLabel="Add Category"
          addButtonLink="/dashboard/admins/categories/create"
        />
        <CategoriesTable
          categories={normalizedCategories}
          canManageCategories={canManageCategories}
        />
      </div>
    </DashboardSidebar>
  );
}
