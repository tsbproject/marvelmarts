

// app/dashboard/admins/categories/[id]/edit/page.tsx
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import EditCategoryClient from "./EditCategoryClient";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/sign-in");

  const [category, allCategories] = await Promise.all([
    prisma.category.findUnique({ where: { id } }),
    prisma.category.findMany({ select: { id: true, name: true } })
  ]);

  if (!category) notFound();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8 border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-black text-accent-navy uppercase italic tracking-tighter">
          Tactical <span className="text-brand-primary">Editor</span>
        </h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
          Modifying Registry: {category.slug}
        </p>
      </header>

      <EditCategoryClient 
        initialData={category} 
        parentOptions={allCategories.filter(c => c.id !== id)} 
      />
    </div>
  );
}