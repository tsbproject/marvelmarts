


// export const dynamic = "force-dynamic";

// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import { prisma } from "@/app/lib/prisma";
// import CategoriesTable, { CategoryRow } from "./CategoriesTable";
// import { redirect } from "next/navigation";
// import type { Prisma } from "@prisma/client";
// import DashboardHeader from "@/app/_components/DashboardHeader";

// /*TYPE */
// type PageProps = {
//   searchParams: Promise<{
//     page?: string;
//     pageSize?: string;
//     search?: string;
//     sortBy?: string;
//     sortOrder?: "asc" | "desc";
//   }>;
// };

// export default async function CategoriesPage({ searchParams }: PageProps) {
//   /* MUST AWAIT */
//   const params = await searchParams;

//   const session = await getServerSession(authOptions);
//   const user = session?.user;

//   if (!user) redirect("/auth/sign-in");

//   const isSuperAdmin = user.role === "SUPER_ADMIN";
//   const canViewPage = isSuperAdmin || user.role === "ADMIN";
//   const canManageCategories =
//     isSuperAdmin || user.permissions?.manageCategories;

//   if (!canViewPage) {
//     return <div className="p-8">Access denied</div>;
//   }

//   /* ---------------- Query params ---------------- */
//   const page = Math.max(1, Number(params.page) || 1);
//   const pageSize = Math.max(1, Number(params.pageSize) || 10);
//   const search = params.search?.trim() ?? "";

//   const sortBy =
//     (params.sortBy as keyof Prisma.CategoryOrderByWithRelationInput) ??
//     "position";

//   const sortOrder = params.sortOrder ?? "asc";

//   /* ---------------- Filtering ---------------- */
//   const where: Prisma.CategoryWhereInput = search
//     ? {
//         OR: [
//           { name: { contains: search, mode: "insensitive" } },
//           { slug: { contains: search, mode: "insensitive" } },
//         ],
//       }
//     : {};

//   /* ---------------- Count ---------------- */
//   const total = await prisma.category.count({ where });
//   const totalPages = Math.max(1, Math.ceil(total / pageSize));
//   const safePage = Math.min(page, totalPages);

//   /* ---------------- Fetch ---------------- */
//   const categories = await prisma.category.findMany({
//     where,
//     orderBy: { [sortBy]: sortOrder },
//     skip: (safePage - 1) * pageSize,
//     take: pageSize,
//     select: {
//       id: true,
//       name: true,
//       slug: true,
//       position: true,
//       parent: { select: { name: true } },
//       createdAt: true,
//       children: {
//         orderBy: { position: "asc" },
//         select: {
//           id: true,
//           name: true,
//           slug: true,
//           children: {
//             orderBy: { position: "asc" },
//             select: {
//               id: true,
//               name: true,
//               slug: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   /* ---------------- Normalize ---------------- */
//   const normalizedCategories: CategoryRow[] = categories.map((c) => ({
//     id: c.id,
//     name: c.name,
//     slug: c.slug,
//     position: c.position,
//     parentName: c.parent?.name ?? null,
//     children: (c.children ?? []).map((child) => ({
//       id: child.id,
//       name: child.name,
//       slug: child.slug,
//       children: (child.children ?? []).map((grand) => ({
//         id: grand.id,
//         name: grand.name,
//         slug: grand.slug,
//       })),
//     })),
//     createdAt: c.createdAt.toISOString(),
//   }));

//   /* ---------------- Results indicator ---------------- */
//   const start = (safePage - 1) * pageSize + 1;
//   const end = Math.min(safePage * pageSize, total);

//   return (
//     <div className="p-8 w-full">
//       <DashboardHeader
//         title="Categories"
//         showAddButton={false}
//         addButtonLabel="Add Category"
//         addButtonLink="/dashboard/admins/categories/create"
//         showLogout={false}
//       />

