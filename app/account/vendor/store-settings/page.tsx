import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import StoreSettingsForm from "./StoreSettingForm";
import { VendorService } from "@/app/lib/services/vendor.service";


export default async function VendorSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect("/auth/sign-in");
  if (session.user.vendorStatus === "REJECTED") redirect("/account/vendor");

  let vendor;
      try {
            vendor =
              await VendorService.getVendorSettingsProfile(
                session.user.id
              );
          } catch {
            redirect("/account/vendor");
          }

  if (!vendor) redirect("/account/vendor");

  // FIX: Create a serialized version of the vendor object
  const serializedVendor = {
    ...vendor,
    // Convert Decimal to number
    balance: vendor.balance ? Number(vendor.balance) : 0,
    // Ensure dates are strings or timestamps
    createdAt: vendor.createdAt.toISOString(),
    updatedAt: vendor.updatedAt.toISOString(),
    // Handle other potentially problematic fields
  };

  return (
    <StoreSettingsForm 
      // Pass the serialized object instead of the raw prisma result
      vendor={serializedVendor} 
      initialStoreData={serializedVendor.store} 
    />
  );
}
