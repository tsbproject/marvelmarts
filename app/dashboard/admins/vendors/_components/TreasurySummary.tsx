



"use client";

import React, { Component } from "react";
import { connect } from "react-redux";
import { RootState } from "@/store";
import { Payout } from "@/store/vendorSlice"; 
import { Calendar, TrendingUp, PieChart } from "lucide-react";
import { formatNaira } from "@/app/lib/FormatNaira";

interface StatsProps {
  payouts: Payout[];
}

class TreasurySummary extends Component<StatsProps> {
  calculateTotals = () => {
    const now = new Date();
    // Only calculate stats for APPROVED payouts
    const approvedPayouts = this.props.payouts.filter(p => p.status === "APPROVED");

    const totals = {
      weekly: 0,
      monthly: 0,
      yearly: 0
    };

    approvedPayouts.forEach(p => {
      const date = new Date(p.createdAt);
      const amount = p.amount;

      // Yearly
      if (date.getFullYear() === now.getFullYear()) {
        totals.yearly += amount;

        // Monthly
        if (date.getMonth() === now.getMonth()) {
          totals.monthly += amount;
        }

        // Weekly (Last 7 days)
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
          totals.weekly += amount;
        }
      }
    });

    return totals;
  };

  render() {
    const { weekly, monthly, yearly } = this.calculateTotals();

    const stats = [
      { label: "Weekly Disbursements", value: weekly, icon: <TrendingUp size={20} />, color: "text-blue-600", bg: "bg-blue-50" },
      { label: "Monthly Outflow", value: monthly, icon: <Calendar size={20} />, color: "text-green-600", bg: "bg-green-50" },
      { label: "Annual Treasury Total", value: yearly, icon: <PieChart size={20} />, color: "text-red-600", bg: "bg-red-50" },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
            <div className={`h-12 w-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <h2 className="text-2xl font-black text-[#002B5B] tracking-tighter">
                {formatNaira(stat.value)}
              </h2>
            </div>
          </div>
        ))}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  // Ensure we are pulling the full list of payouts to calculate historical stats
  payouts: state.vendor.payouts || [],
});

export default connect(mapStateToProps)(TreasurySummary);