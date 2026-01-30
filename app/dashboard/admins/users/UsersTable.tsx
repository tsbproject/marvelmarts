




// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useNotification } from "@/app/_context/NotificationContext";
// import { UserX, Trash2, Edit3, ShieldAlert, ShieldCheck, Search, Loader2 } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// export default function UsersTable({ initialUsers }: { initialUsers: any[] }) {
//   const router = useRouter();
//   const { notifySuccess, notifyError } = useNotification();
//   const [loadingId, setLoadingId] = useState<string | null>(null);
//   const [filter, setFilter] = useState("ALL");
//   const [search, setSearch] = useState("");

//   // Updated filtering logic to handle the SUSPENDED tab
//   const filteredUsers = initialUsers.filter((u) => {
//     const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) || 
//                          (u.name?.toLowerCase() || "").includes(search.toLowerCase());
    
//     if (filter === "ALL") return matchesSearch;
//     if (filter === "SUSPENDED") return u.isSuspended && matchesSearch;
    
//     return u.role === filter && matchesSearch;
//   });

//   const handleAction = async (id: string, action: 'suspend' | 'delete' | 'unsuspend') => {
//     if (action === 'delete' && !confirm("Permanently delete this user? This cannot be undone.")) return;
    
//     setLoadingId(id);
//     try {
//       const method = action === 'delete' ? 'DELETE' : 'PATCH';
      
//       // Explicitly set true for suspend, false for unsuspend
//       const body = action === 'delete' 
//         ? null 
//         : JSON.stringify({ 
//             isSuspended: action === 'suspend' 
//           });

//       const res = await fetch(`/api/admins/users/${id}`, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body,
//       });

//       if (res.ok) {
//         const message = action === 'delete' 
//           ? 'User removed from system' 
//           : `User ${action === 'suspend' ? 'suspended' : 'restored'} successfully`;
        
//         notifySuccess(message);
        
//         // This triggers the server component to re-fetch data 
//         // and updates the initialUsers prop
//         router.refresh(); 
//       } else {
//         const errorData = await res.json();
//         throw new Error(errorData.error || "Action failed");
//       }
//     } catch (err: any) {
//       notifyError(err.message || `Failed to ${action} user. Please try again.`);
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Search and Filters */}
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
//               {filteredUsers.length > 0 ? (
//                 filteredUsers.map((user) => (
//                   <motion.tr 
//                     layout
//                     key={user.id} 
//                     className={`group transition-colors ${user.isSuspended ? 'bg-red-50/30' : 'hover:bg-gray-50/80'}`}
//                   >
//                     <td className="px-8 py-5">
//                       <div className="flex items-center gap-4">
//                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${user.isSuspended ? 'bg-red-100 text-red-400' : 'bg-blue-50 text-blue-600'}`}>
//                           {user.name?.charAt(0) || "U"}
//                         </div>
//                         <div>
//                           <p className="font-black text-gray-900 uppercase tracking-tight leading-none mb-1">{user.name}</p>
//                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.email}</p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-8 py-5">
//                       {user.isSuspended ? (
//                         <div className="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-widest">
//                           <ShieldAlert size={14} /> Suspended
//                         </div>
//                       ) : (
//                         <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest">
//                           <ShieldCheck size={14} /> Active Access
//                         </div>
//                       )}
//                     </td>
//                     <td className="px-8 py-5">
//                       <div className="flex items-center justify-end gap-2">
//                         <button 
//                           onClick={() => router.push(`/dashboard/admins/users/edit/${user.id}`)}
//                           className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:bg-gray-950 hover:text-white transition-all"
//                         >
//                           <Edit3 size={16} />
//                         </button>
//                         <button 
//                           disabled={loadingId === user.id}
//                           onClick={() => handleAction(user.id, user.isSuspended ? 'unsuspend' : 'suspend')}
//                           className={`p-3 rounded-xl transition-all ${user.isSuspended ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}
//                         >
//                           {loadingId === user.id ? <Loader2 size={16} className="animate-spin" /> : <UserX size={16} />}
//                         </button>
//                         <button 
//                           disabled={loadingId === user.id}
//                           onClick={() => handleAction(user.id, 'delete')}
//                           className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"
//                         >
//                           <Trash2 size={16} />
//                         </button>
//                       </div>
//                     </td>
//                   </motion.tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={3} className="px-8 py-20 text-center">
//                     <p className="text-gray-400 font-black uppercase tracking-widest text-xs italic">
//                       No {filter === "ALL" ? "" : filter.toLowerCase()} users found matching your search
//                     </p>
//                   </td>
//                 </tr>
//               )}
//             </AnimatePresence>
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }





