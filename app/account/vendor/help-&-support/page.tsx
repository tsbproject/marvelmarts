



// import DashboardHeader from "@/app/_components/DashboardHeader";

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

// import { prisma } from "@/app/lib/prisma";

// import { getServerSession } from "next-auth";

// import { authOptions } from "@/app/lib/auth";

// import VendorHelpTabs from "@/app/_components/support/VendorHelpTabs";

// export default async function VendorHelpSupportPage() {

//   const session =
//     await getServerSession(authOptions);

//   if (!session?.user?.email) {
//     return null;
//   }

//   const tickets =
//     await prisma.ticket.findMany({
//       where: {
//         userEmail:
//           session.user.email,
//       },

//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//   const faqItems = [
//     {
//       icon: <Package size={18} />,
//       question: "How do I add a new product?",
//       answer:
//         "Navigate to Products and click Add Product to upload product details, inventory, images, and pricing.",
//     },

//     {
//       icon: <Wallet size={18} />,
//       question: "When are vendor payouts processed?",
//       answer:
//         "Vendor payouts are processed after successful order completion based on your payout schedule and verification status.",
//     },

//     {
//       icon: <Store size={18} />,
//       question: "How can I improve my store visibility?",
//       answer:
//         "Complete your store profile, maintain high ratings, upload quality products, and use Boost Credits.",
//     },

//     {
//       icon: <ShieldAlert size={18} />,
//       question: "Why was my verification rejected?",
//       answer:
//         "Verification may fail if documents are blurry, expired, incomplete, or do not match your registered business information.",
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-[#FBFBFB] flex flex-col">

//       <DashboardHeader
//         title="Help & Support"
//         showLogout={true}
//       />

//       <VendorHelpTabs
//         faqItems={faqItems}
//         tickets={tickets}
//       />
//     </div>
//   );
// }






import DashboardHeader from "@/app/_components/DashboardHeader";

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

import { prisma } from "@/app/lib/prisma";

import { getServerSession } from "next-auth";

import { authOptions } from "@/app/lib/auth";

import VendorHelpTabs from "@/app/_components/support/VendorHelpTabs";

export default async function VendorHelpSupportPage() {

  const session =
    await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  const tickets =
    await prisma.ticket.findMany({
      where: {
        userEmail:
          session.user.email,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  const faqItems = [
    {
      icon: <Package size={18} />,
      question: "How do I add a new product?",
      answer:
        "Navigate to Products and click Add Product to upload product details, inventory, images, and pricing.",
    },

    {
      icon: <Wallet size={18} />,
      question: "When are vendor payouts processed?",
      answer:
        "Vendor payouts are processed after successful order completion based on your payout schedule and verification status.",
    },

    {
      icon: <Store size={18} />,
      question: "How can I improve my store visibility?",
      answer:
        "Complete your store profile, maintain high ratings, upload quality products, and use Boost Credits.",
    },

    {
      icon: <ShieldAlert size={18} />,
      question: "Why was my verification rejected?",
      answer:
        "Verification may fail if documents are blurry, expired, incomplete, or do not match your registered business information.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex flex-col">

      <DashboardHeader
        title="Help & Support"
        showLogout={true}
      />

      <VendorHelpTabs
        faqItems={faqItems}
        tickets={tickets}
      />
    </div>
  );
}