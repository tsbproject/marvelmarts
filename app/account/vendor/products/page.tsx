import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/lib/auth";
import { VendorService } from "@/app/lib/services/vendor.service";

import VendorInventoryPage from "../_components/VendorInventoryPage";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  const vendorProfile = await VendorService.getVendorProfile(
    session.user.id
  );

  if (!vendorProfile) {
    redirect("/account/vendor");
  }

  return (
    <VendorInventoryPage
      currentCredits={
        vendorProfile.boost?.credits ?? 0
      }
    />
  );
}