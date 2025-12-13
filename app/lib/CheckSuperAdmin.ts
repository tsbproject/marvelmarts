type AdminUser = {
  id: string;
  role: "ADMIN" | "SUPER_ADMIN";
  email: string;
  name?: string | null;
};

export function checkSuperAdmin(user: AdminUser | null | undefined) {
  if (!user || user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }
}
