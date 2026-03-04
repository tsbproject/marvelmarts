"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface RevenueChartProps {
  data: { date: string; amount: number }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#001F3F" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#001F3F" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis 
          dataKey="date" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 9, fontWeight: 800, fill: '#9CA3AF' }} 
          dy={10}
        />
        <YAxis hide />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '16px', 
            border: 'none', 
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            fontSize: '10px',
            fontWeight: '900',
            textTransform: 'uppercase'
          }} 
        />
        <Area 
          type="monotone" 
          dataKey="amount" 
          stroke="#001F3F" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorRevenue)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}