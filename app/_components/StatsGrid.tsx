"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  ShoppingBasket, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight, 
  Newspaper 
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: string;
  color: "indigo" | "emerald" | "amber" | "rose";
}

function StatCard({ title, value, description, icon, trend, color }: StatCardProps) {
  const colorMap = {
    indigo: "bg-indigo-600 shadow-indigo-200",
    emerald: "bg-emerald-600 shadow-emerald-200",
    amber: "bg-amber-500 shadow-amber-200",
    rose: "bg-rose-600 shadow-rose-200",
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm flex flex-col justify-between"
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
        <p className="text-3xl font-black text-gray-900 tracking-tighter mb-1">
          {value}
        </p>
        <p className="text-xs text-gray-500 font-medium">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
      <StatCard 
        title="Total Customers"
        value="1,284"
        description="Active users this month"
        icon={<Users size={24} />}
        trend="+12%"
        color="indigo"
      />
      <StatCard 
        title="Total Orders"
        value="452"
        description="Completed transactions"
        icon={<ShoppingBasket size={24} />}
        trend="+8%"
        color="emerald"
      />
      <StatCard 
        title="Pending Tickets"
        value="14"
        description="Requires your attention"
        icon={<AlertCircle size={24} />}
        color="rose"
      />
      <StatCard 
        title="Active Blogs"
        value="86"
        description="Published articles"
        icon={<Newspaper size={24} />}
        color="amber"
      />
    </div>
  );
}