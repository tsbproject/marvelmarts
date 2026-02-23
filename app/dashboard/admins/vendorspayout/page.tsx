// "use client";

// import React, { Component } from "react";
// import { connect } from "react-redux";
// import VendorsPayoutTable from "../VendorsPayoutTable"; 
// import PayoutHistoryTable from "../PayoutHistoryTable"; 
// import { ShieldCheck, Filter } from "lucide-react";
// import { fetchAllPayouts } from "@/store/vendorSlice";

// interface PageProps {
//   dispatch: any;
// }

// class VendorsPayoutsPage extends Component<PageProps> {
//   componentDidMount() {
//     // Fetch all payouts from the database on mount
//     this.props.dispatch(fetchAllPayouts());
//   }

//   render() {
//     return (
//       <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10">
//         {/* Header Section */}
//         <div className="max-w-7xl mx-auto mb-10">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
//             <div className="flex items-center gap-4">
//               <div className="h-14 w-14 bg-[#002B5B] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-900/20">
//                 <ShieldCheck size={28} />
//               </div>
//               <div>
//                 <div className="flex items-center gap-2">
//                   <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
//                   <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em]">Financial Gateway</p>
//                 </div>
//                 <h1 className="text-3xl font-black text-[#002B5B] uppercase tracking-tighter leading-none">
//                   Admin <span className="text-red-600">Treasury</span>
//                 </h1>
//               </div>
//             </div>

//             {/* Quick Stats/Actions */}
//             <div className="flex items-center gap-3">
//               <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-black text-[#002B5B] uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
//                 <Filter size={14} />
//                 Filter Requests
//               </button>
//               <div className="hidden md:flex flex-col items-end">
//                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Payout Status</p>
//                 <p className="text-sm font-black text-[#002B5B] uppercase tracking-tighter">System Operational</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Content Area */}
//         <main className="max-w-7xl mx-auto">
//           <div className="flex flex-col gap-12">
//             {/* 1. Pending Payout Requests */}
//             <VendorsPayoutTable />

//             {/* 2. Processed Payout History */}
//             <PayoutHistoryTable />
//           </div>
//         </main>

//         {/* Footer info */}
//         <footer className="max-w-7xl mx-auto mt-20 border-t border-gray-200 pt-6">
//           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] text-center">
//             MarvelMarts © 2026 • Secure Administrative Financial Protocol
//           </p>
//         </footer>
//       </div>
//     );
//   }
// }

// // Wrapping with connect to access dispatch
// export default connect()(VendorsPayoutsPage);



"use client";

import React, { Component } from "react";
import { connect } from "react-redux";
import VendorsPayoutTable from "../VendorsPayoutTable"; 
import PayoutHistoryTable from "../PayoutHistoryTable"; 
import { ShieldCheck, Filter } from "lucide-react";
// Ensure this matches the export name in your vendorSlice
import { fetchAdminPayouts } from "@/store/vendorSlice"; 

interface PageProps {
  dispatch: any;
}

class VendorsPayoutsPage extends Component<PageProps> {
  componentDidMount() {
    // 1. Fetching all payouts (Pending & History) from the database on mount
    // Using the thunk we established for the Admin API
    this.props.dispatch(fetchAdminPayouts());
  }

  render() {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-[#002B5B] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-900/20">
                <ShieldCheck size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em]">Financial Gateway</p>
                </div>
                <h1 className="text-3xl font-black text-[#002B5B] uppercase tracking-tighter leading-none">
                  Admin <span className="text-red-600">Treasury</span>
                </h1>
              </div>
            </div>

            {/* Quick Stats/Actions */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-black text-[#002B5B] uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
                <Filter size={14} />
                Filter Requests
              </button>
              <div className="hidden md:flex flex-col items-end">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Payout Status</p>
                <p className="text-sm font-black text-[#002B5B] uppercase tracking-tighter">System Operational</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-12">
            {/* 1. Pending Payout Requests Table */}
            {/* This component uses the connect() filter: p.status === "PENDING" */}
            <VendorsPayoutTable />

            {/* 2. Processed Payout History Table */}
            {/* This component will filter for: p.status !== "PENDING" */}
            <PayoutHistoryTable />
          </div>
        </main>

        {/* Footer info */}
        <footer className="max-w-7xl mx-auto mt-20 border-t border-gray-200 pt-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] text-center">
            MarvelMarts © 2026 • Secure Administrative Financial Protocol
          </p>
        </footer>
      </div>
    );
  }
}

// Wrapping with connect to access dispatch
export default connect()(VendorsPayoutsPage);