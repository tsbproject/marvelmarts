"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  CheckCheck,
  Megaphone,
  RefreshCw,
} from "lucide-react";
import { getPusherClient } from "@/app/lib/pusherClient";
import { useSession } from "next-auth/react";

type Broadcast = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function CommunicationsPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const response = await fetch("/api/communications", {
        cache: "no-store",
      });

      if (!response.ok) return;

      const data = await response.json();
      setItems(Array.isArray(data?.broadcasts) ? data.broadcasts : []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();

    if (!session?.user?.id) return;

    const client = getPusherClient();
    const channelName = `user-${session.user.id}`;
    const channel = client.subscribe(channelName);

    const onBroadcast = (data: any) => {
      const incoming: Broadcast = {
        id: `live-${Date.now()}`,
        title: data?.title || "MarvelMarts Announcement",
        message: data?.message || "",
        isRead: false,
        createdAt: data?.createdAt || new Date().toISOString(),
      };

      setItems((current) => [incoming, ...current]);
    };

    channel.bind("broadcast-message", onBroadcast);

    return () => {
      channel.unbind("broadcast-message", onBroadcast);
      client.unsubscribe(channelName);
    };
  }, [load, session?.user?.id]);

  async function markRead(id: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, isRead: true } : item
      )
    );

    if (!id.startsWith("live-")) {
      await fetch("/api/communications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
    }
  }

  async function markAllRead() {
    setItems((current) =>
      current.map((item) => ({ ...item, isRead: true }))
    );

    await fetch("/api/communications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
  }

  const unread = items.filter((item) => !item.isRead).length;

  return (
    <div className="max-w-4xl mx-auto p-5 sm:p-8 lg:p-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#002B5B] text-white flex items-center justify-center shadow-lg">
              <Megaphone size={23} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#002B5B] uppercase tracking-tight">
                MarvelMarts Communications
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1">
                Official announcements from MarvelMarts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="p-3 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-[#002B5B] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
          </button>

          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-2 rounded-xl bg-[#002B5B] text-white px-4 py-3 text-[10px] font-black uppercase tracking-widest"
            >
              <CheckCheck size={15} />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="rounded-[2rem] bg-white border border-gray-100 p-12 text-center">
          <RefreshCw size={24} className="animate-spin mx-auto text-[#F7931E]" />
          <p className="text-sm font-bold text-gray-400 mt-4">
            Loading communications...
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[2rem] bg-white border border-gray-100 p-14 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto">
            <Bell size={28} className="text-gray-300" />
          </div>
          <h2 className="text-lg font-black text-[#002B5B] mt-5">
            No announcements yet
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Official marketplace communications will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              onClick={() => !item.isRead && markRead(item.id)}
              className={`rounded-[2rem] border p-5 sm:p-6 shadow-sm transition-all cursor-pointer ${
                item.isRead
                  ? "bg-white border-gray-100"
                  : "bg-orange-50/40 border-orange-100 shadow-md"
              }`}
            >
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#002B5B] text-white flex items-center justify-center shrink-0">
                  <Megaphone size={19} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <h2 className="font-black text-[#002B5B] text-base sm:text-lg">
                      {item.title}
                    </h2>
                    <time className="text-[10px] font-bold text-gray-400 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleString()}
                    </time>
                  </div>

                  <p className="mt-3 text-sm text-gray-600 leading-7 whitespace-pre-wrap">
                    {item.message}
                  </p>

                  {!item.isRead && (
                    <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#F7931E]">
                      <span className="w-2 h-2 rounded-full bg-[#F7931E]" />
                      Unread
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}