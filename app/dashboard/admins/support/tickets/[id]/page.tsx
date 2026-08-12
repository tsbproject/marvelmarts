import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  FileText, 
  Lock, 
  StickyNote, 
  Save,
  MessageSquare,
} from "lucide-react";
import StatusToggleButton from "./StatusToggleButton"; 
import { updateTicketNotes } from "@/app/_components/actions"; 
import AdminTicketReplyForm from "@/app/_components/support/AdminTicketReplyForm";

import { HelpCenterService } from "@/app/lib/services/help-center.service";

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
   
      const ticket =
  await HelpCenterService.getTicketById(id);

  if (!ticket) notFound();

  // If the ticket is linked to an article, fetch the article title
  const article =
  ticket.articleId
    ? await HelpCenterService.getTicketArticle(
        ticket.articleId
      )
    : null;

return (
  <div className="min-h-screen bg-[#FAFAFA] p-6 lg:p-10">

    {/* BACK */}
    <Link
      href="/dashboard/admins/support/tickets"
      className="
        inline-flex items-center gap-2
        text-[10px] font-black uppercase tracking-[0.25em]
        text-gray-400 hover:text-gray-900
        mb-8 transition-colors
      "
    >
      <ArrowLeft size={15} />
      Back To Tickets
    </Link>

    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">

      {/* MAIN CONTENT */}
      <div className="space-y-8">

        {/* HERO */}
        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden">

          {/* TOP */}
          <div className="p-8 border-b border-gray-100">

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

              <div className="flex-1">

                <div className="flex flex-wrap items-center gap-3 mb-5">

                  <span
                    className={`
                      px-4 py-1 rounded-full
                      text-[10px] font-black uppercase tracking-widest
                      ${
                        ticket.status === "OPEN"
                          ? "bg-orange-100 text-orange-700"
                          : ticket.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-700"
                          : ticket.status === "RESOLVED"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }
                    `}
                  >
                    {ticket.status.replace(
                      "_",
                      " "
                    )}
                  </span>

                  {ticket.priority && (
                    <span className="px-4 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest">
                      {ticket.priority} Priority
                    </span>
                  )}

                  {ticket.category && (
                    <span className="px-4 py-1 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                      {ticket.category}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                  {ticket.subject}
                </h1>

                <div className="flex flex-wrap items-center gap-5 mt-5 text-xs font-bold text-gray-400">

                  <span className="flex items-center gap-2">
                    <User size={14} />
                    {ticket.userEmail}
                  </span>

                  <span className="flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(
                      ticket.createdAt
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <MessageSquare size={28} />
              </div>
            </div>
          </div>

          {/* ORIGINAL MESSAGE */}
          <div className="p-8 bg-gray-50/70">

            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">

              <div className="flex items-center gap-2 mb-5">

                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <User size={18} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Customer Message
                  </p>

                  <p className="text-sm font-bold text-gray-900">
                    {ticket.userEmail}
                  </p>
                </div>
              </div>

              <div className="text-[15px] leading-8 text-gray-700 font-medium whitespace-pre-wrap">
                {ticket.message}
              </div>
            </div>
          </div>
        </div>

        {/* CONVERSATION */}
        {ticket.replies.length > 0 && (

          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">

            <div className="flex items-center justify-between mb-8">

              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  Conversation Timeline
                </h2>

                <p className="text-sm text-gray-500 font-medium mt-1">
                  Ticket communication history
                </p>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest">
                {ticket.replies.length} Replies
              </div>
            </div>

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
                        {new Date(
                          reply.createdAt
                        ).toLocaleString()}
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

        {/* ADMIN RESPONSE */}
        <AdminTicketReplyForm
          ticketId={ticket.id}
        />

        {/* QUICK TIP */}
        <div className="p-6 bg-blue-50 border border-blue-100 rounded-[2rem] flex items-start gap-4">

          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <StickyNote size={20} />
          </div>

          <div>
            <p className="text-sm font-black text-blue-900 uppercase tracking-wide mb-1">
              Admin Response Policy
            </p>

            <p className="text-sm text-blue-700 font-medium leading-relaxed">
              Verify customer details carefully before resolving tickets.
              Internal notes remain private and are only visible to the dashboard support team.
            </p>
          </div>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside className="space-y-6 sticky top-8">

        {/* ACTIONS */}
        <div className="bg-gray-900 text-white p-8 rounded-[2rem] shadow-2xl">

          <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-6">
            Ticket Actions
          </h3>

          <StatusToggleButton
            ticketId={ticket.id}
            currentStatus={ticket.status}
          />
        </div>

        {/* INTERNAL NOTES */}
        <div className="bg-yellow-50 border border-yellow-100 p-8 rounded-[2rem] space-y-4 shadow-sm">

          <div className="flex items-center gap-2 text-yellow-700">

            <Lock size={16} />

            <h3 className="text-[10px] font-black uppercase tracking-widest">
              Internal Notes
            </h3>
          </div>

          <form
            action={async (formData) => {
              "use server";

              const notes =
                formData.get(
                  "notes"
                ) as string;

              await updateTicketNotes(
                ticket.id,
                notes
              );
            }}
            className="space-y-4"
          >

            <textarea
              name="notes"
              defaultValue={
                ticket.notes || ""
              }
              placeholder="Add private support notes..."
              className="
                w-full min-h-[180px]
                rounded-[2rem]
                bg-white border border-yellow-100
                p-5 text-sm
                outline-none resize-none
                font-medium text-gray-700
              "
            />

            <button
              type="submit"
              className="
                w-full h-14 rounded-2xl
                bg-yellow-600 text-white
                font-black uppercase tracking-widest text-xs
                flex items-center justify-center gap-2
                hover:bg-yellow-700 transition-all
              "
            >
              <Save size={14} />
              Update Notes
            </button>
          </form>

          <p className="text-[10px] text-yellow-700/60 text-center font-bold italic">
            Customers never see these notes.
          </p>
        </div>

        {/* CUSTOMER INFO */}
        <div className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm space-y-6">

          <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
            Customer Details
          </h3>

          <div className="space-y-5">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <User size={18} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                  Requester
                </p>

                <p className="text-sm font-bold text-gray-900">
                  {ticket.userEmail}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar size={18} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                  Submitted
                </p>

                <p className="text-sm font-bold text-gray-900">
                  {new Date(
                    ticket.createdAt
                  ).toLocaleString()}
                </p>
              </div>
            </div>

            {article && (

              <div className="pt-6 border-t border-gray-100">

                <div className="flex items-center gap-4">

                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                    <FileText size={18} />
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">
                      Context Article
                    </p>

                    <Link
                      href={`/support/articles/${article.slug}`}
                      target="_blank"
                      className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors underline decoration-red-100"
                    >
                      {article.title}
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  </div>
);
}