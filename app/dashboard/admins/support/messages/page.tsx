// export const dynamic = "force-dynamic";

// import { prisma } from "@/app/lib/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import { redirect } from "next/navigation";
// import ChatList from "./_components/ChatLists";
// import AdminChatThread from "./_components/AdminChatThred";
// import VendorIdentityCard from "./_components/VendorIdentityCard";
// import { ShieldCheck, Users, AlertCircle, Info } from "lucide-react";
// import { UserRole, ConversationType } from "@prisma/client";
// import Link from "next/link";

// interface Participant {
//   id: string;
//   name: string | null;
//   role: string | null;
// }

// interface ChatMessagePreview {
//   content: string | null;
//   createdAt?: string | Date;
//   senderName?: string | null;
// }

// interface ConversationItem {
//   id: string;
//   type: string;
//   status?: "OPEN" | "CLOSED";
//   updatedAt?: string | Date; 
//   participants?: Participant[];
//   messages?: ChatMessagePreview[];
// }

// export default async function AdminLiveSupportPage({
//   searchParams,
// }: {
//   searchParams: Promise<{ type?: string; id?: string }>;
// }) {
//   const session = await getServerSession(authOptions);

//   const isAuthorizedRole =
//     session?.user?.role === UserRole.SUPER_ADMIN ||
//     session?.user?.role === UserRole.ADMIN;

//   const canManageMessages = session?.user?.permissions?.manageMessages === true;

//   if (!isAuthorizedRole && !canManageMessages) {
//     redirect("/");
//   }

//   const params = await searchParams;
//   const activeType = (params.type as ConversationType) || "VENDOR_ADMIN";
//   const selectedConversationId = params.id;

//   const conversations = await prisma.conversation.findMany({
//       where: {
//         type: activeType,
//         NOT: {
//           deletedByParticipantIds: {
//             has: session.user.id,
//           },
//         },
//       },
//       include: {
//         participants: {
//           select: {
//             id: true,
//             name: true,
//             role: true,
//             vendorProfile: {
//               select: { id: true },
//             },
//           },
//         },
//         messages: {
//           orderBy: { createdAt: "desc" },
//           take: 1,
//         },
//       },
//       orderBy: { updatedAt: "desc" },
//     });

//   const activeConversation =
//   conversations.find((c) => c.id === selectedConversationId) || null;

// const safeSelectedConversationId = activeConversation?.id ?? null;

//   const targetVendor =
//     activeConversation?.participants?.find((p) => p.role === "VENDOR") || null;

//   const targetVendorProfileId = targetVendor?.vendorProfile?.id || null;

//       const serializedConversations = conversations.map((conversation) => ({
//         id: conversation.id,
//         type: String(conversation.type),
//         status: conversation.status,
//         updatedAt:
//           conversation.updatedAt instanceof Date
//             ? conversation.updatedAt.toISOString()
//             : conversation.updatedAt,
//         participants: (conversation.participants || []).map((participant) => ({
//           id: participant.id,
//           name: participant.name ?? null,
//           role: String(participant.role),
//           vendorProfile: participant.vendorProfile
//             ? { id: participant.vendorProfile.id }
//             : null,
//         })),
//         messages: (conversation.messages || []).map((message) => ({
//           id: message.id,
//           content: message.content ?? null,
//           createdAt:
//             message.createdAt instanceof Date
//               ? message.createdAt.toISOString()
//               : message.createdAt,
//           senderName: message.senderName ?? null,
//         })),
//       }));

//   return (
//     <div className="max-w-[1600px] mx-auto p-6">
//       <div className="mb-8 flex justify-between items-end">
//         <div>
//           <h1 className="text-3xl font-black text-[#002B5B] uppercase tracking-tighter leading-none">
//             Support Command Center
//           </h1>
//           <p className="text-gray-500 font-medium mt-2">
//             Secure marketplace intervention and dispute management.
//           </p>
//         </div>

//         <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 animate-pulse">
//           Live Connection Active
//         </div>
//       </div>

