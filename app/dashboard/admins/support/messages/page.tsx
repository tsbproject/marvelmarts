export const dynamic = "force-dynamic";

import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth"; 
import { redirect } from "next/navigation";
import ChatList from "./_components/ChatLists"; 
import AdminChatThread from "./_components/AdminChatThred"; 
import { ShieldCheck, Users, AlertCircle } from "lucide-react";
import { UserRole, ConversationType } from "@prisma/client";
import Link from "next/link";

export default async function AdminLiveSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; id?: string }>;
}) {
  const session = await getServerSession(authOptions);

  // 1. Strict Authorization
  const isAuthorizedRole = 
    session?.user?.role === UserRole.SUPER_ADMIN || 
    session?.user?.role === UserRole.ADMIN;

  const canManageMessages = session?.user?.permissions?.manageMessages === true;

  if (!isAuthorizedRole && !canManageMessages) {
    redirect("/");
  }

  // 2. Extract Params
  const params = await searchParams;
  const activeType = (params.type as ConversationType) || "VENDOR_ADMIN";
  const selectedConversationId = params.id;

  // 3. Fetch Sidebar Conversations
  const conversations = await prisma.conversation.findMany({
    where: {
      type: activeType,
    },
    include: {
      participants: {
        select: { id: true, name: true, role: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#002B5B] uppercase tracking-tighter leading-none">
            Support Command Center
          </h1>
          <p className="text-gray-500 font-medium mt-2">
            Secure marketplace intervention and dispute management.
          </p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 animate-pulse">
          Live Connection Active
        </div>
      </div>

      {/* Admin Quick Filters - Updated to point to /live */}
      <div className="flex flex-wrap gap-4 mb-8">
        <FilterButton 
          label="Vendor Support" 
          type="VENDOR_ADMIN" 
          active={activeType === "VENDOR_ADMIN"} 
          icon={<ShieldCheck size={18} />} 
        />
        <FilterButton 
          label="Customer Disputes" 
          type="CUSTOMER_ADMIN" 
          active={activeType === "CUSTOMER_ADMIN"} 
          icon={<AlertCircle size={18} />} 
        />
        <FilterButton 
          label="General Inquiries" 
          type="CUSTOMER_VENDOR" 
          active={activeType === "CUSTOMER_VENDOR"} 
          icon={<Users size={18} />} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-[calc(100vh-300px)] min-h-[600px]">
        {/* Chat List Sidebar */}
        <div className="md:col-span-4 overflow-y-auto pr-2 no-scrollbar border-r border-gray-50">
          <ChatList conversations={conversations} />
        </div>
        
        {/* Chat Window / Thread */}
        <div className="md:col-span-8 bg-white rounded-[2.5rem] border border-gray-100 flex flex-col overflow-hidden shadow-sm relative">
          {selectedConversationId ? (
            <AdminChatThread conversationId={selectedConversationId} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-12 bg-neutral-50/30">
               <div className="max-w-sm">
                  <div className="w-20 h-20 bg-white shadow-xl rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-50">
                    <ShieldCheck size={40} className="text-[#F7931E]" />
                  </div>
                  <h3 className="text-xl font-black text-[#002B5B] uppercase tracking-tight">System Ready</h3>
                  <p className="text-sm text-gray-500 font-medium mt-3 leading-relaxed">
                    Select a secure transmission from the left to view thread history or initialize a support intervention.
                  </p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component for Filters - Updated href with /live
function FilterButton({ label, type, active, icon }: { label: string, type: string, active: boolean, icon: React.ReactNode }) {
  return (
    <Link 
      // This fix ensures that clicking a filter stays within the Live Chat view
      href={`/dashboard/admins/support/messages?type=${type}`}
      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all
        ${active 
          ? "bg-[#002B5B] text-white shadow-xl scale-105 border-[#002B5B]" 
          : "bg-white text-[#002B5B] border border-gray-100 hover:border-[#F7931E] hover:shadow-md"
        }`}
    >
      {icon} {label}
    </Link>
  );
}