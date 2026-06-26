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
  manageVerifications: boolean; 
  manageSubscribers: boolean; 
  manageReviews: boolean;
  manageActivity: boolean;
  manageTrending: boolean;
  managePayout: boolean;
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



export const defaultPermissions: Permissions = {
  manageAdmins: false,
  manageUsers: false,
  manageBlogs: false,
  manageProducts: false,
  manageOrders: false,
  manageMessages: false,
  manageSettings: false,
  manageCategories: false,
  manageVendors: false,
  manageVerifications: false,
  manageSubscribers: false,
  manageReviews: false,
  manageActivity: false,
  manageTrending: false,
  manageSupport: false,
  managePayout: false,
};
