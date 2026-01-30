import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import EditUserForm from "./EditUserForm";

// 1. Notice the params type is now a Promise
export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  
  // 2. You MUST await the params to get the actual ID
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id: id }, // Now id won't be undefined
    include: { vendorProfile: true }
  });

  if (!user) notFound();

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-8">
        Edit <span className="text-blue-600">User Profile</span>
      </h1>
      <EditUserForm user={JSON.parse(JSON.stringify(user))} />
    </div>
  );
}




