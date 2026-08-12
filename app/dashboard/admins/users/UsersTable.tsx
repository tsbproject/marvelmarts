// "use client";

// import {
//   useEffect,
//   useState,
// } from "react";

// import {
//   usePathname,
//   useRouter,
//   useSearchParams,
// } from "next/navigation";
// import { useNotification } from "@/app/_context/NotificationContext";
// import { UserX, Trash2, Edit3, ShieldAlert, ShieldCheck, Search, Loader2, AlertTriangle, X } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// interface PaginationData {
//   page: number;
//   pageSize: number;
//   total: number;
//   totalPages: number;
// }

// interface UsersTableProps {
//   initialUsers: any[];
//   pagination: PaginationData;
//   initialSearch: string;
//   initialFilter: string;
// }

// export default function UsersTable({
//   initialUsers,
//   pagination,
//   initialSearch,
//   initialFilter,
// }: UsersTableProps) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   const {
//     notifySuccess,
//     notifyError,
//   } = useNotification();

//   const [loadingId, setLoadingId] =
//     useState<string | null>(null);

//   const [search, setSearch] =
//     useState(initialSearch);

//   const [userToDelete, setUserToDelete] =
//     useState<{
//       id: string;
//       name: string;
//     } | null>(null);



//   const [filter, setFilter] = useState("ALL");

  



//   const updateQuery = (
//   updates: Record<
//     string,
//     string | number | null
//   >
// ) => {
//   const params =
//     new URLSearchParams(
//       searchParams.toString()
//     );

//   Object.entries(updates).forEach(
//     ([key, value]) => {
//       if (
//         value === null ||
//         value === ""
//       ) {
//         params.delete(key);
//       } else {
//         params.set(
//           key,
//           String(value)
//         );
//       }
//     }
//   );

//   router.push(
//     `${pathname}?${params.toString()}`
//   );
// };

// const handleFilterChange = (
//   nextFilter: string
// ) => {
//   updateQuery({
//     filter:
//       nextFilter === "ALL"
//         ? null
//         : nextFilter,
//     page: 1,
//   });
// };

// useEffect(() => {
//   if (search === initialSearch) {
//     return;
//   }

//   const timer = setTimeout(() => {
//     updateQuery({
//       search:
//         search.trim() || null,
//       page: 1,
//     });
//   }, 400);

//   return () =>
//     clearTimeout(timer);
// }, [search, initialSearch]);

//   const handleAction = async (id: string, action: 'suspend' | 'delete' | 'unsuspend') => {
//     setLoadingId(id);
//     try {
//       const method = action === 'delete' ? 'DELETE' : 'PATCH';
//       const body = action === 'delete' ? null : JSON.stringify({ isSuspended: action === 'suspend' });

//       const res = await fetch(`/api/admins/users/${id}`, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body,
//       });

//       if (res.ok) {
//         notifySuccess(`User ${action === 'delete' ? 'removed' : action + 'ed'} successfully`);
//         setUserToDelete(null); // Close modal if open
//         router.refresh();
//       } else {
//         throw new Error();
//       }
//     } catch (err) {
//       notifyError(`Action failed. Please check your permissions.`);
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Search and Filters Header */}
//       <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
//         <div className="flex bg-gray-100 p-1 rounded-2xl w-full lg:w-fit overflow-x-auto no-scrollbar">
//           {["ALL", "CUSTOMER", "VENDOR", "ADMIN", "SUSPENDED"].map((r) => (
//             <button
//               key={r}
//               onClick={() => setFilter(r)}
//               className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
//                 filter === r 
//                   ? (r === "SUSPENDED" ? "bg-red-600 text-white shadow-lg" : "bg-white text-blue-600 shadow-sm") 
//                   : "text-gray-400 hover:text-gray-600"
//               }`}
//             >
//               {r}
//             </button>
//           ))}
//         </div>
//         <div className="relative w-full lg:w-96">
//           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//           <input 
//             type="text"
//             placeholder="Search name or email..."
//             className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold text-xs uppercase tracking-tight"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>
//       </div>

