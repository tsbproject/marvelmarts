// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import { prisma } from "@/app/lib/prisma";
// import DashboardSidebar from "@/app/_components/DashboardSidebar";
// import DashboardHeader from "@/app/_components/DashboardHeader";
// import CategoriesTable, { CategoryRow } from "./CategoriesTable";
// import { redirect } from "next/navigation";

// export default async function CategoriesPage() {
//   const session = await getServerSession(authOptions);
//   const user = session?.user;

//   if (!user) redirect("/auth/sign-in");

//   const isSuperAdmin = user.role === "SUPER_ADMIN";
//   const canViewPage = isSuperAdmin || user.role === "ADMIN";
//   const canManageCategories = isSuperAdmin || user.permissions?.manageCategories;

//   if (!canViewPage) return <div className="p-8">Access denied</div>;

//   // 🔹 Fetch categories
//   const categories = await prisma.category.findMany({
//     include: { parent: true, children: true },
//     orderBy: { position: "asc" },
//   });

//   // 🔹 Normalize for table
//   const normalizedCategories: CategoryRow[] = categories.map((c) => ({
//     id: c.id,
//     name: c.name,
//     slug: c.slug,
//     position: c.position,
//     parentName: c.parent?.name ?? null,
//     childrenCount: c.children.length,
//     createdAt: c.createdAt.toISOString(),
//   }));

//   return (
//     <DashboardSidebar>
//       <div className="p-8 w-full">
//         <DashboardHeader
//           title="Categories"
//           showAddButton={canManageCategories}
//           addButtonLabel="Add Category"
//           addButtonLink="/dashboard/admins/categories/create"
//         />
//         <CategoriesTable
//           categories={normalizedCategories}
//           canManageCategories={canManageCategories}
//         />
//       </div>
//     </DashboardSidebar>
//   );
// }





// app/dashboard/admins/categories/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import DashboardHeader from "@/app/_components/DashboardHeader";
import CategoriesTable, { CategoryRow } from "./CategoriesTable";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) redirect("/auth/sign-in");

  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const canViewPage = isSuperAdmin || user.role === "ADMIN";
  const canManageCategories = isSuperAdmin || user.permissions?.manageCategories;

  if (!canViewPage) return <div className="p-8">Access denied</div>;

  // 🔹 Pagination + search params
  const page = parseInt(searchParams.page ?? "1", 10);
  const pageSize = parseInt(searchParams.pageSize ?? "10", 10);
  const search = searchParams.search ?? "";
  const sortBy = (searchParams.sortBy as keyof Prisma.CategoryOrderByWithRelationInput) ?? "position";
  const sortOrder = (searchParams.sortOrder as "asc" | "desc") ?? "asc";

  const where: Prisma.CategoryWhereInput | undefined = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ],
      }
    : undefined;

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      include: { parent: true, children: true },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.category.count({ where }),
  ]);

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
          totalPages={Math.ceil(total / pageSize)}
          currentPage={page}
          search={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </div>
    </DashboardSidebar>
  );
}
