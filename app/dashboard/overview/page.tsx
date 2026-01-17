import DashboardHeader from "@/app/_components/DashboardHeader";
import StatsGrid from "@/app/_components/StatsGrid";
import { Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardOverview() {
  return (
    <div className="space-y-8">
      <DashboardHeader 
        title="Overview"
        showAddButton={true}
        addButtonLabel="New Product"
        addButtonLink="/dashboard/admins/products/new"
      />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Stats */}
        <StatsGrid />

        {/* Bottom Section: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Activity Feed */}
          <div className="lg:col-span-2 bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">
                Recent Orders
              </h3>
              <Link href="/dashboard/admins/orders" className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            {/* Placeholder for Order List */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-gray-50 border border-gray-100/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-bold text-gray-400">#ORD</div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 uppercase">Order #429{i}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">2 mins ago</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-gray-900">$129.00</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-indigo-900 rounded-[40px] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-black uppercase tracking-tight mb-2">Quick Actions</h3>
              <p className="text-indigo-200 text-xs font-medium mb-8">Commonly used management tools.</p>
              
              <div className="grid gap-3">
                <button className="w-full py-4 px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all text-left flex items-center justify-between group">
                  Manage Categories
                  <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                </button>
                <button className="w-full py-4 px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all text-left flex items-center justify-between group">
                  System Settings
                  <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                </button>
              </div>
            </div>
            {/* Background Decorative Element */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-[80px] opacity-50" />
          </div>

        </div>
      </div>
    </div>
  );
}






