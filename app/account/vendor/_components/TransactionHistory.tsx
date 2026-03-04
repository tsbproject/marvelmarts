"use client";

import { useEffect, useState } from "react";
import { getTransactionHistory } from "@/app/_actions/boostActions";
import { History, ArrowDownLeft, Clock, CheckCircle2 } from "lucide-react";

export default function TransactionHistory({ vendorProfileId }: { vendorProfileId: string }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const res = await getTransactionHistory(vendorProfileId);
      if (res.success) setTransactions(res.transactions);
      setLoading(false);
    }
    fetchHistory();
  }, [vendorProfileId]);

  if (loading) return <div className="p-8 text-center text-xs font-bold animate-pulse text-gray-400">LOADING HISTORY...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <History size={18} className="text-[#F7931E]" />
        <h3 className="text-sm font-black uppercase tracking-widest text-[#002B5B]">Recent Top-ups</h3>
      </div>

      {transactions.length === 0 ? (
        <div className="bg-gray-50 rounded-3xl p-10 text-center border-2 border-dashed border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No transactions found yet</p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white rounded-3xl border border-gray-100 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Reference</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Credits</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-t border-gray-50 hover:bg-gray-50/30 transition-colors">
                  <td className="p-4 font-mono text-[10px] text-gray-500">{tx.reference}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#002B5B]">
                      <Clock size={12} className="text-gray-300" />
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-sm font-black text-green-600">
                      <ArrowDownLeft size={14} />
                      +{tx.amount}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[9px] font-black uppercase tracking-tighter">
                      <CheckCircle2 size={10} /> {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}