//       {/* Table Content */}
//       <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
//         <table className="w-full text-left border-collapse">
//           <thead>
//             <tr className="bg-gray-50/50 border-b border-gray-100">
//               <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">User Identity</th>
//               <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Access Status</th>
//               <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Control</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-50">
//             <AnimatePresence mode="popLayout">
//               {filteredUsers.map((user) => (
//                 <motion.tr 
//                   layout
//                   key={user.id} 
//                   className={`group transition-colors ${user.isSuspended ? 'bg-red-50/30' : 'hover:bg-gray-50/80'}`}
//                 >
//                   <td className="px-8 py-5">
//                     <div className="flex items-center gap-4">
//                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${user.isSuspended ? 'bg-red-100 text-red-400' : 'bg-blue-50 text-blue-600'}`}>
//                         {user.name?.charAt(0) || "U"}
//                       </div>
//                       <div>
//                         <p className="font-black text-gray-900 uppercase tracking-tight leading-none mb-1">{user.name}</p>
//                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.email}</p>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-8 py-5">
//                     {user.isSuspended ? (
//                       <div className="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-widest">
//                         <ShieldAlert size={14} /> Suspended
//                       </div>
//                     ) : (
//                       <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest">
//                         <ShieldCheck size={14} /> Active Access
//                       </div>
//                     )}
//                   </td>
//                   <td className="px-8 py-5 text-right">
//                     <div className="flex items-center justify-end gap-2">
//                       <button 
//                         onClick={() => router.push(`/dashboard/admins/users/edit/${user.id}`)}
//                         className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:bg-gray-950 hover:text-white transition-all"
//                       >
//                         <Edit3 size={16} />
//                       </button>
//                       <button 
//                         disabled={loadingId === user.id}
//                         onClick={() => handleAction(user.id, user.isSuspended ? 'unsuspend' : 'suspend')}
//                         className={`p-3 rounded-xl transition-all ${user.isSuspended ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}
//                       >
//                         {loadingId === user.id ? <Loader2 size={16} className="animate-spin" /> : <UserX size={16} />}
//                       </button>
//                       <button 
//                         onClick={() => setUserToDelete({id: user.id, name: user.name || 'User'})}
//                         className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     </div>
//                   </td>
//                 </motion.tr>
//               ))}
//             </AnimatePresence>
//           </tbody>
//         </table>
//       </div>

//       {/* --- CUSTOM DELETE MODAL --- */}
//       <AnimatePresence>
//         {userToDelete && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
//             <motion.div 
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-gray-100"
//             >
//               <div className="flex justify-between items-start mb-6">
//                 <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
//                   <AlertTriangle size={32} />
//                 </div>
//                 <button onClick={() => setUserToDelete(null)} className="p-2 text-gray-300 hover:text-gray-600 transition-colors">
//                   <X size={24} />
//                 </button>
//               </div>

//               <h3 className="text-2xl font-black italic uppercase tracking-tighter text-gray-900 mb-2">
//                 Terminate <span className="text-red-600">Account?</span>
//               </h3>
//               <p className="text-gray-500 font-bold text-sm leading-relaxed mb-8">
//                 You are about to permanently remove <span className="text-gray-900 font-black">{userToDelete.name}</span> from MarvelMarts. This action is irreversible.
//               </p>

//               <div className="flex gap-3">
//                 <button 
//                   onClick={() => setUserToDelete(null)}
//                   className="flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-gray-400 hover:bg-gray-100 transition-all"
//                 >
//                   Keep User
//                 </button>
//                 <button 
//                   onClick={() => handleAction(userToDelete.id, 'delete')}
//                   disabled={loadingId === userToDelete.id}
//                   className="flex-1 py-4 bg-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center"
//                 >
//                   {loadingId === userToDelete.id ? <Loader2 className="animate-spin" size={16} /> : "Confirm Delete"}
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }



"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  UserX,
  Trash2,
  Edit3,
  ShieldAlert,
  ShieldCheck,
  Search,
  Loader2,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import { useNotification } from "@/app/_context/NotificationContext";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  image?: string | null;
  IsVerified?: boolean;
  isSuspended: boolean;
  createdAt?: string;

  vendorProfile?: {
    storeName: string | null;
  } | null;
}

interface PaginationData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface UsersTableProps {
  initialUsers: UserRow[];
  pagination: PaginationData;
  initialSearch: string;
  initialFilter: string;
}

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */

