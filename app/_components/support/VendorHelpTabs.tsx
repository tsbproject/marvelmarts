



// "use client";

// import { useState } from "react";

// import SupportTicketForm from "@/app/_components/support/SupportTicketForm";

// import {
//   HelpCircle,
//   MessageSquare,
//   Ticket,
//   BookOpen,
//   Video,
//   ArrowRight,
//   Package,
//   Wallet,
//   Store,
//   ShieldAlert,
//   Search,
//   Clock3,
// } from "lucide-react";

// import Link from "next/link";

// interface TicketItem {
//   id: string;
//   subject: string;
//   status: string;
//   priority?: string | null;
//   createdAt: Date;
// }

// export default function VendorHelpTabs({
//   faqItems,
//   tickets,
// }: {
//   faqItems: any[];
//   tickets: TicketItem[];
// }) {

//   const [activeTab, setActiveTab] =
//     useState("faqs");

//     const [currentPage, setCurrentPage] =
//   useState(1);

// const ticketsPerPage = 5;

// const totalPages = Math.ceil(
//   tickets.length / ticketsPerPage
// );

// const startIndex =
//   (currentPage - 1) * ticketsPerPage;

// const paginatedTickets =
//   tickets.slice(
//     startIndex,
//     startIndex + ticketsPerPage
//   );

//   return (
//     <div className="p-4 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

//       {/* PAGE HEADER */}
//       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

//         <div>
//           <h1 className="text-2xl md:text-4xl font-black italic uppercase text-accent-navy tracking-tight">
//             Help & Support
//           </h1>

//           <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-neutral-gray mt-2">
//             Vendor Assistance & Support Center
//           </p>
//         </div>

//         <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-primary/10 border border-brand-primary/10">
//           <Clock3
//             size={16}
//             className="text-brand-primary"
//           />

//           <span className="text-[10px] uppercase tracking-widest font-black text-brand-primary">
//             Avg Response: &lt; 2 Hours
//           </span>
//         </div>
//       </div>

//       {/* TABS */}
//       <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">

//         <div className="flex flex-wrap items-center border-b border-gray-100 px-2 lg:px-4">

//           <button
//             onClick={() => setActiveTab("faqs")}
//             className={`
//               flex items-center gap-2
//               px-6 py-5
//               text-[11px]
//               uppercase
//               tracking-widest
//               font-black
//               transition-all
//               border-b-2
//               ${
//                 activeTab === "faqs"
//                   ? "border-brand-primary text-brand-primary bg-brand-primary/5"
//                   : "border-transparent text-neutral-gray hover:text-accent-navy"
//               }
//             `}
//           >
//             <HelpCircle size={16} />
//             FAQs
//           </button>

//           <button
//             onClick={() => setActiveTab("contact")}
//             className={`
//               flex items-center gap-2
//               px-6 py-5
//               text-[11px]
//               uppercase
//               tracking-widest
//               font-black
//               transition-all
//               border-b-2
//               ${
//                 activeTab === "contact"
//                   ? "border-brand-primary text-brand-primary bg-brand-primary/5"
//                   : "border-transparent text-neutral-gray hover:text-accent-navy"
//               }
//             `}
//           >
//             <MessageSquare size={16} />
//             Contact Support
//           </button>

//           <button
//             onClick={() => setActiveTab("tickets")}
//             className={`
//               flex items-center gap-2
//               px-6 py-5
//               text-[11px]
//               uppercase
//               tracking-widest
//               font-black
//               transition-all
//               border-b-2
//               ${
//                 activeTab === "tickets"
//                   ? "border-brand-primary text-brand-primary bg-brand-primary/5"
//                   : "border-transparent text-neutral-gray hover:text-accent-navy"
//               }
//             `}
//           >
//             <Ticket size={16} />
//             My Tickets
//           </button>
//         </div>

//         {/* FAQS */}
//         {activeTab === "faqs" && (
//           <div className="p-6 lg:p-8 space-y-8">

//             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

//               <div className="bg-[#FBFBFB] border border-gray-100 rounded-[2rem] p-6">

//                 <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-5">
//                   <BookOpen size={26} />
//                 </div>

//                 <h3 className="text-xl font-black italic text-accent-navy mb-3">
//                   Documentation
//                 </h3>

//                 <p className="text-sm text-neutral-gray leading-relaxed mb-6">
//                   Explore vendor onboarding guides,
//                   selling policies, payouts, and
//                   marketplace documentation.
//                 </p>

//                 <Link
//                   href="/help"
//                   className="inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-widest font-black"
//                 >
//                   Learn More
//                   <ArrowRight size={14} />
//                 </Link>
//               </div>

//               <div className="bg-[#FBFBFB] border border-gray-100 rounded-[2rem] p-6">

//                 <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-5">
//                   <Video size={26} />
//                 </div>

