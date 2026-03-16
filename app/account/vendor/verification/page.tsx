



import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import VerificationCenter from "../verification/_components/VerificationCenter";
import { PendingApprovalView } from "../verification/_components/PendingApprovalView"; 
import { Loader2 } from "lucide-react";

export default async function VendorVerificationPage() {
  // 1. Authenticate
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  // 2. Fetch vendor profile
  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    select: { 
      id: true, 
      status: true,
      identityDoc: true,
      businessDoc: true,
      locationDoc: true
    }
  });

  // 3. Guard: No vendor profile → force registration
  if (!vendor) {
    redirect("/auth/register/vendor-registration");
  }

  // 4. Auto-redirect if already fully APPROVED
  if (vendor.status === "APPROVED") {
    redirect("/account/vendor");
  }

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[#FBFBFB]">
      <Suspense fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-primary" />
          <p className="ml-4 text-accent-navy font-medium">Loading...</p>
        </div>
      }>
        {/* LOGIC SWITCH: 
          If status is PENDING_REVIEW, show the "Under Review" UI.
          Otherwise, show the document upload center.
        */}
        {vendor.status === "PENDING_REVIEW" ? (
          <div className="flex min-h-[70vh] items-center justify-center">
            <PendingApprovalView />
          </div>
        ) : (
          <VerificationCenter 
            vendorProfileId={vendor.id} 
            currentStatus={(vendor.status as any) || "NOT_STARTED"}
            profileData={{
              identityDoc: vendor.identityDoc,
              businessDoc: vendor.businessDoc,
              locationDoc: vendor.locationDoc
            }}
          />
        )}
      </Suspense>
    </div>
  );
}