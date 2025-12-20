// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useNotification } from "@/app/_context/NotificationContext";
// import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";

// interface DeleteCategoryModalProps {
//   categoryId: string;
//   categoryName: string;
//   onClose: () => void;
//   onDeleted?: () => void; // 🔹 new optional callback
// }
// export default function DeleteCategoryModal({
//   categoryId,
//   categoryName,
//   onClose,
//   onDeleted,
// }: DeleteCategoryModalProps) {
//   const router = useRouter();
//   const { notifySuccess, notifyError } = useNotification();
//   const { setLoading } = useLoadingOverlay();

//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [visible, setVisible] = useState(true);

//   async function handleDelete() {
//     setSubmitting(true);
//     setLoading(true);
//     setError(null);

//     try {
//       const res = await fetch(`/api/admins/categories/${categoryId}`, {
//         method: "DELETE",
//       });
//       const data = await res.json();

//       if (res.ok) {
//         notifySuccess("Category deleted successfully");
//         router.push("/dashboard/admins/categories");
//       } else {
//         setError(data.error || "Failed to delete category");
//         notifyError(data.error || "Failed to delete category");
//       }
//     } catch {
//       setError("Unexpected error occurred");
//       notifyError("Unexpected error occurred");
//     } finally {
//       setSubmitting(false);
//       setLoading(false);
//       setVisible(false);
//       setTimeout(onClose, 300); // wait for fade-out
//     }
//   }

//   function handleCancel() {
//     setVisible(false);
//     setTimeout(onClose, 300);
//   }

//   return (
//     <div
//       className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${
//         visible ? "opacity-100 bg-black bg-opacity-50" : "opacity-0"
//       }`}
//     >
//       <div
//         className={`bg-white rounded-lg shadow-lg p-6 w-full max-w-md transform transition-transform duration-300 ${
//           visible ? "scale-100" : "scale-95"
//         }`}
//       >
//         <h2 className="text-xl font-bold mb-4">Delete Category</h2>
//         <p className="mb-4 text-gray-700">
//           Are you sure you want to delete{" "}
//           <span className="font-semibold">{categoryName}</span>? This action
//           cannot be undone.
//         </p>

//         {error && <p className="text-red-600 mb-2">{error}</p>}

//         <div className="flex gap-4 justify-end">
//           <button
//             onClick={handleDelete}
//             disabled={submitting}
//             className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
//           >
//             {submitting ? "Deleting..." : "Yes, Delete"}
//           </button>

//           <button
//             onClick={handleCancel}
//             className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded transition"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/_context/NotificationContext";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";

interface DeleteCategoryModalProps {
  categoryId: string;
  categoryName: string;
  onClose: () => void;
  onDeleted?: (deletedId: string) => void; // 🔹 callback with deleted ID
}

export default function DeleteCategoryModal({
  categoryId,
  categoryName,
  onClose,
  onDeleted,
}: DeleteCategoryModalProps) {
  const router = useRouter();
  const { notifySuccess, notifyError } = useNotification();
  const { setLoading } = useLoadingOverlay();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);

  async function handleDelete() {
    setSubmitting(true);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admins/categories/${categoryId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        notifySuccess("Category deleted successfully");
        if (onDeleted) onDeleted(categoryId); // 🔹 pass back the ID
      } else {
        setError(data.error || "Failed to delete category");
        notifyError(data.error || "Failed to delete category");
      }
    } catch {
      setError("Unexpected error occurred");
      notifyError("Unexpected error occurred");
    } finally {
      setSubmitting(false);
      setLoading(false);
      setVisible(false);
      setTimeout(onClose, 300); // wait for fade-out
    }
  }

  function handleCancel() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${
        visible ? "opacity-100 bg-black bg-opacity-50" : "opacity-0"
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-lg p-6 w-full max-w-md transform transition-transform duration-300 ${
          visible ? "scale-100" : "scale-95"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">Delete Category</h2>
        <p className="mb-4 text-gray-700">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{categoryName}</span>? This action
          cannot be undone.
        </p>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        <div className="flex gap-4 justify-end">
          <button
            onClick={handleDelete}
            disabled={submitting}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
          >
            {submitting ? "Deleting..." : "Yes, Delete"}
          </button>

          <button
            onClick={handleCancel}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
