export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/lib/auth";
import { CategoryService } from "@/app/lib/services/category.service";

import CategoriesTable, {
  type CategoryRow,
} from "./CategoriesTable";

import CategoriesSearch from "@/app/_components/CategoriesSearch";
import DashboardHeader from "@/app/_components/DashboardHeader";

/* ---------------- TYPES ---------------- */

type CategorySortField =
  | "position"
  | "name"
  | "slug"
  | "createdAt"
  | "updatedAt";

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

export default async function CategoriesPage({
  searchParams,
}: PageProps) {
  /* 1. Await Search Params */

  const params = await searchParams;

  /* 2. Authentication & Authorization */

  const session =
    await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const user = session.user;

  const isSuperAdmin =
    user.role === "SUPER_ADMIN";

  const canViewPage =
    isSuperAdmin ||
    user.role === "ADMIN";

  const canManageCategories =
    !!(
      isSuperAdmin ||
      user.admin?.manageCategories
    );

  if (!canViewPage) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8 bg-red-50 rounded-2xl border border-red-100">
          <h2 className="text-red-800 font-black uppercase tracking-widest text-sm">
            Access Denied
          </h2>

          <p className="text-red-600/70 text-xs mt-2 font-bold">
            You do not have permission to
            view this resource.
          </p>
        </div>
      </div>
    );
  }

  /* 3. Query Parameters */

  const page =
    Math.max(
      1,
      Number(params.page) || 1
    );

  const pageSize =
    Math.max(
      1,
      Number(params.pageSize) || 10
    );

  const search =
    params.search?.trim() ?? "";

  const allowedSortFields:
    CategorySortField[] = [
      "position",
      "name",
      "slug",
      "createdAt",
      "updatedAt",
    ];

  const sortBy: CategorySortField =
    allowedSortFields.includes(
      params.sortBy as CategorySortField
    )
      ? (params.sortBy as CategorySortField)
      : "position";

  const sortOrder:
    | "asc"
    | "desc" =
    params.sortOrder === "desc"
      ? "desc"
      : "asc";

  /* 4. Fetch Category Directory */

  const {
    categories,
    total,
    featuredCount,
  } =
    await CategoryService.getAdminCategoryDirectory(
      {
        page,
        pageSize,
        search,
        sortBy,
        sortOrder,
      }
    );

  /* 5. Pagination */

  const totalPages =
    Math.max(
      1,
      Math.ceil(total / pageSize)
    );

  const safePage =
    Math.min(page, totalPages);

  /* 6. Normalize Data */

  const normalizedCategories:
    CategoryRow[] =
    categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      position: category.position,
      isFeatured:
        !!category.isFeatured,

      parentName:
        category.parent?.name ?? null,

      children:
        (
          category.children ?? []
        ).map((child) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,

          children:
            (
              child.children ?? []
            ).map(
              (grandchild) => ({
                id: grandchild.id,
                name: grandchild.name,
                slug: grandchild.slug,
              })
            ),
        })),

      createdAt:
        category.createdAt.toISOString(),
    }));

  /* 7. Render */

  return (
    <div className="p-4 sm:p-6 lg:p-10 w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      <DashboardHeader
        title="Category Directory"
        showAddButton={false}
        showLogout={false}
      />

      {/* Search & Stats Bar */}

      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="w-full xl:max-w-md">
          <CategoriesSearch
            initialSearch={search}
          />
        </div>

        {/* Quick Stats */}

        <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none bg-brand-light/30 border border-brand-primary/10 px-5 py-3 sm:py-4 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[9px] sm:text-[10px] font-black uppercase text-brand-primary tracking-widest leading-none mb-1 sm:mb-2">
              Total Database
            </p>

            <div className="flex items-baseline gap-1">
              <p className="text-xl sm:text-2xl font-black text-accent-navy italic">
                {total}
              </p>

              <span className="text-[10px] font-bold text-brand-primary/60 uppercase">
                Nodes
              </span>
            </div>
          </div>

          <div className="flex-1 sm:flex-none bg-orange-50 border border-orange-100 px-5 py-3 sm:py-4 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[9px] sm:text-[10px] font-black uppercase text-orange-600 tracking-widest leading-none mb-1 sm:mb-2">
              Featured Live
            </p>

            <div className="flex items-baseline gap-1">
              <p className="text-xl sm:text-2xl font-black text-orange-700 italic">
                {featuredCount}
              </p>

              <span className="text-[10px] font-bold text-orange-600/60 uppercase">
                Slots
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}

      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
        <CategoriesTable
          categories={
            normalizedCategories
          }
          canManageCategories={
            canManageCategories
          }
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