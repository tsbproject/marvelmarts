// // app/dashboard/admins/categories/page.tsx
// export const dynamic = "force-dynamic"; // ✅ ensures searchParams trigger re-render

// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import { prisma } from "@/app/lib/prisma";
// import DashboardSidebar from "@/app/_components/DashboardSidebar";
// import DashboardHeader from "@/app/_components/DashboardHeader";
// import CategoriesTable, { CategoryRow } from "./CategoriesTable";
// import { redirect } from "next/navigation";
// import type { Prisma } from "@prisma/client";

// export default async function CategoriesPage({
//   searchParams,
// }: {
//   searchParams: Record<string, string | undefined>;
// }) {
//   const session = await getServerSession(authOptions);
//   const user = session?.user;

//   if (!user) redirect("/auth/sign-in");

//   const isSuperAdmin = user.role === "SUPER_ADMIN";
//   const canViewPage = isSuperAdmin || user.role === "ADMIN";
//   const canManageCategories = isSuperAdmin || user.permissions?.manageCategories;

//   if (!canViewPage) return <div className="p-8">Access denied</div>;

//   // 🔹 Pagination + search params
//   const page = parseInt(searchParams.page ?? "1", 10);
//   const pageSize = parseInt(searchParams.pageSize ?? "10", 10);
//   const search = searchParams.search ?? "";
//   const sortBy =
//     (searchParams.sortBy as keyof Prisma.CategoryOrderByWithRelationInput) ??
//     "position";
//   const sortOrder = (searchParams.sortOrder as "asc" | "desc") ?? "asc";

//   const where: Prisma.CategoryWhereInput | undefined = search
//     ? {
//         OR: [
//           { name: { contains: search, mode: "insensitive" } },
//           { slug: { contains: search, mode: "insensitive" } },
//         ],
//       }
//     : undefined;

//   const [categories, total] = await Promise.all([
//     prisma.category.findMany({
//       where,
//       include: { parent: true, children: true },
//       orderBy: { [sortBy]: sortOrder },
//       skip: (page - 1) * pageSize,
//       take: pageSize,
//     }),
//     prisma.category.count({ where }),
//   ]);

//   const normalizedCategories: CategoryRow[] = categories.map((c) => ({
//     id: c.id,
//     name: c.name,
//     slug: c.slug,
//     position: c.position,
//     parentName: c.parent?.name ?? null,
//     children: c.children?.map((child) => child.name) ?? [],
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
//           showSecondaryButton={canManageCategories}
//           secondaryButtonLabel="Reorder Categories"
//           secondaryButtonLink="/dashboard/admins/categories/ordering"
//         />

//         {/* ✅ Search box */}
//         <form method="GET" className="mb-4 flex">
//           <input
//             type="text"
//             name="search"
//             defaultValue={search}
//             placeholder="Search categories..."
//             className="border rounded px-3 py-2 w-64"
//           />
//           <button
//             type="submit"
//             className="ml-2 px-4 py-2 bg-blue-600 text-white rounded"
//           >
//             Search
//           </button>
//         </form>

//         <CategoriesTable
//           categories={normalizedCategories}
//           canManageCategories={canManageCategories}
//           total={total}
//           page={page}
//           pageSize={pageSize}
//           search={search} // ✅ pass search down so pagination preserves it
//         />
//       </div>
//     </DashboardSidebar>
//   );
// }


// app/dashboard/admins/categories/page.tsx
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import DashboardHeader from "@/app/_components/DashboardHeader";
import CategoriesTable, { CategoryRow } from "./CategoriesTable";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function CategoriesPage({ searchParams }: PageProps) {
  /* ✅ UNWRAP searchParams (CRITICAL FIX) */
  const params = await searchParams;

  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) redirect("/auth/sign-in");

  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const canViewPage = isSuperAdmin || user.role === "ADMIN";
  const canManageCategories =
    isSuperAdmin || user.permissions?.manageCategories;

  if (!canViewPage) {
    return <div className="p-8">Access denied</div>;
  }

  /* ---------------- Query params ---------------- */
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;
  const search = params.search?.trim() ?? "";

  const sortBy =
    (params.sortBy as keyof Prisma.CategoryOrderByWithRelationInput) ??
    "position";

  const sortOrder =
    (params.sortOrder as "asc" | "desc") ?? "asc";

  /* ---------------- Filtering ---------------- */
  const where: Prisma.CategoryWhereInput | undefined = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ],
      }
    : undefined;

  /* ---------------- Count FIRST ---------------- */
  const total = await prisma.category.count({ where });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  /* ---------------- Fetch paginated data ---------------- */
  const categories = await prisma.category.findMany({
    where,
    include: { parent: true, children: true },
    orderBy: { [sortBy]: sortOrder },
    skip: (safePage - 1) * pageSize,
    take: pageSize,
  });

  /* ---------------- Normalize ---------------- */
  const normalizedCategories: CategoryRow[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    position: c.position,
    parentName: c.parent?.name ?? null,
    children: c.children?.map((child) => child.name) ?? [],
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
          showSecondaryButton={canManageCategories}
          secondaryButtonLabel="Reorder Categories"
          secondaryButtonLink="/dashboard/admins/categories/ordering"
        />

        {/* ---------------- Search ---------------- */}
        <form method="GET" className="mb-4 flex">
          <input type="hidden" name="page" value="1" />
          <input type="hidden" name="pageSize" value={pageSize} />
          <input type="hidden" name="sortBy" value={sortBy} />
          <input type="hidden" name="sortOrder" value={sortOrder} />

          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search categories..."
            className="border rounded px-3 py-2 w-64"
          />

          <button className="ml-2 px-4 py-2 bg-blue-600 text-white rounded">
            Search
          </button>
        </form>

        <CategoriesTable
          categories={normalizedCategories}
          canManageCategories={canManageCategories}
          total={total}
          page={safePage}
          pageSize={pageSize}
          search={search}
        />
      </div>
    </DashboardSidebar>
  );
}
