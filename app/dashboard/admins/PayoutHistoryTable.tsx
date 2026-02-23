"use client";

import React, { Component } from "react";
import { connect } from "react-redux";
import { useNotification } from "@/app/_context/NotificationContext";
import { History, CheckCircle2, XCircle, User, ArrowRight } from "lucide-react";
import { RootState } from "@/store";

interface HistoryItem {
  id: string;
  vendorName: string;
  amount: number;
  status: "APPROVED" | "REJECTED";
  date: string;
}

interface HistoryProps {
  history: HistoryItem[];
  loading: boolean;
  notifySuccess: (msg: string) => void;
  notifyError: (msg: string) => void;   
}

class PayoutHistoryClass extends Component<HistoryProps> {
  render() {
    const { history, loading } = this.props;

    return (
      <div className="bg-white rounded-4xl border border-gray-100 overflow-hidden shadow-sm mt-8">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <div>
            <h2 className="text-xl font-black text-[#002B5B] uppercase tracking-tighter italic">Transaction Archive</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Audit log of processed payouts</p>
          </div>
          <History className="text-[#002B5B]/20" size={32} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="p-5 text-[10px] font-black text-[#002B5B] uppercase tracking-widest border-b border-gray-100 px-8">Vendor</th>
                <th className="p-5 text-[10px] font-black text-[#002B5B] uppercase tracking-widest border-b border-gray-100">Amount</th>
                <th className="p-5 text-[10px] font-black text-[#002B5B] uppercase tracking-widest border-b border-gray-100">Status</th>
                <th className="p-5 text-[10px] font-black text-[#002B5B] uppercase tracking-widest border-b border-gray-100 text-right px-8">Processed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/20 transition-all group">
                  <td className="p-5 px-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#002B5B] group-hover:text-white transition-all">
                        <User size={14} />
                      </div>
                      <span className="font-black text-xs text-[#002B5B] uppercase tracking-tight">{item.vendorName}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="font-black text-sm text-[#002B5B] tracking-tighter">₦{item.amount.toLocaleString()}</span>
                  </td>
                  <td className="p-5">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      item.status === "APPROVED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {item.status === "APPROVED" ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                      {item.status}
                    </div>
                  </td>
                  <td className="p-5 text-right px-8 font-bold text-gray-400 text-[10px] uppercase tracking-widest">
                    {item.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  history: state.vendor.orders
    .filter(o => o.status === "APPROVED" || o.status === "REJECTED")
    .map(o => ({
      id: o.id,
      vendorName: o.customerName,
      amount: o.totalAmount,
      status: o.status as "APPROVED" | "REJECTED",
      date: o.createdAt
    })),
  loading: state.vendor.loading
});

const ConnectedHistory = connect(mapStateToProps)(PayoutHistoryClass);

export default function PayoutHistoryTable() {
  const { notifySuccess, notifyError } = useNotification();
  return <ConnectedHistory notifySuccess={notifySuccess} notifyError={notifyError} />;
}