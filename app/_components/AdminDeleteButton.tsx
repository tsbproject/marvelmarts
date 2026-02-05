// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useNotification } from "@/app/_context/NotificationContext";
// import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";
// import { Trash2, AlertTriangle, X } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// interface AdminDeleteButtonProps {
//   id: string;
// }

// export default function AdminDeleteButton({ id }: AdminDeleteButtonProps) {
//   const { notifySuccess, notifyError } = useNotification();
//   const { setLoading } = useLoadingOverlay();
//   const router = useRouter();

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [loading, setLocalLoading] = useState(false);

//   async function handleDelete() {
//     setIsModalOpen(false); // Close modal first
//     setLocalLoading(true);
//     setLoading(true);

//     try {
//       const res = await fetch(`/api/admins/${id}`, { method: "DELETE" });
//       const data = await res.json();

//       if (res.ok && data.success) {
//         notifySuccess("Admin removed from the team");
//         router.refresh();
//       } else {
//         notifyError(data.error ?? "Failed to delete admin");
//       }
//     } catch {
//       notifyError("Unexpected error deleting admin");
//     } finally {
//       setLocalLoading(false);
//       setLoading(false);
//     }
//   }

//   return (
//     <>
//       {/* The Button */}
//       <button
//         onClick={() => setIsModalOpen(true)}
//         disabled={loading}
//         title="Delete Admin"
//         className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 shadow-sm disabled:opacity-50 group flex items-center justify-center gap-2"
//       >
//         <Trash2 size={16} />
//         <span className="lg:hidden text-xs font-black uppercase tracking-widest">Delete Admin</span>
//       </button>

//       {/* Confirmation Modal */}
//       <AnimatePresence>
//         {isModalOpen && (
//           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//             {/* Backdrop */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setIsModalOpen(false)}
//               className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
//             />

//             {/* Modal Content */}
//             <motion.div
//               initial={{ scale: 0.95, opacity: 0, y: 20 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.95, opacity: 0, y: 20 }}
//               className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl overflow-hidden"
//             >
//               <div className="flex justify-between items-start mb-6">
//                 <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
//                   <AlertTriangle size={24} />
//                 </div>
//                 <button 
//                   onClick={() => setIsModalOpen(false)}
//                   className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>

//               <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">
//                 Confirm Deletion
//               </h3>
//               <p className="text-gray-500 font-medium mb-8 leading-relaxed">
//                 Are you sure you want to remove this administrator? This action is permanent and will revoke all access immediately.
//               </p>

//               <div className="flex flex-col sm:flex-row gap-3">
//                 <button
//                   onClick={() => setIsModalOpen(false)}
//                   className="flex-1 py-4 px-6 rounded-2xl bg-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleDelete}
//                   className="flex-1 py-4 px-6 rounded-2xl bg-red-600 text-white font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-shadow shadow-lg shadow-red-200"
//                 >
//                   Yes, Delete
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }




"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux"; // Added
import { deleteAdmin } from "@/store/adminSlice";
import { useNotification } from "@/app/_context/NotificationContext";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminDeleteButtonProps {
  id: string;
}

export default function AdminDeleteButton({ id }: AdminDeleteButtonProps) {
  const { notifySuccess, notifyError } = useNotification();
  const { setLoading } = useLoadingOverlay();
  const dispatch = useDispatch(); // Added
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLocalLoading] = useState(false);

  async function handleDelete() {
    setIsModalOpen(false);
    setLocalLoading(true);
    setLoading(true);

    try {
      const res = await fetch(`/api/admins/${id}`, { method: "DELETE" });
      const data = await res.json();

      // Check for res.ok (200-299)
      if (res.ok) {
        // 1. Update Redux State immediately
        dispatch(deleteAdmin(id));
        
        // 2. Notify Success
        notifySuccess(data.message || "Admin removed from the team");
        
        // 3. Optional: refresh server components if they aren't listening to Redux
        router.refresh();
      } else {
        // Handle specific server-sent errors
        notifyError(data.error || "Failed to delete admin");
      }
    } catch (error) {
      console.error("Delete UI Error:", error);
      notifyError("Unexpected error deleting admin");
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={loading}
        title="Delete Admin"
        className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 shadow-sm disabled:opacity-50 group flex items-center justify-center gap-2"
      >
        <Trash2 size={16} />
        <span className="lg:hidden text-xs font-black uppercase tracking-widest">Delete Admin</span>
      </button>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                  <AlertTriangle size={24} />
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">
                Confirm Deletion
              </h3>
              <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                Are you sure you want to remove this administrator? This action is permanent and will revoke all access immediately.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 px-6 rounded-2xl bg-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-4 px-6 rounded-2xl bg-red-600 text-white font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-shadow shadow-lg shadow-red-200"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}