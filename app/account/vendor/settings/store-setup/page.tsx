// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import { prisma } from "@/app/lib/prisma";
// import { redirect } from "next/navigation";
// import StoreSetupForm from "../StoreSetupForm";

// export default async function StoreSetupPage() {
//   const session = await getServerSession(authOptions);
  
//   const vendor = await prisma.vendorProfile.findUnique({
//     where: { userId: session?.user?.id },
//     include: { store: true }
//   });

//   if (!vendor) redirect("/account/vendor");

//   return (
//     <div className="min-h-screen bg-[#FBFBFB] py-12 px-4">
//       <div className="max-w-2xl mx-auto">
//         <div className="mb-10 text-center md:text-left">
//           <h1 className="text-4xl font-black text-accent-navy uppercase tracking-tight">
//             Store Identity
//           </h1>
//           <p className="text-neutral-gray font-medium mt-2">
//             Phase 5: Claim your unique URL and brand voice.
//           </p>
//         </div>

//         <StoreSetupForm 
//           vendorId={vendor.id} 
//           initialData={{
//             name: vendor.store?.name || vendor.storeName,
//             slug: vendor.store?.slug || "",
//             bio: vendor.store?.description || ""
//           }} 
//         />
//       </div>
//     </div>
//   );
// }




import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import StoreSetupForm from "../StoreSetupForm";

export default async function StoreSetupPage() {
  // 1. Get the session first
  const session = await getServerSession(authOptions);

  // 2. CRITICAL FIX: Ensure session and user ID exist before calling Prisma
  // This prevents the "userId: undefined" error you encountered
  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  // 3. Check vendor status from the session (populated via the auth callback we updated)
  // If they are REJECTED, they shouldn't be here; they should be at the dashboard fixing their app.
  if (session.user.vendorStatus === "REJECTED") {
    redirect("/account/vendor");
  }

  // 4. Fetch the vendor profile safely
  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    include: { 
      store: true,
      // You might want to include onboarding if Phase 5 relies on it
    }
  });

  // 5. If no vendor profile exists at all, send back to main account area
  if (!vendor) {
    redirect("/account/vendor");
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-black text-[#002B5B] uppercase tracking-tight">
            Store Identity
          </h1>
          <p className="text-gray-500 font-medium mt-2">
            Phase 5: Claim your unique URL and brand voice.
          </p>
        </div>

        <StoreSetupForm 
          vendorId={vendor.id} 
          initialData={{
            name: vendor.store?.name || vendor.storeName,
            slug: vendor.store?.slug || "",
            bio: vendor.store?.description || "" // Mapping description to bio as per your setup
          }} 
        />
      </div>
    </div>
  );
}