//                 <h3 className="text-xl font-black italic text-accent-navy mb-3">
//                   Video Tutorials
//                 </h3>

//                 <p className="text-sm text-neutral-gray leading-relaxed mb-6">
//                   Watch detailed walkthroughs covering
//                   store setup, analytics, product
//                   uploads, and order management.
//                 </p>

//                 <Link
//                   href="/vendor/tutorials"
//                   className="inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-widest font-black"
//                 >
//                   Watch Tutorials
//                   <ArrowRight size={14} />
//                 </Link>
//               </div>

//               <div className="bg-[#FBFBFB] border border-gray-100 rounded-[2rem] p-6">

//                 <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
//                   <Search size={26} />
//                 </div>

//                 <h3 className="text-xl font-black italic text-accent-navy mb-3">
//                   Knowledge Base
//                 </h3>

//                 <p className="text-sm text-neutral-gray leading-relaxed mb-6">
//                   Search frequently asked questions and
//                   vendor support resources instantly.
//                 </p>

//                 <Link
//                   href="/help"
//                   className="inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-widest font-black"
//                 >
//                   Browse Articles
//                   <ArrowRight size={14} />
//                 </Link>
//               </div>
//             </div>

//             <div className="space-y-5">

//               {faqItems.map((item, index) => (
//                 <div
//                   key={index}
//                   className="rounded-[2rem] border border-gray-100 bg-[#FBFBFB] p-6"
//                 >
//                   <div className="flex items-start gap-4">

//                     <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
//                       {item.icon}
//                     </div>

//                     <div>
//                       <h3 className="text-lg font-black italic text-accent-navy mb-3 tracking-tight">
//                         {item.question}
//                       </h3>

//                       <p className="text-sm leading-relaxed text-neutral-gray">
//                         {item.answer}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* CONTACT */}
//         {activeTab === "contact" && (
//           <div className="p-6 lg:p-8">

//             <div className="max-w-5xl mx-auto space-y-6">

//               <div className="bg-gradient-to-br from-accent-navy via-[#0A1E40] to-[#102B5E] rounded-[2.5rem] p-8 border border-brand-primary/10 overflow-hidden relative">

//                 <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-primary/10 blur-3xl" />

//                 <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

//                   <div className="max-w-2xl">

//                     <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 mb-5">
//                       <ShieldAlert
//                         size={15}
//                         className="text-brand-primary"
//                       />

//                       <span className="text-[10px] uppercase tracking-[0.25em] font-black text-white/80">
//                         Vendor Secure Support Channel
//                       </span>
//                     </div>

//                     <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tight text-white leading-tight">
//                       Contact Support
//                     </h2>

//                     <p className="mt-5 text-sm text-white/70 leading-relaxed max-w-xl">
//                       Submit support requests, report
//                       technical issues, ask payout
//                       questions, or contact the vendor
//                       success team directly from your
//                       dashboard.
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <SupportTicketForm compact={false} />
//             </div>
//           </div>
//         )}

//         {/* TICKETS */}
//         {activeTab === "tickets" && (
//           <div className="p-6 lg:p-8 space-y-6">

//             {tickets.length === 0 && (
//               <div className="bg-[#FBFBFB] border border-dashed border-gray-200 rounded-[2rem] p-20 text-center">
//                 <h3 className="text-xl font-black italic text-accent-navy mb-3">
//                   No Support Tickets Yet
//                 </h3>

//                 <p className="text-sm text-neutral-gray">
//                   Your submitted support requests will appear here.
//                 </p>
//               </div>
//             )}

//             {paginatedTickets.map((ticket) => (
//               <div
//                 key={ticket.id}
//                 className="bg-[#FBFBFB] border border-gray-100 rounded-[2rem] p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
//               >

//                 <div>

//                   <div className="flex items-center gap-3 mb-3 flex-wrap">

//                     <span className="px-3 py-2 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] uppercase tracking-widest font-black">
//                       #{ticket.id.slice(-8).toUpperCase()}
//                     </span>

//                     <span
//                       className={`
//                         px-3 py-2 rounded-full text-[10px] uppercase tracking-widest font-black
//                         ${
//                           ticket.status === "OPEN"
//                             ? "bg-red-50 text-red-600"

//                             : ticket.status === "IN_PROGRESS"
//                             ? "bg-orange-50 text-orange-600"

//                             : ticket.status === "RESOLVED"
//                             ? "bg-green-50 text-green-600"

//                             : "bg-gray-100 text-gray-500"
//                         }
//                       `}
//                     >
//                       {ticket.status.replace("_", " ")}
//                     </span>
//                   </div>

//                   <h3 className="text-xl font-black italic text-accent-navy tracking-tight mb-2">
//                     {ticket.subject}
//                   </h3>

