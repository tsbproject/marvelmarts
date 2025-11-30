// app/dashboard/admins/[id]/edit/page.tsx
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import Link from "next/link";

import EditAdminForm from "../EditAdminForm";

export default async function EditAdminPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return <div className="p-8">Unauthorized</div>;
  }

  const admin = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, email: true, role: true, permissions: true },
  });

  if (!admin) return <div className="p-8">Admin not found</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
         <EditAdminForm admin={admin} />
    </div>
  );
}
