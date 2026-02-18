import { prisma } from "@/app/lib/prisma";
import { format } from "date-fns";
import { ShieldCheck, CheckCircle2, UserCircle } from "lucide-react";
import VerificationActions from "./VerificationActions";

export default async function AdminVerificationsPage() {
  // CORRECTED: Query VendorProfile where status is PENDING
  const pendingVendors = await prisma.vendorProfile.findMany({
    where: { 
      status: "PENDING" 
    },
    orderBy: { 
      createdAt: "desc" 
    }
  });

  return (
    <div className="p-4 md:p-8 space-y-8 bg-[#FBFBFB] min-h-screen">
      <div>
        <h1 className="text-3xl font-black text-accent-navy uppercase italic tracking-tighter leading-none">
          Compliance Queue<span className="text-brand-primary">.</span>
        </h1>
        <p className="text-[10px] font-black text-neutral-gray uppercase tracking-widest mt-2">
          {pendingVendors.length} Profiles Awaiting Activation
        </p>
      </div>

      <div className="grid gap-4">
        {pendingVendors.length > 0 ? (
          pendingVendors.map((vendor) => (
            <div 
              key={vendor.id} 
              className="bg-white border border-gray-100 rounded-[2.5rem] p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm"
            >
              <div className="flex items-center gap-6 flex-1">
                <div className="w-16 h-16 bg-accent-navy/5 rounded-3xl flex items-center justify-center text-accent-navy shrink-0">
                  <UserCircle size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-accent-navy uppercase italic leading-none mb-2 tracking-tight">
                    {vendor.storeName}
                  </h3>
                  <div className="flex flex-wrap gap-3 items-center">
                    <span className="bg-brand-primary/10 text-accent-navy px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {vendor.firstName} {vendor.lastName}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-gray uppercase italic">
                      Joined {format(new Date(vendor.createdAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-gray font-medium mt-2">
                    Address: {vendor.storeAddress}, {vendor.state}
                  </p>
                </div>
              </div>

              {/* Pass the vendor.id correctly to the actions component */}
              <VerificationActions vendorProfileId={vendor.id} />
            </div>
          ))
        ) : (
          <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
             <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-green-500" />
             </div>
             <p className="text-[10px] font-black text-neutral-gray uppercase tracking-[0.3em] italic">Queue Clear: All Vendors Processed</p>
          </div>
        )}
      </div>
    </div>
  );
}