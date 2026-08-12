import {
  notFound,
} from "next/navigation";

import { AuthService } from "@/app/lib/services/auth.service";

import EditUserForm from "./EditUserForm";

interface EditUserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditUserPage({
  params,
}: EditUserPageProps) {
  const { id } =
    await params;

  const user =
    await AuthService.getUserForAdminEdit(
      id
    );

  if (!user) {
    notFound();
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">

      <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-8">
        Edit{" "}
        <span className="text-blue-600">
          User Profile
        </span>
      </h1>

      <EditUserForm
        user={JSON.parse(
          JSON.stringify(user)
        )}
      />

    </div>
  );
}




