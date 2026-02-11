import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import StoreSetupForm from "../StoreSetupForm";

export default async function StoreSetupPage() {
  const session = await getServerSession(authOptions);
  
  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: session?.user?.id },
    include: { store: true }
  });

  if (!vendor) redirect("/account/vendor");

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-black text-accent-navy uppercase tracking-tight">
            Store Identity
          </h1>
          <p className="text-neutral-gray font-medium mt-2">
            Phase 5: Claim your unique URL and brand voice.
          </p>
        </div>

        <StoreSetupForm 
          vendorId={vendor.id} 
          initialData={{
            name: vendor.store?.name || vendor.storeName,
            slug: vendor.store?.slug || "",
            bio: vendor.store?.description || ""
          }} 
        />
      </div>
    </div>
  );
}