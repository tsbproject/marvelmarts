// 'use client';

// export default function FaqPage() {
//   const faqs = [
//     {
//       question: 'How do I place an order?',
//       answer: 'Browse products, add them to your cart, and proceed to checkout.',
//     },
//     {
//       question: 'What payment methods are accepted?',
//       answer: 'We accept credit/debit cards, PayPal, and local bank transfers.',
//     },
//     {
//       question: 'How long does delivery take?',
//       answer: 'Delivery usually takes 3–7 business days depending on your location.',
//     },
//     {
//       question: 'Can I return a product?',
//       answer: 'Yes, returns are accepted within 14 days of delivery if the product is unused.',
//     },
//   ];

//   return (
//     <div className="container mx-auto p-6">
//       <h1 className="text-4xl font-bold mb-6">Frequently Asked Questions</h1>
//       <div className="space-y-6">
//         {faqs.map((faq, idx) => (
//           <div key={idx} className="border-b pb-4">
//             <h2 className="text-xl font-semibold">{faq.question}</h2>
//             <p className="text-gray-600 mt-2">{faq.answer}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }



"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  HelpCircle, 
  ShoppingBag, 
  Store, 
  Settings, 
  MessageCircle, 
  Mail 
} from "lucide-react";

const faqData = [
  {
    category: "General Questions",
    icon: <HelpCircle className="w-5 h-5" />,
    questions: [
      {
        q: "What is MarvelMarts?",
        a: "MarvelMarts is a modern Nigerian multi-vendor e-commerce marketplace that connects customers with quality products from trusted local vendors and brands. We are built to empower sellers with powerful tools while giving buyers a seamless, trustworthy, and enjoyable shopping experience."
      },
      {
        q: "Where does MarvelMarts operate?",
        a: "We currently serve customers and vendors across Nigeria, with fast delivery in major cities including Lagos, Abuja, Port Harcourt, Ibadan, Kano, Enugu, and more. We are actively expanding our logistics network nationwide."
      },
      {
        q: "Is MarvelMarts safe and secure?",
        a: "Yes. We use industry-standard encryption, secure payment gateways (Paystack & Flutterwave), and strict vendor verification. All transactions are protected, and we never share your personal or payment details with third parties."
      }
    ]
  },
  {
    category: "For Buyers",
    icon: <ShoppingBag className="w-5 h-5" />,
    questions: [
      {
        q: "How do I place an order?",
        a: "Browse products, add items to your cart, proceed to checkout, choose your preferred payment method (Card, Bank Transfer and Marvel Wallet), and confirm your order. You’ll receive an instant order confirmation."
      },
      {
        q: "How long does delivery take?",
        a: "Lagos & Abuja: 1–3 business days. Other major cities: 3–7 business days. Nationwide: 3–7 business days. You can track your order in real-time from your account."
      },
      {
        q: "Can I return or cancel an order?",
        a: "Yes. You can cancel an order before it is shipped. Once delivered, you have 7 days to request a return for most items (except perishable goods, customized products, or intimate items). Refunds are processed within 5-7 business days after inspection."
      }
    ]
  },
  {
    category: "For Vendors",
    icon: <Store className="w-5 h-5" />,
    questions: [
      {
        q: "How do I become a seller on MarvelMarts?",
        a: "Click 'Sell on MarvelMarts' on the homepage, create a seller account, and complete your store setup. Once approved (usually within 24–48 hours), you can start listing products."
      },
      {
        q: "How does Boost Credits work?",
        a: "Boost Credits allow you to increase the visibility of your products on the homepage, category pages, and search results. You can purchase credit packages (Starter, Growth, Dominance) and apply them to any product to get more impressions and sales."
      },
      {
        q: "When and how do I get paid?",
        a: "Payments are settled weekly. Once an order is delivered and the return window closes, your earnings (minus commission) are transferred directly to your registered bank account."
      }
    ]
  },
  {
    category: "Technical & Account",
    icon: <Settings className="w-5 h-5" />,
    questions: [
      {
        q: "I forgot my password. How do I reset it?",
        a: "On the login page, click 'Forgot Password?' and enter your email. You’ll receive a reset link to create a new password."
      },
      {
        q: "Why is my product not appearing in search?",
        a: "Make sure your product is published, has complete details (title, description, images, price), and is in the correct category. Using Boost Credits significantly increases visibility."
      }
    ]
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-neutral-light pb-20">
      {/* Header Section */}
      <section className="bg-accent-navy py-20 px-4 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black text-white italic tracking-tight"
        >
          HELP CENTER
        </motion.h1>
        <p className="mt-4 text-brand-primary font-bold uppercase tracking-widest text-sm">
          Everything you need to know about MarvelMarts
        </p>
      </section>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-10">
        <div className="space-y-12">
          {faqData.map((section, sectionIdx) => (
            <div key={section.category}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-brand-primary text-accent-navy rounded-lg shadow-sm">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-black text-accent-navy uppercase tracking-tighter">
                  {section.category}
                </h2>
              </div>

              <div className="space-y-4">
                {section.questions.map((item, qIdx) => {
                  const id = `${sectionIdx}-${qIdx}`;
                  const isOpen = openIndex === id;

                  return (
                    <motion.div 
                      key={id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFAQ(id)}
                        className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-neutral-light/50"
                      >
                        <span className="font-bold text-accent-navy pr-4">{item.q}</span>
                        <ChevronDown 
                          className={`w-5 h-5 text-brand-primary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
                        />
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            <div className="px-5 pb-5 text-neutral-gray text-[15px] leading-relaxed border-t border-gray-50 pt-4">
                              {item.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Support Section */}
        <section className="mt-20 p-8 rounded-3xl bg-white border border-gray-100 shadow-xl text-center">
          <h3 className="text-2xl font-black text-accent-navy">STILL HAVE QUESTIONS?</h3>
          <p className="text-neutral-gray mt-2 mb-8">
            Can’t find the answer you’re looking for? Send us a message.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:support@marvelmarts.com"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-accent-navy text-white font-bold rounded-2xl hover:bg-neutral-dark transition-all active:scale-95 shadow-lg shadow-accent-navy/20"
            >
              <Mail size={20} className="text-brand-primary" />
              Email Support
            </a>
            <button className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-primary text-accent-navy font-bold rounded-2xl hover:brightness-105 transition-all active:scale-95 shadow-lg shadow-brand-primary/20">
              <MessageCircle size={20} />
              WhatsApp Support
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