//                   <p className="text-sm text-neutral-gray">
//                     Submitted {new Date(ticket.createdAt).toLocaleDateString()}
//                     {" • "}
//                     Priority: {ticket.priority || "MEDIUM"}
//                   </p>
//                 </div>

//                 <Link
//                   href={`/account/vendor/help-&-support/${ticket.id}`}
//                   className="
//                     inline-flex items-center justify-center gap-2
//                     px-6 py-4
//                     rounded-2xl
//                     border border-gray-200
//                     bg-white
//                     text-[10px]
//                     uppercase
//                     tracking-widest
//                     font-black
//                     text-accent-navy
//                     hover:bg-gray-50
//                     transition-all
//                   "
//                 >
//                   View Ticket
//                   <ArrowRight size={14} />
//                 </Link>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




"use client";

import { useState } from "react";

import SupportTicketForm from "@/app/_components/support/SupportTicketForm";

import {
  HelpCircle,
  MessageSquare,
  Ticket,
  BookOpen,
  Video,
  ArrowRight,
  Package,
  Wallet,
  Store,
  ShieldAlert,
  Search,
  Clock3,
} from "lucide-react";

import Link from "next/link";

interface TicketItem {
  id: string;
  subject: string;
  status: string;
  priority?: string | null;
  createdAt: Date;
}

