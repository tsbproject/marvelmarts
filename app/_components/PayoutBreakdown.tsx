// components/vendor/PayoutBreakdown.tsx

import { formatNaira } from "../lib/FormatNaira";

interface PayoutBreakdownProps {
  total: number;
  commissionRate: number;
  tier: string;
}

const PayoutBreakdown = ({ total, commissionRate, tier }: PayoutBreakdownProps) => {
  const fee = total * commissionRate;
  const net = total - fee;

  return (
    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
      <div className="flex justify-between mb-2">
        <span className="text-[10px] font-black uppercase text-gray-400">Gross Sales</span>
        <span className="font-bold text-accent-navy">{formatNaira(total)}</span>
      </div>
      
      <div className="flex justify-between mb-4 pb-4 border-bottom border-dashed border-gray-200">
        <span className="text-[10px] font-black uppercase text-gray-400">
          Platform Fee ({tier} Tier - {(commissionRate * 100).toFixed(0)}%)
        </span>
        <span className="font-bold text-red-500">-{formatNaira(fee)}</span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs font-black uppercase text-accent-navy">Net Payout</span>
        <span className="text-xl font-black text-brand-primary italic">
          {formatNaira(net)}
        </span>
      </div>
    </div>
  );
};