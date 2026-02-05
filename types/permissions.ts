export type AdminPermissions = {
 manageAdmins: boolean;
  manageUsers: boolean;
  manageBlogs: boolean;
  manageProducts: boolean;
  manageOrders: boolean;
  manageMessages: boolean;
  manageSettings: boolean;
  manageCategories: boolean; 
  manageReviews: boolean; 
  manageSupport: boolean; 
  manageActivity: boolean; 
  manageTrending: boolean, 
  manageSubscribers: boolean,
};

// Default state for new Admins
export const defaultAdminPermissions: AdminPermissions = {
 manageAdmins: false,
  manageUsers: false,
  manageBlogs: false,
  manageProducts: false,
  manageOrders: false,
  manageMessages: false,
  manageSettings: false,
  manageCategories: false, 
  manageReviews: false, 
  manageSupport: false, 
  manageActivity: false, 
  manageTrending: false,
  manageSubscribers: false,
};