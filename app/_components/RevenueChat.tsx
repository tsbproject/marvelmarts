// "use client";

// import { useMemo } from "react";
// import { useSelector } from "react-redux";
// import { RootState } from "@/store";
// import { 
//   XAxis, 
//   YAxis, 
//   CartesianGrid, 
//   Tooltip, 
//   ResponsiveContainer, 
//   Area, 
//   AreaChart,
//   TooltipProps
// } from "recharts";

// // 1. Define Types for the Chart Data
// interface ChartDataPoint {
//   day: string;
//   rawDate: string;
//   revenue: number;
// }

// export default function RevenueChart() {
//   // Use optional chaining for safety
//   const orders = useSelector((state: RootState) => (state as any).orders?.orders || []);

//   // 2. Logic: Process orders into daily totals for the last 7 days
//   const chartData = useMemo<ChartDataPoint[]>(() => {
//     const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
//     // Create the baseline for the last 7 days
//     const last7Days = Array.from({ length: 7 }).map((_, i) => {
//       const d = new Date();
//       d.setDate(d.getDate() - i);
//       return {
//         day: days[d.getDay()],
//         rawDate: d.toLocaleDateString(),
//         revenue: 0,
//       };
//     }).reverse();

//     // Map orders to days
//     orders.forEach((order: any) => {
//       const orderDate = new Date(order.createdAt).toLocaleDateString();
//       const match = last7Days.find((d) => d.rawDate === orderDate);
//       if (match) {
//         match.revenue += Number(order.total) || 0;
//       }
//     });

//     return last7Days;
//   }, [orders]);

//   // 3. Compact Currency Formatter for the Y-Axis
//   const formatYAxis = (value: number) => {
//     return new Intl.NumberFormat("en-NG", {
//       notation: "compact",
//       compactDisplay: "short",
//     }).format(value);
//   };

//   // 4. Custom Tooltip for Brand Consistency
//   const CustomTooltip = ({ active, payload }: any) => {
//     if (active && payload && payload.length) {
//       // payload[0].payload refers to the original ChartDataPoint object
//       const data = payload[0].payload;
//       return (
//         <div className="bg-[#002B5B] p-4 rounded-2xl shadow-2xl border-none">
//           <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">
//             {data.rawDate}
//           </p>
//           <p className="text-sm font-black text-white">
//             ₦{Number(payload[0].value).toLocaleString()}
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm w-full h-[400px]">
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h3 className="text-lg font-black uppercase tracking-tight text-[#002B5B]">Revenue Pulse</h3>
//           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Last 7 Days Performance</p>
//         </div>
//         <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
//           <div className="w-2 h-2 rounded-full bg-[#F7931E] animate-pulse" />
//           <span className="text-[10px] font-black uppercase text-gray-500 tracking-tighter">Gross Sales (₦)</span>
//         </div>
//       </div>

//       <div className="w-full h-[280px]">
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//             <defs>
//               <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#F7931E" stopOpacity={0.3} />
//                 <stop offset="95%" stopColor="#F7931E" stopOpacity={0} />
//               </linearGradient>
//             </defs>
//             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F9FAFB" />
//             <XAxis 
//               dataKey="day" 
//               axisLine={false} 
//               tickLine={false} 
//               tick={{ fontSize: 10, fontWeight: 900, fill: '#9CA3AF' }}
//               dy={15}
//             />
//             <YAxis 
//               axisLine={false}
//               tickLine={false}
//               tickFormatter={formatYAxis}
//               tick={{ fontSize: 10, fontWeight: 800, fill: '#D1D5DB' }}
//               dx={-5}
//             />
//             <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#F7931E', strokeWidth: 1, strokeDasharray: '5 5' }} />
//             <Area 
//               type="monotone" 
//               dataKey="revenue" 
//               stroke="#F7931E" 
//               strokeWidth={4}
//               fillOpacity={1} 
//               fill="url(#colorRev)" 
//               animationDuration={1500}
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }




"use client";

import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface RevenueChartPoint {
  date: string;
  amount: number;
}

interface RevenueChartProps {
  data: RevenueChartPoint[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const formatYAxis = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      notation: "compact",
      compactDisplay: "short",
    }).format(value);
  };

  

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;

      return (
        <div className="bg-[#002B5B] p-4 rounded-2xl shadow-2xl border-none">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">
            {point.date}
          </p>
          <p className="text-sm font-black text-white">
            ₦{Number(payload[0].value).toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm w-full h-[400px]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight text-[#002B5B]">
            Revenue Pulse
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Last 30 Days Performance
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-[#F7931E] animate-pulse" />
          <span className="text-[10px] font-black uppercase text-gray-500 tracking-tighter">
            Gross Sales (₦)
          </span>
        </div>
      </div>

      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F7931E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F7931E" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F9FAFB" />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 900, fill: "#9CA3AF" }}
              dy={15}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={formatYAxis}
              tick={{ fontSize: 10, fontWeight: 800, fill: "#D1D5DB" }}
              dx={-5}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#F7931E", strokeWidth: 1, strokeDasharray: "5 5" }}
            />

            <Area
              type="monotone"
              dataKey="amount"
              stroke="#F7931E"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorRev)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}