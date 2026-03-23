export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma"; 
import CategoriesTable, { type CategoryRow } from "./CategoriesTable";
import CategoriesSearch from "@/app/_components/CategoriesSearch";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import DashboardHeader from "@/app/_components/DashboardHeader";

/* ---------------- TYPES ---------------- */
interface PageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }>;
}

/* ---------------- MAIN COMPONENT ---------------- */
export default async function CategoriesPage({ searchParams }: PageProps) {
  /* 1. Await Search Params */
  const params = await searchParams;

  /* 2. Authentication & Authorization */
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/sign-in");

  const user = session.user;
  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const canViewPage = isSuperAdmin || user.role === "ADMIN";
  const canManageCategories = !!(isSuperAdmin || user.permissions?.manageCategories);

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

  /* 4. Database Filtering */
  const where: Prisma.CategoryWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  /* 5. Fetch Count & Data in Parallel */
  const [total, categories, featuredCount] = await Promise.all([
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
        isFeatured: true, 
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
    prisma.category.count({ where: { isFeatured: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  /* 6. Normalize Data */
  const normalizedCategories: CategoryRow[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    position: c.position,
    isFeatured: !!c.isFeatured, 
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
  <div className="p-4 sm:p-6 lg:p-10 w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-700">
    
    {/* Page Header - Responsive padding handled internally */}
    <DashboardHeader
      title="Category Directory"
      showAddButton={false} 
      showLogout={false}
    />

    {/* Search & Stats Bar */}
    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
      
      {/* Search Input - Expands to fill space on mobile */}
      <div className="w-full xl:max-w-md">
        <CategoriesSearch initialSearch={search} />
      </div>
      
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-4 w-full sm:w-auto">
        {/* Total Categories Stat */}
        <div className="flex-1 sm:flex-none bg-brand-light/30 border border-brand-primary/10 px-5 py-3 sm:py-4 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[9px] sm:text-[10px] font-black uppercase text-brand-primary tracking-widest leading-none mb-1 sm:mb-2">
            Total Database
          </p>
          <div className="flex items-baseline gap-1">
            <p className="text-xl sm:text-2xl font-black text-accent-navy italic">{total}</p>
            <span className="text-[10px] font-bold text-brand-primary/60 uppercase">Nodes</span>
          </div>
        </div>

        {/* Featured Stat */}
        <div className="flex-1 sm:flex-none bg-orange-50 border border-orange-100 px-5 py-3 sm:py-4 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[9px] sm:text-[10px] font-black uppercase text-orange-600 tracking-widest leading-none mb-1 sm:mb-2">
            Featured Live
          </p>
          <div className="flex items-baseline gap-1">
            <p className="text-xl sm:text-2xl font-black text-orange-700 italic">{featuredCount}</p>
            <span className="text-[10px] font-bold text-orange-600/60 uppercase">Slots</span>
          </div>
        </div>
      </div>
    </div>
    
    {/* Main Table Container */}
    <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
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
  </div>
);
}

