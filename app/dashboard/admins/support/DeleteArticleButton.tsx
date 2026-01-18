// "use client";

// import { Trash2 } from "lucide-react";
// import { deleteArticleAction } from "./actions"; 

// export default function DeleteArticleButton({ id }: { id: string }) {
//   return (
//     <form 
//       action={deleteArticleAction} 
//       onSubmit={(e) => {
//         if (!confirm("Are you sure you want to delete this article?")) {
//           e.preventDefault();
//         }
//       }}
//     >
//       <input type="hidden" name="id" value={id} />
//       <button 
//         type="submit"
//         className="p-2 text-gray-400 hover:text-red-600 transition-colors"
//         title="Delete Article"
//       >
//         <Trash2 size={18} />
//       </button>
//     </form>
//   );
// }



"use client";

import { useFormStatus } from "react-dom";
import { Trash2, Loader2 } from "lucide-react";
import { deleteArticleAction } from "./actions"; // Adjust path if needed

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit"
      disabled={pending}
      className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
      title="Delete Article"
    >
      {pending ? (
        <Loader2 className="h-[18px] w-[18px] animate-spin" />
      ) : (
        <Trash2 size={18} />
      )}
    </button>
  );
}

export default function DeleteArticleButton({ id }: { id: string }) {
  return (
    <form 
      action={deleteArticleAction} 
      onSubmit={(e) => {
        if (!confirm("Are you sure you want to delete this article?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <SubmitButton />
    </form>
  );
}