"use client";

import { Trash2 } from "lucide-react";
import { deleteArticleAction } from "./actions"; 

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
      <button 
        type="submit"
        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
        title="Delete Article"
      >
        <Trash2 size={18} />
      </button>
    </form>
  );
}