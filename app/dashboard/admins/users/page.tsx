import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/lib/auth";
import { AuthService } from "@/app/lib/services/auth.service";

import UsersTable from "./UsersTable";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    filter?: string;
  }>;
}

export default async function UsersPage({
  searchParams,
}: PageProps) {
  /* ---------------------------------------------------------------------- */
  /* AUTH                                                                   */
  /* ---------------------------------------------------------------------- */

  const session =
    await getServerSession(authOptions);

  if (
    !session?.user ||
    session.user.role !== "SUPER_ADMIN"
  ) {
    redirect("/dashboard");
  }

  /* ---------------------------------------------------------------------- */
  /* QUERY PARAMETERS                                                       */
  /* ---------------------------------------------------------------------- */

  const params = await searchParams;

  const requestedPage =
    Math.max(
      1,
      Number(params.page) || 1
    );

  const search =
    params.search?.trim() ?? "";

  const allowedFilters = [
    "ALL",
    "CUSTOMER",
    "VENDOR",
    "SUSPENDED",
  ] as const;

  const requestedFilter =
    params.filter?.toUpperCase() ??
    "ALL";

  const filter =
    allowedFilters.includes(
      requestedFilter as
        (typeof allowedFilters)[number]
    )
      ? requestedFilter
      : "ALL";

  /* ---------------------------------------------------------------------- */
  /* USERS                                                                  */
  /* ---------------------------------------------------------------------- */

  const {
    users,
    pagination,
  } =
    await AuthService.getUsersForAdmin({
      page: requestedPage,
      pageSize: 20,
      search,
      filter,
    });

  /* ---------------------------------------------------------------------- */
  /* VIEW                                                                   */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-[#002B5B]">
            User{" "}
            <span className="text-[#F7931E]">
              Database
            </span>
          </h1>

          <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">
            Control Center / Account
            Management
          </p>
        </div>

        <div className="flex gap-2">
          <div className="bg-white border border-gray-100 px-4 py-2 rounded-2xl shadow-sm">
            <span className="text-[10px] font-black uppercase text-gray-400 block">
              Total Users
            </span>

            <span className="text-lg font-black">
              {pagination.total}
            </span>
          </div>
        </div>
      </div>

      {/* Users */}
      <UsersTable
        initialUsers={JSON.parse(
          JSON.stringify(users)
        )}
        pagination={pagination}
        initialSearch={search}
        initialFilter={filter}
      />
    </div>
  );
}