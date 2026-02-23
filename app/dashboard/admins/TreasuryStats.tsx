"use client";

import React, { Component } from "react";
import { connect } from "react-redux";
import { RootState } from "@/store";
import { Payout } from "@/store/vendorSlice";
import { Clock, CheckCircle, Wallet } from "lucide-react";
import { formatNaira } from "@/app/lib/FormatNaira";

interface TreasuryStatsProps {
  payouts: Payout[];
}

class TreasuryStats extends Component<TreasuryStatsProps> {
  calculateMetrics = () => {
    const data = this.props.payouts || [];
    
    return {
      approvedTotal: data
        .filter(p => p.status === "APPROVED")
        .reduce((sum, p) => sum + p.amount, 0),
      pendingTotal: data
        .filter(p => p.status === "PENDING")
        .reduce((sum, p) => sum + p.amount, 0),
      totalRequests: data.length
    };
  };

  render() {
    const { approvedTotal, pendingTotal, totalRequests } = this.calculateMetrics();

    const metrics = [
      {
        label: "Total Paid Out",
        value: approvedTotal,
        icon: <CheckCircle size={20} />,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        desc: "Lifetime disbursements"
      },
      {
        label: "Pending Approval",
        value: pendingTotal,
        icon: <Clock size={20} />,
        color: "text-amber-600",
        bg: "bg-amber-50",
        desc: "Awaiting admin action"
      }
    ];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm transition-hover hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{m.label}</p>
                <h2 className={`text-3xl font-black ${m.color} tracking-tighter`}>
                  {formatNaira(m.value)}
                </h2>
                <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase italic">{m.desc}</p>
              </div>
              <div className={`h-14 w-14 ${m.bg} ${m.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                {m.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  payouts: state.vendor.payouts || [],
});

export default connect(mapStateToProps)(TreasuryStats);