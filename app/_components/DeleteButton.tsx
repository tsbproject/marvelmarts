"use client";

import { useFormStatus } from "react-dom";
import { Trash2, Loader2 } from "lucide-react";

/**
 * This component handles ONLY the button UI and its loading state.
 * It must be placed INSIDE a <form> tag in a different file.
 */
export default function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit"
      disabled={pending}
      className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
      title="Delete Item"
    >
      {pending ? (
        <Loader2 className="animate-spin" size={18} />
      ) : (
        <Trash2 size={18} />
      )}
    </button>
  );
}