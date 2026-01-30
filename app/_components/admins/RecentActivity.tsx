"use client";

import { formatDistanceToNow } from "date-fns";
import { ShoppingCart, CheckCircle2, Clock } from "lucide-react";

export default function RecentActivity({ activities }: { activities: any[] }) {
  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
      <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2">
        <Clock className="text-brand-primary" size={20} />
        Live Feed
      </h3>

      <div className="space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${activity.paymentStatus ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                <ShoppingCart size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-900 group-hover:text-brand-primary transition-colors">
                  {activity.firstName} {activity.lastName}
                </p>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Order #{activity.orderNumber}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-black text-gray-900">
                ₦{Number(activity.total).toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400 uppercase font-bold">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
        
        {activities.length === 0 && (
          <p className="text-center text-gray-400 py-10">No recent orders yet.</p>
        )}
      </div>
    </div>
  );
}