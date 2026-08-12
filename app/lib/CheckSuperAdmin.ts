




import { UserRole } from "@prisma/client";

import { forbidden } from "@/app/lib/auth/errors";

type AdminUser = {
  id: string;
  role: UserRole;
  email: string;
  name?: string | null;
};

export function checkSuperAdmin(
  user: AdminUser | null | undefined
): void {
  if (!user) {
    throw forbidden(
      "Administrator access required."
    );
  }

  if (user.role !== UserRole.SUPER_ADMIN) {
    throw forbidden(
      "Super Administrator access required."
    );
  }
}