export default function VendorHelpTabs({
  faqItems,
  tickets,
}: {
  faqItems: any[];
  tickets: TicketItem[];
}) {

  const [activeTab, setActiveTab] =
    useState("faqs");

  // PAGINATION
  const [currentPage, setCurrentPage] =
    useState(1);

  const ticketsPerPage = 5;

  const totalPages = Math.ceil(
    tickets.length / ticketsPerPage
  );

  const startIndex =
    (currentPage - 1) * ticketsPerPage;

  const paginatedTickets =
    tickets.slice(
      startIndex,
      startIndex + ticketsPerPage
    );

  return (
    <div className="p-4 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

        <div>
          <h1 className="text-2xl md:text-4xl font-black italic uppercase text-accent-navy tracking-tight">
            Help & Support
          </h1>

          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-neutral-gray mt-2">
            Vendor Assistance & Support Center
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-primary/10 border border-brand-primary/10">
          <Clock3
            size={16}
            className="text-brand-primary"
          />

          <span className="text-[10px] uppercase tracking-widest font-black text-brand-primary">
            Avg Response: &lt; 2 Hours
          </span>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">

        {/* TAB NAV */}
        <div className="flex flex-wrap items-center border-b border-gray-100 px-2 lg:px-4">

          <button
            onClick={() => setActiveTab("faqs")}
            className={`
              flex items-center gap-2
              px-6 py-5
              text-[11px]
              uppercase tracking-widest
              font-black transition-all border-b-2
              ${
                activeTab === "faqs"
                  ? "border-brand-primary text-brand-primary bg-brand-primary/5"
                  : "border-transparent text-neutral-gray hover:text-accent-navy"
              }
            `}
          >
            <HelpCircle size={16} />
            FAQs
          </button>

          <button
            onClick={() => setActiveTab("contact")}
            className={`
              flex items-center gap-2
              px-6 py-5
              text-[11px]
              uppercase tracking-widest
              font-black transition-all border-b-2
              ${
                activeTab === "contact"
                  ? "border-brand-primary text-brand-primary bg-brand-primary/5"
                  : "border-transparent text-neutral-gray hover:text-accent-navy"
              }
            `}
          >
            <MessageSquare size={16} />
            Contact Support
          </button>

          <button
            onClick={() => setActiveTab("tickets")}
            className={`
              flex items-center gap-2
              px-6 py-5
              text-[11px]
              uppercase tracking-widest
              font-black transition-all border-b-2
              ${
                activeTab === "tickets"
                  ? "border-brand-primary text-brand-primary bg-brand-primary/5"
                  : "border-transparent text-neutral-gray hover:text-accent-navy"
              }
            `}
          >
            <Ticket size={16} />
            My Tickets
          </button>
        </div>

        {/* FAQS */}
        {activeTab === "faqs" && (
          <div className="p-6 lg:p-8 space-y-5">

            {faqItems.map((item, index) => (
              <div
                key={index}
                className="rounded-[2rem] border border-gray-100 bg-[#FBFBFB] p-6"
              >
                <div className="flex items-start gap-4">

                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>

                  <div>
                    <h3 className="text-lg font-black italic text-accent-navy mb-3 tracking-tight">
                      {item.question}
                    </h3>

                    <p className="text-sm leading-relaxed text-neutral-gray">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CONTACT */}
        {activeTab === "contact" && (
          <div className="p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
              <SupportTicketForm compact={false} />
            </div>
          </div>
        )}

        {/* MY TICKETS */}
        {activeTab === "tickets" && (
          <div className="p-6 lg:p-8 space-y-6">

            {tickets.length === 0 && (
              <div className="bg-[#FBFBFB] border border-dashed border-gray-200 rounded-[2rem] p-20 text-center">
                <h3 className="text-xl font-black italic text-accent-navy mb-3">
                  No Support Tickets Yet
                </h3>

                <p className="text-sm text-neutral-gray">
                  Your submitted support requests will appear here.
                </p>
              </div>
            )}

            {/* PAGINATED TICKETS */}
            {paginatedTickets.map((ticket) => (

              <div
                key={ticket.id}
                className="
                  bg-[#FBFBFB]
                  border border-gray-100
                  rounded-[2rem]
                  p-6
                  flex flex-col lg:flex-row
                  lg:items-center
                  lg:justify-between
                  gap-6
                "
              >

                <div>

                  <div className="flex items-center gap-3 mb-3 flex-wrap">

                    <span className="
                      px-3 py-2 rounded-full
                      bg-brand-primary/10
                      text-brand-primary
                      text-[10px]
                      uppercase tracking-widest
                      font-black
                    ">
                      #{ticket.id.slice(-8).toUpperCase()}
                    </span>

                    <span
                      className={`
                        px-3 py-2 rounded-full
                        text-[10px]
                        uppercase tracking-widest
                        font-black
                        ${
                          ticket.status === "OPEN"
                            ? "bg-red-50 text-red-600"

                            : ticket.status === "IN_PROGRESS"
                            ? "bg-orange-50 text-orange-600"

                            : ticket.status === "RESOLVED"
                            ? "bg-green-50 text-green-600"

                            : "bg-gray-100 text-gray-500"
                        }
                      `}
                    >
                      {ticket.status.replace(
                        "_",
                        " "
                      )}
                    </span>
                  </div>

                  <h3 className="text-xl font-black italic text-accent-navy tracking-tight mb-2">
                    {ticket.subject}
                  </h3>

                  <p className="text-sm text-neutral-gray">
                    Submitted{" "}
                    {new Date(
                      ticket.createdAt
                    ).toLocaleDateString()}
                    {" • "}
                    Priority:{" "}
                    {ticket.priority ||
                      "MEDIUM"}
                  </p>
                </div>

                <Link
                  href={`/account/vendor/help-&-support/${ticket.id}`}
                  className="
                    inline-flex items-center justify-center gap-2
                    px-6 py-4 rounded-2xl
                    border border-gray-200
                    bg-white
                    text-[10px]
                    uppercase tracking-widest
                    font-black
                    text-accent-navy
                    hover:bg-gray-50
                    transition-all
                  "
                >
                  View Ticket
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}

            {/* PAGINATION */}
            {tickets.length >
              ticketsPerPage && (

              <div className="
                flex flex-col sm:flex-row
                items-center justify-between
                gap-5 pt-4
              ">

                <div className="
                  text-xs font-bold
                  text-neutral-gray
                ">
                  Showing{" "}
                  {startIndex + 1}
                  -
                  {Math.min(
                    startIndex +
                      ticketsPerPage,
                    tickets.length
                  )}{" "}
                  of {tickets.length} tickets
                </div>

                <div className="
                  flex items-center gap-2
                  flex-wrap justify-center
                ">

                  {/* PREVIOUS */}
                  <button
                    disabled={
                      currentPage === 1
                    }
                    onClick={() =>
                      setCurrentPage(
                        currentPage - 1
                      )
                    }
                    className="
                      px-5 h-12 rounded-2xl
                      border border-gray-200
                      bg-white
                      text-xs font-black
                      uppercase tracking-widest
                      text-accent-navy
                      hover:bg-gray-50
                      transition-all
                      disabled:opacity-40
                      disabled:cursor-not-allowed
                    "
                  >
                    Previous
                  </button>

                  {/* PAGE NUMBERS */}
                  {Array.from({
                    length: totalPages,
                  }).map((_, index) => {

                    const page =
                      index + 1;

                    return (
                      <button
                        key={page}
                        onClick={() =>
                          setCurrentPage(
                            page
                          )
                        }
                        className={`
                          w-12 h-12 rounded-2xl
                          text-xs font-black
                          transition-all
                          ${
                            currentPage ===
                            page
                              ? "bg-brand-primary text-white shadow-lg"
                              : "bg-white border border-gray-200 text-accent-navy hover:bg-gray-50"
                          }
                        `}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {/* NEXT */}
                  <button
                    disabled={
                      currentPage ===
                      totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        currentPage + 1
                      )
                    }
                    className="
                      px-5 h-12 rounded-2xl
                      border border-gray-200
                      bg-white
                      text-xs font-black
                      uppercase tracking-widest
                      text-accent-navy
                      hover:bg-gray-50
                      transition-all
                      disabled:opacity-40
                      disabled:cursor-not-allowed
                    "
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
