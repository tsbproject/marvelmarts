export const verifyVendorAccess = (vendor: any, router: any) => {
  const isVerified = vendor?.isVerified;
  const isSetupComplete = vendor?.storeDone && vendor?.productDone;

  if (!isVerified) {
    router.push("/account/vendor/verification-center");
    return false;
  }
  
  if (!isSetupComplete) {
    router.push("/dashboard/settings"); // Or your store setup path
    return false;
  }

  return true;
};