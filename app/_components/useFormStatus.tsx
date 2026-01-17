import { useFormStatus } from "react-dom";
import { Trash2, Loader2 } from "lucide-react";

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit"
      disabled={pending}
      className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
      title="Delete Article"
    >
      {pending ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
    </button>
  );
}

// Then in your form:
<form action={deleteArticleAction} onSubmit={...}>
  <input type="hidden" name="id" value={id} />
  <DeleteButton />
</form>