import React from 'react';
import { Trash2, ShieldCheck, Mail, Clock, CheckCircle, ArrowRight } from 'lucide-react';

export default function DataDeletionPolicy() {
  const steps = [
    { 
      title: "Initiate Request", 
      desc: "Send an email to our support team from your registered address.", 
      icon: <Mail className="text-blue-600" size={20} /> 
    },
    { 
      title: "Verification", 
      desc: "We verify your identity to ensure the security of your account data.", 
      icon: <ShieldCheck className="text-blue-600" size={20} /> 
    },
    { 
      title: "72-Hour Window", 
      desc: "Your request is processed and data is purged from our active systems.", 
      icon: <Clock className="text-blue-600" size={20} /> 
    },
    { 
      title: "Confirmation", 
      desc: "You receive a final email confirming the deletion is complete.", 
      icon: <CheckCircle className="text-blue-600" size={20} /> 
    },
  ];

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-20 font-sans">
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-gray-100 pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-100 rounded-full mb-6">
            <Trash2 size={14} className="text-red-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-600">User Rights Protocol</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-accent-navy mb-6">
            Data Deletion <span className="text-brand-primary">& Withdrawal</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto font-medium text-sm leading-relaxed uppercase tracking-tight">
            You own your data. We simply facilitate your right to manage, withdraw, or remove it from the MarvelMarts ecosystem.
          </p>
        </div>
      </header>

      {/* --- CONTENT --- */}
      <main className="max-w-4xl mx-auto px-6 -mt-10">
        
        {/* RIGHT TO WITHDRAW CARD */}
        <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100 mb-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="bg-accent-navy p-4 rounded-3xl text-white shrink-0">
              <ShieldCheck size={32} />
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-gray-900">Our Data Guarantee</h2>
              <p className="text-gray-600 leading-relaxed font-medium">
                In as much as we guaranteed you that the data our website collected from you is absolutely save with us. 
                You are perhaps has every right right to request for withdrawal of your data submitted to on our website 
                or Web Application at any time you feel.
              </p>
              <p className="text-gray-600 leading-relaxed font-medium">
                In case such feeling arises at anytime and you want your data withdraw or deleted from our App or website, 
                we provide a streamlined pathway to execute that request.
              </p>
            </div>
          </div>
        </section>

        {/* PROCESS TIMELINE */}
        <section className="mb-16">
          <h3 className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10 italic">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-900 mb-2">{step.title}</h4>
                <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-tight">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="bg-[#002B5B] rounded-[3rem] p-10 md:p-16 text-white text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Submit Deletion Request</h2>
            <p className="text-blue-200 font-medium mb-8 max-w-lg mx-auto">
              Please make your data deletion request by writing to us. Your request will be attended to within 72 hours, 
              after which you will request a confirmation email to the effect of that action.
            </p>
            
            <a 
              href="mailto:contact@marvelmarts.com" 
              className="inline-flex items-center gap-3 px-10 py-5 bg-[#F7931E] hover:bg-orange-600 rounded-2xl text-white font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-orange-950/20"
            >
              Email contact@marvelmarts.com
              <ArrowRight size={16} />
            </a>
          </div>

          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full -ml-20 -mb-20 blur-3xl"></div>
        </section>

        {/* FINAL UPDATED STAMP */}
        <div className="mt-12 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Protocol Effective: June 1, 2021 | Revised March 23, 2026
          </p>
        </div>

      </main>
    </div>
  );
}