//       <div className="flex flex-wrap gap-4 mb-8">
//         <FilterButton
//           label="Vendor Support"
//           type="VENDOR_ADMIN"
//           active={activeType === "VENDOR_ADMIN"}
//           icon={<ShieldCheck size={18} />}
//         />
//         <FilterButton
//           label="Customer Disputes"
//           type="CUSTOMER_ADMIN"
//           active={activeType === "CUSTOMER_ADMIN"}
//           icon={<AlertCircle size={18} />}
//         />
//         <FilterButton
//           label="General Inquiries"
//           type="CUSTOMER_VENDOR"
//           active={activeType === "CUSTOMER_VENDOR"}
//           icon={<Users size={18} />}
//         />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-300px)] min-h-[600px]">
//         <div className="lg:col-span-3 overflow-y-auto pr-2 no-scrollbar border-r border-gray-50">
//           <ChatList conversations={serializedConversations} />
//         </div>

//         <div
//           className={`${
//             selectedConversationId && targetVendorProfileId
//               ? "lg:col-span-6"
//               : "lg:col-span-9"
//           } bg-white rounded-[2.5rem] border border-gray-100 flex flex-col overflow-hidden shadow-sm relative transition-all duration-500`}
//         >
//           {selectedConversationId ? (
//             <AdminChatThread conversationId={selectedConversationId} />
//           ) : (
//             <div className="flex-1 flex items-center justify-center text-center p-12 bg-neutral-50/30">
//               <div className="max-w-sm">
//                 <div className="w-20 h-20 bg-white shadow-xl rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-50">
//                   <ShieldCheck size={40} className="text-[#F7931E]" />
//                 </div>
//                 <h3 className="text-xl font-black text-[#002B5B] uppercase tracking-tight">
//                   System Ready
//                 </h3>
//                 <p className="text-sm text-gray-500 font-medium mt-3 leading-relaxed">
//                   Select a secure transmission from the left to view thread history
//                   or initialize a support intervention.
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>

//         {selectedConversationId && targetVendorProfileId && (
//           <div className="lg:col-span-3 space-y-4 animate-in fade-in slide-in-from-right-10 duration-700 overflow-y-auto no-scrollbar">
//             <div className="flex items-center gap-2 px-6 mb-2">
//               <Info size={14} className="text-[#002B5B]" />
//               <h3 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">
//                 Source Intelligence
//               </h3>
//             </div>

//             <VendorIdentityCard vendorProfileId={targetVendorProfileId} />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function FilterButton({
//   label,
//   type,
//   active,
//   icon,
// }: {
//   label: string;
//   type: string;
//   active: boolean;
//   icon: React.ReactNode;
// }) {
//   return (
//     <Link
//       href={`/dashboard/admins/support/messages?type=${type}`}
//       className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all
//         ${
//           active
//             ? "bg-[#002B5B] text-white shadow-xl scale-105 border-[#002B5B]"
//             : "bg-white text-[#002B5B] border border-gray-100 hover:border-[#F7931E] hover:shadow-md"
//         }`}
//     >
//       {icon} {label}
//     </Link>
//   );
// }



export const dynamic = "force-dynamic";

import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import ChatList from "./_components/ChatLists";
import AdminChatThread from "./_components/AdminChatThred";
import VendorIdentityCard from "./_components/VendorIdentityCard";
import { ShieldCheck, Users, AlertCircle, Info } from "lucide-react";
import { UserRole, ConversationType } from "@prisma/client";
import Link from "next/link";

interface Participant {
  id: string;
  name: string | null;
  role: string | null;
  vendorProfile?: {
    id: string;
  } | null;
}

interface ChatMessagePreview {
  content: string | null;
  createdAt?: string | Date;
  senderName?: string | null;
}

interface ConversationItem {
  id: string;
  type: string;
  status?: "OPEN" | "CLOSED";
  updatedAt?: string | Date;
  participants?: Participant[];
  messages?: ChatMessagePreview[];
}