export default function UsersTable({
  initialUsers,
  pagination,
  initialSearch,
  initialFilter,
}: UsersTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams =
    useSearchParams();

  const {
    notifySuccess,
    notifyError,
  } = useNotification();

  /* ---------------------------------------------------------------------- */
  /* STATE                                                                  */
  /* ---------------------------------------------------------------------- */

  const [
    loadingId,
    setLoadingId,
  ] = useState<string | null>(
    null
  );

  const [
    search,
    setSearch,
  ] = useState(initialSearch);

  const [
    userToDelete,
    setUserToDelete,
  ] = useState<{
    id: string;
    name: string;
  } | null>(null);

  /* ---------------------------------------------------------------------- */
  /* SYNC SEARCH STATE                                                      */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  /* ---------------------------------------------------------------------- */
  /* URL QUERY HELPER                                                       */
  /* ---------------------------------------------------------------------- */

  const updateQuery = (
    updates: Record<
      string,
      string | number | null
    >
  ) => {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    Object.entries(
      updates
    ).forEach(
      ([key, value]) => {
        if (
          value === null ||
          value === ""
        ) {
          params.delete(key);
        } else {
          params.set(
            key,
            String(value)
          );
        }
      }
    );

    const queryString =
      params.toString();

    router.push(
      queryString
        ? `${pathname}?${queryString}`
        : pathname
    );
  };

  /* ---------------------------------------------------------------------- */
  /* SEARCH                                                                 */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const normalizedSearch =
      search.trim();

    if (
      normalizedSearch ===
      initialSearch
    ) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        updateQuery({
          search:
            normalizedSearch ||
            null,
          page: 1,
        });
      }, 450);

    return () => {
      window.clearTimeout(
        timer
      );
    };
    // updateQuery intentionally excluded:
    // it is recreated during render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    search,
    initialSearch,
  ]);

  /* ---------------------------------------------------------------------- */
  /* FILTER                                                                 */
  /* ---------------------------------------------------------------------- */

  const handleFilterChange = (
    filter: string
  ) => {
    updateQuery({
      filter:
        filter === "ALL"
          ? null
          : filter,
      page: 1,
    });
  };

  /* ---------------------------------------------------------------------- */
  /* USER ACTIONS                                                           */
  /* ---------------------------------------------------------------------- */

  const handleAction = async (
    id: string,
    action:
      | "suspend"
      | "delete"
      | "unsuspend"
  ) => {
    setLoadingId(id);

    try {
      const method =
        action === "delete"
          ? "DELETE"
          : "PATCH";

      const body =
        action === "delete"
          ? undefined
          : JSON.stringify({
              isSuspended:
                action ===
                "suspend",
            });

      const response =
        await fetch(
          `/api/admins/users/${id}`,
          {
            method,

            headers:
              action ===
              "delete"
                ? undefined
                : {
                    "Content-Type":
                      "application/json",
                  },

            body,
          }
        );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "User action failed."
        );
      }

      if (
        action === "delete"
      ) {
        notifySuccess(
          "User removed successfully"
        );

        setUserToDelete(
          null
        );
      } else if (
        action === "suspend"
      ) {
        notifySuccess(
          "User suspended successfully"
        );
      } else {
        notifySuccess(
          "User restored successfully"
        );
      }

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Action failed. Please try again.";

      notifyError(message);
    } finally {
      setLoadingId(null);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* PAGINATION CALCULATIONS                                                */
  /* ---------------------------------------------------------------------- */

  const currentPage =
    pagination.page;

  const totalPages =
    Math.max(
      1,
      pagination.totalPages
    );

  const firstVisibleUser =
    pagination.total === 0
      ? 0
      : (currentPage - 1) *
          pagination.pageSize +
        1;

  const lastVisibleUser =
    Math.min(
      currentPage *
        pagination.pageSize,
      pagination.total
    );

  const visiblePages =
    Array.from(
      {
        length: totalPages,
      },
      (_, index) =>
        index + 1
    ).filter(
      (pageNumber) =>
        pageNumber === 1 ||
        pageNumber ===
          totalPages ||
        Math.abs(
          pageNumber -
            currentPage
        ) <= 1
    );

  /* ---------------------------------------------------------------------- */
  /* VIEW                                                                   */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="space-y-6">

      {/* ------------------------------------------------------------------ */}
      {/* SEARCH + FILTERS                                                   */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">

        <div className="flex bg-gray-100 p-1 rounded-2xl w-full xl:w-fit overflow-x-auto no-scrollbar">

          {[
            "ALL",
            "CUSTOMER",
            "VENDOR",
            "SUSPENDED",
          ].map((filter) => {
            const active =
              initialFilter ===
              filter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() =>
                  handleFilterChange(
                    filter
                  )
                }
                className={`flex-1 xl:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  active
                    ? filter ===
                      "SUSPENDED"
                      ? "bg-red-600 text-white shadow-lg"
                      : "bg-white text-blue-600 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        <div className="relative w-full xl:w-96">

          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />

          <input
            type="search"
            placeholder="Search name or email..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            className="w-full pl-12 pr-11 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold text-xs tracking-tight"
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-700 transition-colors"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* RESULT SUMMARY                                                     */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2">

        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
          {pagination.total ===
          0 ? (
            "No matching users"
          ) : (
            <>
              Showing{" "}
              <span className="text-gray-900">
                {
                  firstVisibleUser
                }
                –
                {lastVisibleUser}
              </span>{" "}
              of{" "}
              <span className="text-blue-600">
                {pagination.total}
              </span>{" "}
              users
            </>
          )}
        </p>

        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
          Page{" "}
          <span className="text-gray-900">
            {currentPage}
          </span>{" "}
          of{" "}
          <span className="text-gray-900">
            {totalPages}
          </span>
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* USERS TABLE                                                        */}
      {/* ------------------------------------------------------------------ */}

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[760px] text-left border-collapse">

            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">

                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                  User Identity
                </th>

                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Account Type
                </th>

                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Access Status
                </th>

                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">
                  Control
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">

              <AnimatePresence
                mode="popLayout"
              >

                {initialUsers.length >
                0 ? (
                  initialUsers.map(
                    (user) => (
                      <motion.tr
                        layout
                        key={user.id}
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        exit={{
                          opacity: 0,
                        }}
                        className={`group transition-colors ${
                          user.isSuspended
                            ? "bg-red-50/30"
                            : "hover:bg-gray-50/80"
                        }`}
                      >

                        {/* Identity */}

                        <td className="px-8 py-5">

                          <div className="flex items-center gap-4">

                            <div
                              className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center font-black text-lg ${
                                user.isSuspended
                                  ? "bg-red-100 text-red-400"
                                  : "bg-blue-50 text-blue-600"
                              }`}
                            >
                              {user.name
                                ?.charAt(
                                  0
                                )
                                .toUpperCase() ||
                                "U"}
                            </div>

                            <div className="min-w-0">

                              <p className="font-black text-gray-900 uppercase tracking-tight leading-none mb-1 truncate">
                                {user.name ||
                                  "Unnamed User"}
                              </p>

                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">
                                {
                                  user.email
                                }
                              </p>

                              {user
                                .vendorProfile
                                ?.storeName && (
                                <p className="text-[10px] font-bold text-blue-500 mt-1 truncate">
                                  {
                                    user
                                      .vendorProfile
                                      .storeName
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Account Type */}

                        <td className="px-8 py-5">

                          <span className="inline-flex px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-[9px] font-black uppercase tracking-widest">
                            {user.role ||
                              "CUSTOMER"}
                          </span>
                        </td>

                        {/* Status */}

                        <td className="px-8 py-5">

                          {user.isSuspended ? (
                            <div className="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-widest">
                              <ShieldAlert
                                size={
                                  14
                                }
                              />
                              Suspended
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest">
                              <ShieldCheck
                                size={
                                  14
                                }
                              />
                              Active
                              Access
                            </div>
                          )}
                        </td>

                        {/* Actions */}

                        <td className="px-8 py-5">

                          <div className="flex items-center justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/dashboard/admins/users/edit/${user.id}`
                                )
                              }
                              title="Edit user"
                              className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:bg-gray-950 hover:text-white transition-all"
                            >
                              <Edit3
                                size={
                                  16
                                }
                              />
                            </button>

                            <button
                              type="button"
                              disabled={
                                loadingId ===
                                user.id
                              }
                              onClick={() =>
                                handleAction(
                                  user.id,
                                  user.isSuspended
                                    ? "unsuspend"
                                    : "suspend"
                                )
                              }
                              title={
                                user.isSuspended
                                  ? "Restore user"
                                  : "Suspend user"
                              }
                              className={`p-3 rounded-xl transition-all disabled:opacity-50 ${
                                user.isSuspended
                                  ? "bg-green-100 text-green-600 hover:bg-green-600 hover:text-white"
                                  : "bg-amber-100 text-amber-600 hover:bg-amber-500 hover:text-white"
                              }`}
                            >
                              {loadingId ===
                              user.id ? (
                                <Loader2
                                  size={
                                    16
                                  }
                                  className="animate-spin"
                                />
                              ) : (
                                <UserX
                                  size={
                                    16
                                  }
                                />
                              )}
                            </button>

                            <button
                              type="button"
                              disabled={
                                loadingId ===
                                user.id
                              }
                              onClick={() =>
                                setUserToDelete(
                                  {
                                    id: user.id,
                                    name:
                                      user.name ||
                                      user.email ||
                                      "User",
                                  }
                                )
                              }
                              title="Delete user"
                              className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                            >
                              <Trash2
                                size={
                                  16
                                }
                              />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  )
                ) : (
                  <motion.tr
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                  >
                    <td
                      colSpan={4}
                      className="px-8 py-20 text-center"
                    >
                      <div className="max-w-sm mx-auto">

                        <Search
                          size={30}
                          className="mx-auto text-gray-200 mb-4"
                        />

                        <p className="text-gray-400 font-black uppercase tracking-widest text-xs italic">
                          No users
                          found
                        </p>

                        <p className="text-gray-300 text-xs mt-2">
                          Try
                          changing
                          your search
                          or filter.
                        </p>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* PAGINATION                                                         */}
      {/* ------------------------------------------------------------------ */}

      {pagination.total > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-gray-100 rounded-3xl px-5 py-4 shadow-sm">

          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Showing{" "}
            <span className="text-gray-900">
              {firstVisibleUser}
              –
              {lastVisibleUser}
            </span>{" "}
            of{" "}
            <span className="text-blue-600">
              {pagination.total}
            </span>
          </div>

          <div className="flex items-center gap-2">

            {/* Previous */}

            <button
              type="button"
              disabled={
                currentPage <= 1
              }
              onClick={() =>
                updateQuery({
                  page:
                    currentPage -
                    1,
                })
              }
              className="h-10 px-3 sm:px-4 flex items-center gap-2 rounded-xl border border-gray-100 bg-white text-[10px] font-black uppercase tracking-widest text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:border-blue-600 hover:text-blue-600 transition-all"
            >
              <ChevronLeft
                size={15}
              />

              <span className="hidden sm:inline">
                Previous
              </span>
            </button>

            {/* Page numbers */}

            <div className="flex items-center gap-2">

              {visiblePages.map(
                (
                  pageNumber,
                  index
                ) => {
                  const previous =
                    visiblePages[
                      index -
                        1
                    ];

                  const showDots =
                    previous &&
                    pageNumber -
                      previous >
                      1;

                  return (
                    <div
                      key={
                        pageNumber
                      }
                      className="flex items-center gap-2"
                    >
                      {showDots && (
                        <span className="px-1 text-gray-300 text-xs font-black">
                          …
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          updateQuery(
                            {
                              page:
                                pageNumber,
                            }
                          )
                        }
                        className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${
                          currentPage ===
                          pageNumber
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                            : "bg-white border border-gray-100 text-gray-500 hover:border-blue-600 hover:text-blue-600"
                        }`}
                      >
                        {
                          pageNumber
                        }
                      </button>
                    </div>
                  );
                }
              )}
            </div>

            {/* Next */}

            <button
              type="button"
              disabled={
                currentPage >=
                totalPages
              }
              onClick={() =>
                updateQuery({
                  page:
                    currentPage +
                    1,
                })
              }
              className="h-10 px-3 sm:px-4 flex items-center gap-2 rounded-xl border border-gray-100 bg-white text-[10px] font-black uppercase tracking-widest text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:border-blue-600 hover:text-blue-600 transition-all"
            >
              <span className="hidden sm:inline">
                Next
              </span>

              <ChevronRight
                size={15}
              />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* DELETE CONFIRMATION MODAL                                          */}
      {/* ------------------------------------------------------------------ */}

      <AnimatePresence>

        {userToDelete && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() =>
              setUserToDelete(
                null
              )
            }
          >

            <motion.div
              initial={{
                scale: 0.92,
                opacity: 0,
                y: 20,
              }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
              }}
              exit={{
                scale: 0.92,
                opacity: 0,
                y: 20,
              }}
              transition={{
                duration: 0.2,
              }}
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl"
            >

              {/* Close */}

              <button
                type="button"
                onClick={() =>
                  setUserToDelete(
                    null
                  )
                }
                className="absolute top-5 right-5 p-2 rounded-xl text-gray-300 hover:bg-gray-100 hover:text-gray-700 transition-all"
              >
                <X size={18} />
              </button>

              {/* Icon */}

              <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6">
                <AlertTriangle
                  size={28}
                />
              </div>

              <h3 className="text-2xl font-black uppercase tracking-tight text-gray-950">
                Delete User?
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                You are about to
                permanently delete{" "}
                <span className="font-black text-gray-900">
                  {
                    userToDelete.name
                  }
                </span>
                . This action cannot
                be undone.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">

                <button
                  type="button"
                  disabled={
                    loadingId ===
                    userToDelete.id
                  }
                  onClick={() =>
                    setUserToDelete(
                      null
                    )
                  }
                  className="flex-1 px-5 py-4 rounded-2xl bg-gray-100 text-gray-600 font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    loadingId ===
                    userToDelete.id
                  }
                  onClick={() =>
                    handleAction(
                      userToDelete.id,
                      "delete"
                    )
                  }
                  className="flex-1 px-5 py-4 rounded-2xl bg-red-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loadingId ===
                  userToDelete.id ? (
                    <>
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2
                        size={15}
                      />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}