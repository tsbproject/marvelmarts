// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import { useSelector } from "react-redux";
// import { RootState } from "@/store";
// import { 
//   Users, 
//   ShoppingBasket, 
//   TrendingUp, 
//   AlertCircle, 
//   MessageSquareQuote,
//   CreditCard 
// } from "lucide-react";
// import { formatNaira } from "../lib/FormatNaira";

// // 1. Interface Definition
// interface StatCardProps {
//   title: string;
//   value: string | number;
//   description: string;
//   icon: React.ReactNode;
//   trend?: string;
//   color: "indigo" | "emerald" | "amber" | "rose";
// }

// // 2. Sub-component (StatCard)
// // Make sure this is outside the main export but after the interface
// const StatCard = ({ title, value, description, icon, trend, color }: StatCardProps) => {
//   const colorMap = {
//     indigo: "bg-[#002B5B] shadow-indigo-100",
//     emerald: "bg-emerald-600 shadow-emerald-200",
//     amber: "bg-[#F7931E] shadow-orange-200",
//     rose: "bg-rose-600 shadow-rose-200",
//   };

//   return (
//     <motion.div 
//       whileHover={{ y: -5 }}
//       className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm flex flex-col justify-between"
//     >
//       <div className="flex justify-between items-start mb-4">
//         <div className={`p-3 rounded-2xl text-white ${colorMap[color]} shadow-lg`}>
//           {icon}
//         </div>
//         {trend && (
//           <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-tighter">
//             <TrendingUp size={12} />
//             {trend}
//           </div>
//         )}
//       </div>
      
//       <div>
//         <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">
//           {title}
//         </h3>
//         <p className="text-3xl font-black text-gray-[#002B5B] tracking-tighter mb-1">
//           {value}
//         </p>
//         <p className="text-xs text-gray-500 font-medium">
//           {description}
//         </p>
//       </div>
//     </motion.div>
//   );
// };

// // 3. Main Export Component
// export default function StatsGrid() {
//   // Access Redux Slices
//   const { reviews } = useSelector((state: RootState) => state.admin);
//   const { orders } = useSelector((state: RootState) => state.orders || { orders: [] });

//   // Calculations
//   const totalOrders = orders?.length || 0;
//   const totalRevenue = orders?.reduce((acc, order) => acc + (order.total || 0), 0) || 0;
//   const pendingReviews = reviews?.filter(r => !r.approved).length || 0;
//   const totalIntel = reviews?.length || 0;

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
//       <StatCard 
//         title="Revenue"
//         value={`₦${totalRevenue.toLocaleString()}`}
//         description="Gross sales recorded"
//         icon={<CreditCard size={24} />}
//         trend="+15%"
//         color="indigo"
//       />

//       <StatCard 
//         title="Total Orders"
//         value={totalOrders}
//         description="Completed transactions"
//         icon={<ShoppingBasket size={24} />}
//         trend="+8%"
//         color="emerald"
//       />

//       <StatCard 
//         title="Pending Reviews"
//         value={pendingReviews}
//         description={pendingReviews > 0 ? "Action required" : "All moderated"}
//         icon={<AlertCircle size={24} />}
//         color="rose"
//       />

//       <StatCard 
//         title="Total Intel"
//         value={totalIntel}
//         description="Customer reviews"
//         icon={<MessageSquareQuote size={24} />}
//         color="amber"
//       />
//     </div>
//   );
// }



"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { 
  ShoppingBasket, 
  TrendingUp, 
  AlertCircle, 
  MessageSquareQuote,
  CreditCard 
} from "lucide-react";

// Helper function for compact formatting
const formatCompactNumber = (number: number) => {
  if (number < 1000) return `₦${number}`;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number);
};

// 1. Interface Definition
interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: string;
  color: "indigo" | "emerald" | "amber" | "rose";
}

// 2. Sub-component (StatCard)
const StatCard = ({ title, value, description, icon, trend, color }: StatCardProps) => {
  const colorMap = {
    indigo: "bg-[#002B5B] shadow-indigo-100",
    emerald: "bg-emerald-600 shadow-emerald-200",
    amber: "bg-[#F7931E] shadow-orange-200",
    rose: "bg-rose-600 shadow-rose-200",
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between min-h-[180px]"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl text-white ${colorMap[color]} shadow-lg`}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-tighter">
            <TrendingUp size={12} />
            {trend}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">
          {title}
        </h3>
        <p className="text-2xl xl:text-3xl font-black text-[#002B5B] tracking-tighter mb-1 truncate">
          {value}
        </p>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

// 3. Main Export Component
export default function StatsGrid() {
  // Use optional chaining and default objects to prevent undefined errors
  const { reviews } = useSelector((state: RootState) => state.admin || { reviews: [] });
  const { orders } = useSelector((state: RootState) => (state as any).orders || { orders: [] });

  // Memoize calculations for performance and to prevent layout shifts
  const stats = useMemo(() => {
    const totalRevenue = orders?.reduce((acc: number, order: any) => acc + (Number(order.total) || 0), 0) || 0;
    const totalOrders = orders?.length || 0;
    const pendingReviews = reviews?.filter((r: any) => !r.approved).length || 0;
    const totalIntel = reviews?.length || 0;

    return {
      revenue: formatCompactNumber(totalRevenue),
      orders: totalOrders.toLocaleString(),
      pending: pendingReviews,
      intel: totalIntel
    };
  }, [orders, reviews]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
      <StatCard 
        title="Revenue"
        value={stats.revenue}
        description="Gross sales recorded"
        icon={<CreditCard size={24} />}
        trend="+15%"
        color="indigo"
      />

      <StatCard 
        title="Total Orders"
        value={stats.orders}
        description="Completed transactions"
        icon={<ShoppingBasket size={24} />}
        trend="+8%"
        color="emerald"
      />

      <StatCard 
        title="Pending Reviews"
        value={stats.pending}
        description={stats.pending > 0 ? "Action required" : "All moderated"}
        icon={<AlertCircle size={24} />}
        color="rose"
      />

      <StatCard 
        title="Total Intel"
        value={stats.intel}
        description="Customer reviews"
        icon={<MessageSquareQuote size={24} />}
        color="amber"
      />
    </div>
  );
}