export default async function AdminLiveSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; id?: string }>;
}) {
  const session = await getServerSession(authOptions);

  const isAuthorizedRole =
    session?.user?.role === UserRole.SUPER_ADMIN ||
    session?.user?.role === UserRole.ADMIN;

  const canManageMessages = session?.user?.permissions?.manageMessages === true;

  if (!isAuthorizedRole && !canManageMessages) {
    redirect("/");
  }

  const params = await searchParams;
  const activeType = (params.type as ConversationType) || "VENDOR_ADMIN";
  const selectedConversationId = params.id;
  const currentUserId = session?.user?.id;

  const conversations = await prisma.conversation.findMany({
    where: {
      type: activeType,
      ...(currentUserId
        ? {
            NOT: {
              deletedByParticipantIds: {
                has: currentUserId,
              },
            },
          }
        : {}),
    },
    include: {
      participants: {
        select: {
          id: true,
          name: true,
          role: true,
          vendorProfile: {
            select: { id: true },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const activeConversation =
    conversations.find((c) => c.id === selectedConversationId) || null;

  const safeSelectedConversationId = activeConversation?.id ?? null;

  const targetVendor =
    activeConversation?.participants?.find((p) => p.role === "VENDOR") || null;

  const targetVendorProfileId = targetVendor?.vendorProfile?.id || null;

  const serializedConversations = conversations.map((conversation) => ({
    id: conversation.id,
    type: String(conversation.type),
    status: conversation.status,
    updatedAt:
      conversation.updatedAt instanceof Date
        ? conversation.updatedAt.toISOString()
        : conversation.updatedAt,
    participants: (conversation.participants || []).map((participant) => ({
      id: participant.id,
      name: participant.name ?? null,
      role: String(participant.role),
      vendorProfile: participant.vendorProfile
        ? { id: participant.vendorProfile.id }
        : null,
    })),
    messages: (conversation.messages || []).map((message) => ({
      id: message.id,
      content: message.content ?? null,
      createdAt:
        message.createdAt instanceof Date
          ? message.createdAt.toISOString()
          : message.createdAt,
      senderName: message.senderName ?? null,
    })),
  }));

  return (
    <div className="max-w-[1600px] mx-auto p-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-300px)] min-h-[600px]">
        <div className="lg:col-span-3 overflow-y-auto pr-2 no-scrollbar border-r border-gray-50">
          <ChatList conversations={serializedConversations} />
        </div>

        <div
          className={`${
            safeSelectedConversationId && targetVendorProfileId
              ? "lg:col-span-6"
              : "lg:col-span-9"
          } bg-white rounded-[2.5rem] border border-gray-100 flex flex-col overflow-hidden shadow-sm relative transition-all duration-500`}
        >
          {safeSelectedConversationId ? (
            <AdminChatThread conversationId={safeSelectedConversationId} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-12 bg-neutral-50/30">
              <div className="max-w-sm">
                <div className="w-20 h-20 bg-white shadow-xl rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-50">
                  <ShieldCheck size={40} className="text-[#F7931E]" />
                </div>
                <h3 className="text-xl font-black text-[#002B5B] uppercase tracking-tight">
                  System Ready
                </h3>
                <p className="text-sm text-gray-500 font-medium mt-3 leading-relaxed">
                  Select a secure transmission from the left to view thread history
                  or initialize a support intervention.
                </p>
              </div>
            </div>
          )}
        </div>

        {safeSelectedConversationId && targetVendorProfileId && (
          <div className="lg:col-span-3 space-y-4 animate-in fade-in slide-in-from-right-10 duration-700 overflow-y-auto no-scrollbar">
            <div className="flex items-center gap-2 px-6 mb-2">
              <Info size={14} className="text-[#002B5B]" />
              <h3 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">
                Source Intelligence
              </h3>
            </div>

            <VendorIdentityCard vendorProfileId={targetVendorProfileId} />
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({
  label,
  type,
  active,
  icon,
}: {
  label: string;
  type: string;
  active: boolean;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={`/dashboard/admins/support/messages?type=${type}`}
      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all
        ${
          active
            ? "bg-[#002B5B] text-white shadow-xl scale-105 border-[#002B5B]"
            : "bg-white text-[#002B5B] border border-gray-100 hover:border-[#F7931E] hover:shadow-md"
        }`}
    >
      {icon} {label}
    </Link>
  );
}