export function checkSuperAdmin(user) {
  if (!user || user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }
}
