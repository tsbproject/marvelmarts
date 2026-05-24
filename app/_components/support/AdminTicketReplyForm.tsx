"use client";

import { useState } from "react";

import {
  Send,
  Loader2,
} from "lucide-react";

import { sendTicketReply }
from "@/app/_actions/supportActions";

export default function AdminTicketReplyForm({
  ticketId,
}: {
  ticketId: string;
}) {

  const [message, setMessage] =
    useState("");

  const [status, setStatus] =
    useState("IN_PROGRESS");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit() {

    if (!message.trim()) return;

    try {

      setLoading(true);

      await sendTicketReply({
        ticketId,

        message,

        status,
      });

      setMessage("");

      alert(
        "Support update sent successfully."
      );

    } catch (error) {

      console.error(error);

      alert(
        "Failed to send update."
      );

    } finally {

      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-4xl p-8 shadow-sm space-y-5">

      <div>
        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
          Respond To Vendor
        </h3>

        <p className="text-sm text-gray-500 font-medium mt-1">
          Send progress updates or resolve the case.
        </p>
      </div>

      <select
        value={status}
        onChange={(e) =>
          setStatus(e.target.value)
        }
        className="
          w-full h-14 px-5 rounded-2xl
          border border-gray-200
          bg-gray-50
          font-bold text-sm
          outline-none
        "
      >
        <option value="IN_PROGRESS">
          In Progress
        </option>

        <option value="OPEN">
          Open
        </option>

        <option value="RESOLVED">
          Resolved
        </option>

        <option value="CLOSED">
          Closed
        </option>
      </select>

      <textarea
        value={message}
        onChange={(e) =>
          setMessage(e.target.value)
        }
        placeholder="Write support response..."
        className="
          w-full min-h-[180px]
          rounded-3xl border border-gray-200
          bg-gray-50 p-5
          outline-none resize-none
          text-sm font-medium text-gray-700
        "
      />

      <button
        disabled={loading}
        onClick={handleSubmit}
        className="
          w-full h-14 rounded-2xl
          bg-blue-600 text-white
          font-black uppercase tracking-widest text-xs
          flex items-center justify-center gap-2
          hover:bg-blue-700 transition-all
          disabled:opacity-50
        "
      >
        {loading ? (
          <>
            <Loader2
              size={16}
              className="animate-spin"
            />

            Sending...
          </>
        ) : (
          <>
            <Send size={16} />

            Send Update
          </>
        )}
      </button>
    </div>
  );
}