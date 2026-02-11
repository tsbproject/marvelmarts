import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect, notFound } from "next/navigation";
import DashboardHeader from "@/app/_components/DashboardHeader";
import { formatNaira } from "@/app/lib/FormatNaira";
import { 
  Package, User, MapPin, Phone, 
  Calendar, ArrowLeft 
} from "lucide-react";
import Link from "next/link";
import OrderActionWrapper from "./OrderActionWrapper"; 

export default async function VendorOrderDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "VENDOR") {
    redirect("/auth/sign-in");
  }

  // 1. Fetch Order with User Relations
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        }
      },
    }
  });

  // 2. Security & Profile Validation
  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!order || order.vendorProfileId !== vendorProfile?.id) {
    return notFound();
  }

  // Cast to any for safe access to dynamic schema fields to remove IDE red lines
  const dynamicOrder = order as any;

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBFB]">
      <DashboardHeader title="Order Details" showLogout={true} />

      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* BACK NAVIGATION */}
        <Link href="/account/vendor/orders" className="flex items-center gap-2 text-[10px] font-black uppercase text-neutral-gray hover:text-brand-primary transition-colors w-fit">
          <ArrowLeft size={14} /> Back to Orders
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: PRODUCT & SHIPPING */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[10px] font-black text-neutral-gray uppercase tracking-widest">Order Reference</p>
                  <h2 className="text-2xl font-black text-accent-navy uppercase">#{order.id.slice(-8).toUpperCase()}</h2>
                </div>
                <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase ${
                  order.status === 'pending' ? 'bg-orange-50 text-orange-600' : 
                  order.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  {order.status}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-gray-100 shrink-0">
                    <Package className="text-brand-primary" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-accent-navy uppercase italic">
                      {dynamicOrder.productTitle || "Product Name"}
                    </p>
                    <p className="text-[10px] font-bold text-neutral-gray uppercase">
                      Qty: {dynamicOrder.quantity || 1}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-accent-navy">{formatNaira(Number(order.total))}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SHIPPING DETAILS - RED POP STYLE */}
            <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary"></div>
              
              <h3 className="text-md font-black text-accent-navy uppercase mb-6 flex items-center gap-2">
                <MapPin size={18} className="text-brand-primary" /> Shipping Destination
              </h3>
              
              <div className="bg-brand-primary/5 border border-brand-primary/10 p-6 rounded-3xl">
                <p className="text-[10px] font-black text-brand-primary uppercase mb-2 tracking-widest">Customer Delivery Address</p>
                <div className="text-sm font-black text-accent-navy leading-relaxed uppercase italic">
                  {dynamicOrder.address || "No address provided"}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CUSTOMER & ACTION */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-black text-accent-navy uppercase mb-6 flex items-center gap-2">
                <User size={18} className="text-brand-primary" /> Customer info
              </h3>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-accent-navy flex items-center justify-center text-white font-black uppercase">
                  {order.user?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="text-sm font-black text-accent-navy uppercase">{order.user?.name}</p>
                  <p className="text-[10px] font-bold text-neutral-gray">{order.user?.email}</p>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-[10px] font-black text-neutral-gray uppercase">
                  <Phone size={12} /> {dynamicOrder.phone || "N/A"}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-neutral-gray uppercase">
                  <Calendar size={12} /> Ordered {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <OrderActionWrapper 
              orderId={order.id} 
              currentStatus={order.status} 
              trackingNumber={dynamicOrder.trackingNumber} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}