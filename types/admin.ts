// types/admin.ts

export interface Permissions {
  manageAdmins: boolean;
  manageUsers: boolean;
  manageBlogs: boolean;
  manageProducts: boolean;
  manageOrders: boolean;
  manageMessages: boolean;
  manageSettings: boolean;
  manageCategories: boolean; 
  manageVendors: boolean; 
  manageVerifivations: boolean; 
  manageSubscribers: boolean; 
  manageReviews: boolean;
  manageActivity: boolean;
  manageTrending: boolean;
  manageSupport: boolean;
}


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
