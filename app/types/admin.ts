export type Permissions = {
  manageAdmins: boolean;
  manageUsers: boolean;
  manageBlogs: boolean;
  manageProducts: boolean;
  manageOrders: boolean;
  manageMessages: boolean;
  manageSettings: boolean;
};

export type AdminRole = "ADMIN" | "SUPER_ADMIN";

export interface AdminProfile {
  permissions: Permissions;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  adminProfile?: AdminProfile;
}
