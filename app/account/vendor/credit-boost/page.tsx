import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/lib/auth";
import { VendorService } from "@/app/lib/services/vendor.service";

import BoostCreditsClient from "../_components/credit-boost/BoostCreditsClient";

export default async function BoostCreditsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  const vendorProfile =
  await VendorService.getVendorProfile(
    session.user.id
  );

  if (!vendorProfile) {
    redirect("/account/vendor");
  }

  return (
    <BoostCreditsClient
      currentCredits={
        vendorProfile.boost?.credits ?? 0
      }
      vendorProfileId={vendorProfile.id}
      userEmail={session.user.email ?? ""}
    />
  );
}