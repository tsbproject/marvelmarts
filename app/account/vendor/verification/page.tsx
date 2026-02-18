import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import VerificationCenter from "../verification/_components/VerificationCenter";

export default async function VendorVerificationPage() {
  // 1. Authenticate the user
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // 2. Fetch the Vendor Profile
  // We select only the necessary fields: id and status
  const vendor = await prisma.vendorProfile.findUnique({
    where: { 
      userId: session.user.id 
    },
    select: { 
      id: true, 
      status: true 
    }
  });

  // 3. Guard: If the user is not a vendor yet, redirect to onboarding
  if (!vendor) {
    redirect("/auth/register/vendor-registration");
  }

  return (
    <div className="p-4 md:p-8">
      {/* We pass the vendor.id and vendor.status.
          If status is null (unlikely due to DB defaults), 
          we fallback to "NOT_STARTED".
      */}
      <VerificationCenter 
        vendorProfileId={vendor.id} 
        currentStatus={(vendor.status as any) || "NOT_STARTED"} 
      />
    </div>
  );
}