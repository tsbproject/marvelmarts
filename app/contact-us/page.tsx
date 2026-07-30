"use client";

import { Suspense } from "react";

import Link from "next/link";

import SupportTicketForm from "@/app/_components/support/SupportTicketForm";

import {
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Mail,
  Clock3,
} from "lucide-react";

function ContactContent() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 items-start">

      {/* LEFT SIDEBAR */}
      <div className="lg:w-[340px] w-full space-y-8 ">

        {/* BACK BUTTON */}
        <div>
          <Link
            href="/support"
            className="
              inline-flex items-center gap-2
              text-[10px]
              font-black
              text-brand-primary
              uppercase
              tracking-[0.3em]
              mb-8
              hover:translate-x-[-4px]
              transition-transform
            "
          >
            <ArrowLeft size={16} />
            Support Center
          </Link>

          <h1 className="text-sm lg:text-3xl font-black text-accent-navy uppercase tracking-tighter mb-5 leading-none italic">
            Contact <br />

            <span className="text-brand-primary">
              Support.
            </span>
          </h1>

          <p className="text-neutral-gray font-medium leading-relaxed text-sm">
            Submit support requests, report technical
            issues, ask marketplace questions, or
            contact our assistance team directly.
          </p>
        </div>

        {/* SUPPORT INFO */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 space-y-5">

          <div className="flex items-start gap-4">

            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-wide text-accent-navy mb-1">
                Encrypted Support
              </h3>

              <p className="text-xs text-neutral-gray leading-relaxed">
                All submissions are securely processed
                and protected.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">

            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Mail size={20} />
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-wide text-accent-navy mb-1">
                Direct Response
              </h3>

              <p className="text-xs text-neutral-gray leading-relaxed">
                Support officers typically respond
                within 24 hours.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">

            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <Clock3 size={20} />
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-wide text-accent-navy mb-1">
                Ticket Tracking
              </h3>

              <p className="text-xs text-neutral-gray leading-relaxed">
                Monitor ticket progress and responses
                directly from your account.
              </p>
            </div>
          </div>
        </div>

        {/* HELP CARD */}
        <div className="bg-gradient-to-br from-accent-navy via-[#0A1E40] to-[#102B5E] rounded-[2rem] p-6 overflow-hidden relative border border-brand-primary/10">

          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-brand-primary/10 blur-3xl" />

          <div className="relative z-10">
            <p className="text-[10px] uppercase tracking-[0.25em] font-black text-white/60 mb-3">
              Priority Assistance
            </p>

            <h3 className="text-2xl font-black italic text-white mb-4 tracking-tight">
              Need Immediate Help?
            </h3>

            <p className="text-sm text-white/70 leading-relaxed">
              Our support specialists are available to
              assist with verification, payouts,
              disputes, technical issues, and account
              concerns.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex-1 w-full space-y-8">

        {/* HERO */}
        <div className="bg-gradient-to-br from-accent-navy via-[#0A1E40] to-[#102B5E] rounded-[2.5rem] p-8 lg:p-10 overflow-hidden relative border border-brand-primary/10">

          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-brand-primary/10 blur-3xl" />

          <div className="relative z-10">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 mb-6">
              <ShieldCheck
                size={15}
                className="text-brand-primary"
              />

              <span className="text-[10px] uppercase tracking-[0.25em] font-black text-white/80">
                Secure Support Channel
              </span>
            </div>

            <h2 className="text-sm md:text-2xl font-black italic uppercase tracking-wide text-white leading-tight">
              We’re Here To Help.
            </h2>

            <p className="mt-6 text-sm md:text-base text-white/70 leading-relaxed max-w-2xl">
              Use the secure support form below to
              contact the MarvelMarts support team.
              Provide complete details to help us
              resolve your request faster.
            </p>
          </div>
        </div>

        {/* REUSABLE SUPPORT FORM */}
        <SupportTicketForm />
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFB] pt-32 pb-20 px-4 lg:px-6">

      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center p-20 gap-4">

            <Loader2
              className="animate-spin text-brand-primary"
              size={40}
            />

            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-gray">
              Loading Support Interface...
            </p>
          </div>
        }
      >
        <ContactContent />
      </Suspense>
    </div>
  );
}