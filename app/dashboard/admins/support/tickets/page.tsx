import Link from "next/link";
import { MessageSquare, Clock, User, ArrowRight, AlertCircle } from "lucide-react";

import { HelpCenterService } from "@/app/lib/services/help-center.service";


export default async function AdminTicketsPage() {
  const tickets =
  await HelpCenterService.getTickets();

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Support Tickets</h1>
        <p className="text-gray-500 font-medium">Respond to user inquiries and article feedback.</p>
      </div>

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <div 
            key={ticket.id} 
            className="bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-shadow group flex items-center justify-between"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${ticket.status === 'OPEN' ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
                <MessageSquare size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${ticket.status === 'OPEN' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                    {ticket.status}
                  </span>
                  <h3 className="font-bold text-gray-900">{ticket.subject}</h3>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1 mb-2">{ticket.message}</p>
                
                <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                  <span className="flex items-center gap-1"><User size={14} /> {ticket.userEmail}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                  {ticket.articleId && (
                    <span className="flex items-center gap-1 text-blue-500 font-bold uppercase text-[10px]">
                      <AlertCircle size={12} /> Article Ref
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Link 
              href={`/dashboard/admins/support/tickets/${ticket.id}`}
              className="p-4 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all"
            >
              <ArrowRight size={20} />
            </Link>
          </div>
        ))}

        {tickets.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-4xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold uppercase text-sm tracking-widest">No tickets yet. All quiet!</p>
          </div>
        )}
      </div>
    </div>
  );
}