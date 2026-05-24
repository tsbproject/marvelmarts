


"use client";

import { useState, FormEvent, ChangeEvent } from "react";

import {
  ArrowRight,
  Clock3,
  MessageSquare,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Paperclip,
  AlertCircle,
} from "lucide-react";

interface SupportTicketFormProps {
  email?: string;
  compact?: boolean;
}

interface TicketPayload {
  email: FormDataEntryValue | null;
  subject: FormDataEntryValue | null;
  category: FormDataEntryValue | null;
  priority: FormDataEntryValue | null;
  message: FormDataEntryValue | null;
  marvel_bot_gate?: string;
}

export default function SupportTicketForm({
  email = "",
  compact = false,
}: SupportTicketFormProps) {

  const [loading, setLoading] =
    useState<boolean>(false);

  const [submitted, setSubmitted] =
    useState<boolean>(false);

  const [message, setMessage] =
    useState<string>("");

  const [error, setError] =
    useState<string>("");

  const [attachmentName, setAttachmentName] =
    useState<string>("");

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);

    setError("");

    const formData = new FormData(e.currentTarget);

    const payload: TicketPayload = {
      email: formData.get("email"),

      subject: formData.get("subject"),

      category:
        formData.get("category") || "GENERAL",

      priority:
        formData.get("priority") || "MEDIUM",

      message: formData.get("message"),

      marvel_bot_gate: "",
    };

    try {

      const response = await fetch(
        "/api/support/tickets",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to submit support ticket."
        );
      }

      setSubmitted(true);

    } catch (err: unknown) {

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Something went wrong while submitting your ticket."
        );
      }

    } finally {
      setLoading(false);
    }
  }

  // SUCCESS STATE
  if (submitted) {
    return (
      <div className="rounded-[2.5rem] border border-green-100 bg-green-50 p-10 text-center animate-in fade-in zoom-in duration-300">

        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto mb-8 shadow-sm">
          <CheckCircle2
            className="text-green-600"
            size={46}
          />
        </div>

        <h3 className="text-3xl font-black italic uppercase tracking-tight text-accent-navy mb-4">
          Ticket Submitted
        </h3>

        <p className="text-sm text-neutral-gray leading-relaxed max-w-lg mx-auto">
          Your support request has been successfully submitted.
          Our support team will review your request shortly.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`
        bg-white border border-gray-100 shadow-sm
        ${
          compact
            ? "rounded-[2rem] p-6"
            : "rounded-[2.5rem] p-8 lg:p-10"
        }
      `}
    >

      <div className="space-y-8">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          <div>
            <h3 className="text-2xl font-black italic uppercase tracking-tight text-accent-navy">
              Submit Support Ticket
            </h3>

            <p className="text-sm text-neutral-gray mt-3 leading-relaxed max-w-2xl">
              Please provide complete information about your
              issue to help our support team resolve your
              request faster.
            </p>
          </div>

          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/10">

            <ShieldAlert
              size={18}
              className="text-brand-primary"
            />

            <span className="text-[10px] uppercase tracking-widest font-black text-brand-primary">
              Secure Ticket Submission
            </span>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-5">

            <AlertCircle
              size={18}
              className="text-red-600 shrink-0 mt-0.5"
            />

            <div>
              <h4 className="text-sm font-black uppercase tracking-wide text-red-700 mb-1">
                Submission Failed
              </h4>

              <p className="text-sm text-red-600 leading-relaxed">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* HONEYPOT */}
        <input
          type="text"
          name="marvel_bot_gate"
          className="hidden"
          autoComplete="off"
          tabIndex={-1}
        />

        {/* TOP GRID */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* CATEGORY */}
          <div>
            <label className="block mb-3 text-[10px] uppercase tracking-widest font-black text-neutral-gray">
              Support Category
            </label>

            <select
              required
              name="category"
              className="
                w-full h-14 rounded-2xl
                border border-gray-200
                bg-[#FBFBFB]
                px-5
                outline-none
                focus:border-brand-primary
                transition-all
              "
            >
              <option value="">
                Select Category
              </option>

              <option value="VERIFICATION">
                Verification Support
              </option>

              <option value="PAYOUT">
                Payout Issue
              </option>

              <option value="PRODUCTS">
                Product Management
              </option>

              <option value="TECHNICAL">
                Technical Support
              </option>

              <option value="ORDERS">
                Orders & Customers
              </option>

              <option value="STORE">
                Store Settings
              </option>
            </select>
          </div>

          {/* PRIORITY */}
          <div>
            <label className="block mb-3 text-[10px] uppercase tracking-widest font-black text-neutral-gray">
              Priority Level
            </label>

            <select
              required
              name="priority"
              className="
                w-full h-14 rounded-2xl
                border border-gray-200
                bg-[#FBFBFB]
                px-5
                outline-none
                focus:border-brand-primary
                transition-all
              "
            >
              <option value="">
                Select Priority
              </option>

              <option value="LOW">
                Low Priority
              </option>

              <option value="MEDIUM">
                Medium Priority
              </option>

              <option value="HIGH">
                High Priority
              </option>

              <option value="URGENT">
                Urgent
              </option>
            </select>
          </div>
        </div>

        {/* EMAIL */}
        <div>
          <label className="block mb-3 text-[10px] uppercase tracking-widest font-black text-neutral-gray">
            Email Address
          </label>

          <input
            required
            type="email"
            name="email"
            defaultValue={email}
            placeholder="Enter your email address"
            className="
              w-full h-14 rounded-2xl
              border border-gray-200
              bg-[#FBFBFB]
              px-5
              outline-none
              focus:border-brand-primary
              transition-all
            "
          />
        </div>

        {/* SUBJECT */}
        <div>
          <label className="block mb-3 text-[10px] uppercase tracking-widest font-black text-neutral-gray">
            Ticket Subject
          </label>

          <input
            required
            type="text"
            name="subject"
            placeholder="Briefly describe your issue"
            className="
              w-full h-14 rounded-2xl
              border border-gray-200
              bg-[#FBFBFB]
              px-5
              outline-none
              focus:border-brand-primary
              transition-all
            "
          />
        </div>

        {/* MESSAGE */}
        <div>

          <div className="flex items-center justify-between mb-3">

            <label className="text-[10px] uppercase tracking-widest font-black text-neutral-gray">
              Detailed Message
            </label>

            <span className="text-[10px] uppercase tracking-widest font-black text-neutral-gray/60">
              {message.length} / 1000
            </span>
          </div>

          <textarea
            required
            name="message"
            rows={8}
            maxLength={1000}
            value={message}
            onChange={(
              e: ChangeEvent<HTMLTextAreaElement>
            ) =>
              setMessage(e.target.value)
            }
            placeholder="Please provide complete details about your issue or request..."
            className="
              w-full rounded-[2rem]
              border border-gray-200
              bg-[#FBFBFB]
              px-5 py-5
              outline-none
              resize-none
              focus:border-brand-primary
              transition-all
            "
          />
        </div>

        {/* ATTACHMENT */}
        <div>

          <label className="block mb-3 text-[10px] uppercase tracking-widest font-black text-neutral-gray">
            Attachment (Optional)
          </label>

          <label
            className="
              block
              border-2 border-dashed border-gray-200
              rounded-[2rem]
              p-8
              bg-[#FBFBFB]
              text-center
              hover:border-brand-primary/30
              transition-all
              cursor-pointer
            "
          >

            <input
              type="file"
              className="hidden"
              onChange={(
                e: ChangeEvent<HTMLInputElement>
              ) => {
                const file =
                  e.target.files?.[0];

                if (file) {
                  setAttachmentName(file.name);
                }
              }}
            />

            <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-5">

              <Paperclip size={28} />
            </div>

            <h4 className="text-lg font-black italic text-accent-navy mb-2">
              Upload Supporting Files
            </h4>

            <p className="text-sm text-neutral-gray leading-relaxed max-w-md mx-auto">
              Upload screenshots, invoices,
              receipts, or verification documents.
            </p>

            {attachmentName && (
              <div className="mt-5 inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-brand-primary/10 text-brand-primary text-[10px] uppercase tracking-widest font-black">

                <MessageSquare size={14} />

                {attachmentName}
              </div>
            )}
          </label>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pt-4 border-t border-gray-100">

          <div className="flex flex-wrap items-center gap-3">

            <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-green-50 text-green-700 text-[10px] uppercase tracking-widest font-black">

              <ShieldAlert size={14} />

              Encrypted Submission
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-blue-50 text-blue-700 text-[10px] uppercase tracking-widest font-black">

              <Clock3 size={14} />

              Ticket Tracking Enabled
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="
              inline-flex items-center justify-center gap-2
              px-8 py-5
              rounded-2xl
              bg-brand-primary
              text-white
              text-[10px]
              uppercase
              tracking-widest
              font-black
              hover:opacity-90
              transition-all
              shadow-lg shadow-orange-100
              disabled:opacity-50
            "
          >
            {loading ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />

                Submitting...
              </>
            ) : (
              <>
                Submit Support Ticket

                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

