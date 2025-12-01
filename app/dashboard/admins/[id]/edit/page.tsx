// app/dashboard/admins/[id]/edit/page.tsx
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import EditAdminForm from "../EditAdminForm";

export default async function EditAdminPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  // Only SUPER_ADMIN can access this page
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return <div className="p-8">Unauthorized</div>;
  }

  const admin = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, email: true, role: true, permissions: true },
  });

  if (!admin) return <div className="p-8">Admin not found</div>;

  // Ensure permissions is typed correctly
  const typedAdmin = {
    ...admin,
    permissions:
      typeof admin.permissions === "object" && admin.permissions !== null
        ? (admin.permissions as Record<string, boolean>)
        : {},
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <EditAdminForm admin={typedAdmin} />
    </div>
  );
}
