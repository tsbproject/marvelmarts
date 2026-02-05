



// app/dashboard/admins/categories/create/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import CreateCategoryClient from "./CreateCategoryClient";

export default async function CreateCategoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/sign-in");

  const allCategories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="p-4 md:p-8 max-w-[1000px] mx-auto space-y-6">
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-accent-navy italic">
          New <span className="text-brand-primary">Category Creation</span>
        </h1>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
          Registering fresh Category to MarvelMarts
        </p>
      </div>

      <CreateCategoryClient initialParentOptions={allCategories} />
    </div>
  );
}