//       {/* ---------------- Search ---------------- */}
//       <form method="GET" className="mb-4 flex flex-wrap items-center gap-2">
//         <input type="hidden" name="page" value="1" />
//         <input type="hidden" name="pageSize" value={pageSize} />
//         <input type="hidden" name="sortBy" value={sortBy} />
//         <input type="hidden" name="sortOrder" value={sortOrder} />

//         <input
//           type="text"
//           name="search"
//           defaultValue={search}
//           placeholder="Search categories..."
//           className="border rounded px-3 py-2 w-64"
//         />

//         <button className="px-4 py-2 bg-blue-600 text-white rounded">
//           Search
//         </button>
//       </form>

      
//       {/* ---------------- Table ---------------- */}
//       <CategoriesTable
//         categories={normalizedCategories}
//         canManageCategories={canManageCategories}
//         total={total}
//         page={safePage}
//         pageSize={pageSize}
//         search={search}
//         sortBy={sortBy}
//         sortOrder={sortOrder}
//       />
//     </div>
//   );
// }




export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma"; // Ensure this matches your prisma export path
import CategoriesTable, { CategoryRow } from "./CategoriesTable";
import CategoriesSearch from "@/app/_components/CategoriesSearch";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import DashboardHeader from "@/app/_components/DashboardHeader";

/* ---------------- TYPES ---------------- */
type PageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }>;
};

export default async function CategoriesPage({ searchParams }: PageProps) {
  /* 1. Await Search Params */
  const params = await searchParams;

  /* 2. Authentication & Authorization */
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) redirect("/auth/sign-in");

  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const canViewPage = isSuperAdmin || user.role === "ADMIN";
  const canManageCategories = isSuperAdmin || user.permissions?.manageCategories;

  if (!canViewPage) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8 bg-red-50 rounded-2xl border border-red-100">
          <h2 className="text-red-800 font-black uppercase tracking-widest text-sm">Access Denied</h2>
          <p className="text-red-600/70 text-xs mt-2 font-bold">You do not have permission to view this resource.</p>
        </div>
      </div>
    );
  }

  /* 3. Query Parameters & Normalization */
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.max(1, Number(params.pageSize) || 10);
  const search = params.search?.trim() ?? "";

  const sortBy = (params.sortBy as keyof Prisma.CategoryOrderByWithRelationInput) ?? "position";
  const sortOrder = params.sortOrder ?? "asc";

  /* 4. Database Filtering (Prisma Where Clause) */
  const where: Prisma.CategoryWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  /* 5. Fetch Count & Data in Parallel */
  const [total, categories] = await Promise.all([
    prisma.category.count({ where }),
    prisma.category.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        slug: true,
        position: true,
        parent: { select: { name: true } },
        createdAt: true,
        children: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            name: true,
            slug: true,
            children: {
              orderBy: { position: "asc" },
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  /* 6. Normalize Data for Client Component */
  const normalizedCategories: CategoryRow[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    position: c.position,
    parentName: c.parent?.name ?? null,
    children: (c.children ?? []).map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      children: (child.children ?? []).map((grand) => ({
        id: grand.id,
        name: grand.name,
        slug: grand.slug,
      })),
    })),
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <div className="p-4 md:p-8 w-full max-w-[1600px] mx-auto space-y-6">
      {/* Page Header */}
      <DashboardHeader
        title="Category Directory"
        showAddButton={false} // We handle the Add button inside the Table Header for better UX
      />

      {/* Advanced Search System */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <CategoriesSearch initialSearch={search} />
         
         {/* Optional: Filter chips/stats could go here */}
         <div className="hidden lg:flex gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl">
                <p className="text-[10px] font-black uppercase text-blue-400 leading-none">Total categories</p>
                <p className="text-xl font-black text-blue-700">{total}</p>
            </div>
         </div>
      </div>
      
      {/* Results Table */}
      <CategoriesTable
        categories={normalizedCategories}
        canManageCategories={canManageCategories}
        total={total}
        page={safePage}
        pageSize={pageSize}
        search={search}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    </div>
  );
}