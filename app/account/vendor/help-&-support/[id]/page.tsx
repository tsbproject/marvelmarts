import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  MessageSquare,
  Calendar,
  User,
} from "lucide-react";
import { HelpCenterService } from "@/app/lib/services/help-center.service";

export default async function VendorTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const session =
    await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/signin");
  }

  const { id } = await params;

  const ticket =
  await HelpCenterService.getUserTicket(
    id,
    session.user.email
  );

  if (!ticket) {
    redirect(
      "/account/vendor/help-&-support"
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 lg:p-10">

      <Link
        href="/account/vendor/help-&-support"
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-accent-navy mb-8"
      >
        <ArrowLeft size={14} />
        Back To Support
      </Link>

      <div className="space-y-8 max-w-5xl mx-auto">

        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden">

          <div className="p-8 border-b border-gray-100">

            <div className="flex flex-wrap items-center gap-3 mb-5">

              <span className="px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] uppercase tracking-widest font-black">
                #{ticket.id.slice(-8).toUpperCase()}
              </span>

              <span className="px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-[10px] uppercase tracking-widest font-black">
                {ticket.status.replace("_", " ")}
              </span>
            </div>

            <h1 className="text-3xl font-black italic text-accent-navy tracking-tight">
              {ticket.subject}
            </h1>

            <div className="flex flex-wrap items-center gap-5 mt-5 text-xs font-bold text-gray-400">

              <span className="flex items-center gap-2">
                <User size={14} />
                {ticket.userEmail}
              </span>

              <span className="flex items-center gap-2">
                <Calendar size={14} />
                {new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="p-8 bg-gray-50/70">

            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">

              <div className="flex items-center gap-2 mb-5">

                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <MessageSquare size={18} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Original Ticket
                  </p>

                  <p className="text-sm font-bold text-gray-900">
                    Submitted Request
                  </p>
                </div>
              </div>

              <div className="text-[15px] leading-8 text-gray-700 font-medium whitespace-pre-wrap">
                {ticket.message}
              </div>
            </div>
          </div>
        </div>

        {ticket.replies.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">

            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8">
              Support Conversation
            </h2>

            <div className="space-y-6">

              {ticket.replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`
                    flex
                    ${
                      reply.senderType === "ADMIN"
                        ? "justify-end"
                        : "justify-start"
                    }
                  `}
                >

                  <div
                    className={`
                      max-w-[85%] rounded-[2rem] p-6
                      ${
                        reply.senderType === "ADMIN"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }
                    `}
                  >

                    <div className="flex items-center justify-between gap-6 mb-4">

                      <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                        {reply.senderType}
                      </span>

                      <span className="text-[10px] font-bold opacity-60">
                        {new Date(reply.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-sm leading-7 font-medium whitespace-pre-wrap">
                      {reply.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}