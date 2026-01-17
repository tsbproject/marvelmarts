import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  FileText, 
  Lock, 
  StickyNote, 
  Save 
} from "lucide-react";
import StatusToggleButton from "./StatusToggleButton"; 
import { updateTicketNotes } from "@/app/_components/actions"; 

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({
    where: { id },
  });

  if (!ticket) notFound();

  // If the ticket is linked to an article, fetch the article title
  const article = ticket.articleId 
    ? await prisma.helpArticle.findUnique({ where: { id: ticket.articleId } }) 
    : null;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link 
        href="/dashboard/admins/support/tickets" 
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 mb-8 transition-colors uppercase tracking-widest"
      >
        <ArrowLeft size={16} /> Back to Tickets
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Message Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-4xl p-8 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-3xl font-black text-gray-900 leading-tight">
                {ticket.subject}
              </h1>
              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                ticket.status === 'OPEN' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
              }`}>
                {ticket.status}
              </span>
            </div>

            <div className="prose prose-blue max-w-none text-gray-700 bg-gray-50 p-6 rounded-2xl border border-gray-100 italic">
              "{ticket.message}"
            </div>
          </div>
          
          {/* Quick Tip for Admins */}
          <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-start gap-3">
             <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
               <StickyNote size={18} />
             </div>
             <div>
               <p className="text-sm font-bold text-blue-900">Admin Response Policy</p>
               <p className="text-xs text-blue-700 font-medium">Please verify customer details before resolving. Internal notes are private and only visible to the dashboard team.</p>
             </div>
          </div>
        </div>

        {/* Sidebar Info & Actions */}
        <aside className="space-y-6">
          {/* Status Action Card */}
          <div className="bg-gray-900 text-white p-8 rounded-4xl shadow-xl">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Actions</h3>
            <StatusToggleButton ticketId={ticket.id} currentStatus={ticket.status} />
          </div>

          {/* Internal Notes Card (Private) */}
          <div className="bg-yellow-50 border border-yellow-100 p-8 rounded-4xl space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-yellow-700">
              <Lock size={16} />
              <h3 className="text-[10px] font-black uppercase tracking-widest">Internal Notes</h3>
            </div>
            
            <form action={async (formData) => {
              "use server";
              const notes = formData.get("notes") as string;
              await updateTicketNotes(ticket.id, notes);
            }} className="space-y-3">
              <textarea 
                name="notes"
                defaultValue={ticket.notes || ""}
                placeholder="Add private details or team notes..."
                className="w-full bg-white border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-yellow-400 outline-none min-h-[140px] shadow-inner font-medium text-gray-700"
              />
              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-yellow-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-yellow-700 transition-all shadow-md shadow-yellow-600/20 active:scale-95"
              >
                <Save size={14} /> Update Notes
              </button>
            </form>
            <p className="text-[9px] text-yellow-600/60 text-center font-bold italic">
              * Customers never see these notes.
            </p>
          </div>

          {/* Customer Metadata */}
          <div className="bg-white border border-gray-100 p-8 rounded-4xl space-y-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Customer Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User size={16} /></div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Requester</p>
                  <p className="text-sm font-bold text-gray-900">{ticket.userEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={16} /></div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Submitted</p>
                  <p className="text-sm font-bold text-gray-900">{new Date(ticket.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {article && (
                <div className="mt-6 pt-6 border-t border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg"><FileText size={16} /></div>
                    <div>
                      <p className="text-[10px] font-black text-red-400 uppercase leading-none mb-1">Context Article</p>
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