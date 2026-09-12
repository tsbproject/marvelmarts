"use client";

import { FormEvent, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Megaphone,
  Send,
  Users,
  Store,
} from "lucide-react";

type Audience = "CUSTOMERS" | "VENDORS";

export default function AdminCommunicationsPage() {
  const [audience, setAudience] = useState<Audience>("CUSTOMERS");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSending(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audience, title, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to send broadcast.");
      }

      setResult(
        `Broadcast delivered to ${data.recipientCount.toLocaleString()} ${
          audience === "CUSTOMERS" ? "customers" : "vendors"
        }. Email notifications: ${Number(data.emailSentCount || 0).toLocaleString()} sent, ${Number(
          data.emailFailedCount || 0
        ).toLocaleString()} failed.`
      );
      setTitle("");
      setMessage("");
    } catch (err: any) {
      setError(err?.message || "Unable to send broadcast.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-10">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#002B5B] text-white flex items-center justify-center shadow-lg">
            <Megaphone size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#002B5B] uppercase tracking-tight">
              Broadcast Communications
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Send one marketplace announcement to every customer or vendor.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 lg:p-8"
      >
        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">
            Select audience
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setAudience("CUSTOMERS")}
              className={`text-left rounded-2xl border-2 p-5 transition-all ${
                audience === "CUSTOMERS"
                  ? "border-[#F7931E] bg-orange-50/50 shadow-md"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users size={21} />
                </div>
                <div>
                  <div className="font-black text-[#002B5B]">All Customers</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Marketplace customers with the CUSTOMER role
                  </div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAudience("VENDORS")}
              className={`text-left rounded-2xl border-2 p-5 transition-all ${
                audience === "VENDORS"
                  ? "border-[#F7931E] bg-orange-50/50 shadow-md"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Store size={21} />
                </div>
                <div>
                  <div className="font-black text-[#002B5B]">All Vendors</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Marketplace vendors with the VENDOR role
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              Announcement title
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              required
              placeholder="e.g. Important Marketplace Update"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 outline-none focus:border-[#F7931E] focus:ring-4 focus:ring-orange-50 font-semibold text-[#002B5B]"
            />
          </label>

          <label className="block">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              Message
            </span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={5000}
              required
              rows={9}
              placeholder="Write the announcement..."
              className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 outline-none focus:border-[#F7931E] focus:ring-4 focus:ring-orange-50 font-medium text-gray-700 leading-relaxed resize-y"
            />
            <div className="text-right text-[10px] text-gray-400 mt-1">
              {message.length.toLocaleString()} / 5,000
            </div>
          </label>
        </div>

        <div className="mt-7 rounded-2xl bg-amber-50 border border-amber-100 p-4 flex gap-3">
          <AlertTriangle
            size={19}
            className="text-amber-600 shrink-0 mt-0.5"
          />
          <p className="text-xs text-amber-800 font-semibold leading-relaxed">
            This sends an in-app communication to every non-suspended user in
            the selected audience. It does not create or modify a direct chat
            conversation.
          </p>
        </div>

        {result && (
          <div className="mt-5 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 flex gap-3 text-emerald-700">
            <CheckCircle2 size={19} className="shrink-0" />
            <p className="text-sm font-bold">{result}</p>
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-2xl bg-red-50 border border-red-100 p-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-7 flex justify-end">
          <button
            type="submit"
            disabled={sending || !title.trim() || !message.trim()}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#002B5B] text-white px-7 py-4 font-black uppercase tracking-widest text-xs shadow-lg hover:bg-[#003d7d] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={17} />
            {sending ? "Sending..." : `Send to All ${audience === "CUSTOMERS" ? "Customers" : "Vendors"}`}
          </button>
        </div>
      </form>
    </div>
  );
}