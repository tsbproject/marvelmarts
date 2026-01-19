import prisma from "@/app/lib/prisma";
import { Mail, Calendar, Trash2 } from "lucide-react";

export default async function SubscribersPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 bg-[#F8F8F8] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-black italic text-[#002B5B] uppercase tracking-tighter">
              Inner <span className="text-[#F7931E]">Circle</span>
            </h1>
            <p className="text-[#4B4B4B] font-bold">Manage your {subscribers.length} newsletter subscribers</p>
          </div>
          <button className="bg-[#002B5B] text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#F7931E] transition-all">
            Export CSV
          </button>
        </div>

        <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl border-4 border-[#002B5B]/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#002B5B] text-white uppercase text-xs tracking-[0.2em]">
                <th className="p-6">Subscriber Email</th>
                <th className="p-6">Joined Date</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#FFE8CC]/30 transition-colors group">
                  <td className="p-6 flex items-center gap-3">
                    <div className="bg-[#FFE8CC] p-2 rounded-lg text-[#F7931E]">
                      <Mail size={18} />
                    </div>
                    <span className="font-bold text-[#1E1E1E] text-lg">{sub.email}</span>
                  </td>
                  <td className="p-6 text-[#4B4B4B] font-medium">
                    {new Date(sub.createdAt).toLocaleDateString('en-NG', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </td>
                  <td className="p-6 text-right">
                    <button className="text-gray-300 hover:text-red-600 transition-colors p-2">
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}