"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/_context/NotificationContext";
import { UserX, Trash2, Edit3, ShieldAlert, ShieldCheck, Search, Loader2, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UsersTable({ initialUsers }: { initialUsers: any[] }) {
  const router = useRouter();
  const { notifySuccess, notifyError } = useNotification();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  
  // NEW: State for the Delete Modal
  const [userToDelete, setUserToDelete] = useState<{id: string, name: string} | null>(null);

  const filteredUsers = initialUsers.filter((u) => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) || 
                         (u.name?.toLowerCase() || "").includes(search.toLowerCase());
    if (filter === "ALL") return matchesSearch;
    if (filter === "SUSPENDED") return u.isSuspended && matchesSearch;
    return u.role === filter && matchesSearch;
  });

  const handleAction = async (id: string, action: 'suspend' | 'delete' | 'unsuspend') => {
    setLoadingId(id);
    try {
      const method = action === 'delete' ? 'DELETE' : 'PATCH';
      const body = action === 'delete' ? null : JSON.stringify({ isSuspended: action === 'suspend' });

      const res = await fetch(`/api/admins/users/${id}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (res.ok) {
        notifySuccess(`User ${action === 'delete' ? 'removed' : action + 'ed'} successfully`);
        setUserToDelete(null); // Close modal if open
        router.refresh();
      } else {
        throw new Error();
      }
    } catch (err) {
      notifyError(`Action failed. Please check your permissions.`);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex bg-gray-100 p-1 rounded-2xl w-full lg:w-fit overflow-x-auto no-scrollbar">
          {["ALL", "CUSTOMER", "VENDOR", "ADMIN", "SUSPENDED"].map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === r 
                  ? (r === "SUSPENDED" ? "bg-red-600 text-white shadow-lg" : "bg-white text-blue-600 shadow-sm") 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search name or email..."
            className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold text-xs uppercase tracking-tight"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">User Identity</th>
              <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Access Status</th>
              <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <AnimatePresence mode="popLayout">
              {filteredUsers.map((user) => (
                <motion.tr 
                  layout
                  key={user.id} 
                  className={`group transition-colors ${user.isSuspended ? 'bg-red-50/30' : 'hover:bg-gray-50/80'}`}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${user.isSuspended ? 'bg-red-100 text-red-400' : 'bg-blue-50 text-blue-600'}`}>
                        {user.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 uppercase tracking-tight leading-none mb-1">{user.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {user.isSuspended ? (
                      <div className="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-widest">
                        <ShieldAlert size={14} /> Suspended
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest">
                        <ShieldCheck size={14} /> Active Access
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => router.push(`/dashboard/admins/users/edit/${user.id}`)}
                        className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:bg-gray-950 hover:text-white transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        disabled={loadingId === user.id}
                        onClick={() => handleAction(user.id, user.isSuspended ? 'unsuspend' : 'suspend')}
                        className={`p-3 rounded-xl transition-all ${user.isSuspended ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}
                      >
                        {loadingId === user.id ? <Loader2 size={16} className="animate-spin" /> : <UserX size={16} />}
                      </button>
                      <button 
                        onClick={() => setUserToDelete({id: user.id, name: user.name || 'User'})}
                        className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* --- CUSTOM DELETE MODAL --- */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-gray-100"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
                  <AlertTriangle size={32} />
                </div>
                <button onClick={() => setUserToDelete(null)} className="p-2 text-gray-300 hover:text-gray-600 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-gray-900 mb-2">
                Terminate <span className="text-red-600">Account?</span>
              </h3>
              <p className="text-gray-500 font-bold text-sm leading-relaxed mb-8">
                You are about to permanently remove <span className="text-gray-900 font-black">{userToDelete.name}</span> from MarvelMarts. This action is irreversible.
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-gray-400 hover:bg-gray-100 transition-all"
                >
                  Keep User
                </button>
                <button 
                  onClick={() => handleAction(userToDelete.id, 'delete')}
                  disabled={loadingId === userToDelete.id}
                  className="flex-1 py-4 bg-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center"
                >
                  {loadingId === userToDelete.id ? <Loader2 className="animate-spin" size={16} /> : "Confirm Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}