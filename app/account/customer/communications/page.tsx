"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  RefreshCw,
  Search,
  Trash2,
  X,
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

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const PAGE_SIZE = 10;

export default function CommunicationsPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<Broadcast[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(
    async (page = 1, query = activeSearch, silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(PAGE_SIZE),
          context: "CUSTOMER",
        });

        if (query.trim()) {
          params.set("search", query.trim());
        }

        const response = await fetch(
          `/api/communications?${params.toString()}`,
          { cache: "no-store" }
        );

        if (!response.ok) return;

        const data = await response.json();

        setItems(
          Array.isArray(data?.broadcasts) ? data.broadcasts : []
        );
        setPagination(
          data?.pagination ?? {
            page,
            pageSize: PAGE_SIZE,
            total: 0,
            totalPages: 1,
          }
        );
        setUnreadCount(
          Number(data?.unreadCount || 0)
        );
        setSelected([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeSearch]
  );

  useEffect(() => {
    load(1, activeSearch);
  }, [load, activeSearch]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const client = getPusherClient();
    const channelName = `user-${session.user.id}-customer`;
    const channel = client.subscribe(channelName);
    const onBroadcast = () => {
      // The database notification is authoritative. Refresh the inbox so
      // realtime announcements use the persisted notification ID and state.
      void load(1, activeSearch, true);
    };

    channel.bind("broadcast-message", onBroadcast);

    return () => {
      channel.unbind("broadcast-message", onBroadcast);
      client.unsubscribe(channelName);
    };
  }, [session?.user?.id]);

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
        body: JSON.stringify({
          notificationId: id,
          context: "CUSTOMER",
        }),
      });

      setUnreadCount((current) => Math.max(0, current - 1));
    } else {
      setUnreadCount((current) => Math.max(0, current - 1));
    }
  }

  async function markAllRead() {
    setItems((current) =>
      current.map((item) => ({ ...item, isRead: true }))
    );
    setUnreadCount(0);

    await fetch("/api/communications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        all: true,
        context: "CUSTOMER",
      }),
    });
  }

  async function deleteSelected(ids: string[]) {
    if (!ids.length || deleting) return;

    setDeleting(true);

    try {
      const persistedIds = ids.filter(
        (id) => !id.startsWith("live-")
      );

      if (persistedIds.length) {
        const response = await fetch("/api/communications", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notificationIds: persistedIds,
            context: "CUSTOMER",
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(
            data?.error || "Unable to delete communication(s)."
          );
        }
      }

      const deletedUnread = items.filter(
        (item) => ids.includes(item.id) && !item.isRead
      ).length;

      setItems((current) =>
        current.filter((item) => !ids.includes(item.id))
      );
      setSelected([]);
      setUnreadCount((current) =>
        Math.max(0, current - deletedUnread)
      );
      setPagination((current) => ({
        ...current,
        total: Math.max(0, current.total - ids.length),
      }));

      if (
        items.length === ids.length &&
        pagination.page > 1
      ) {
        await load(pagination.page - 1, activeSearch, true);
      }
    } catch (error: any) {
      window.alert(
        error?.message || "Unable to delete communication(s)."
      );
    } finally {
      setDeleting(false);
    }
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveSearch(search.trim());
  }

  function clearSearch() {
    setSearch("");
    setActiveSearch("");
  }

  const allVisibleSelected =
    items.length > 0 &&
    items.every((item) => selected.includes(item.id));

  const selectedUnreadCount = useMemo(
    () =>
      items.filter(
        (item) =>
          selected.includes(item.id) && !item.isRead
      ).length,
    [items, selected]
  );

  const pageStart =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) * pagination.pageSize + 1;
  const pageEnd = Math.min(
    pagination.page * pagination.pageSize,
    pagination.total
  );

  return (
    <div className="max-w-5xl mx-auto p-5 sm:p-8 lg:p-10">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
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
          {unreadCount > 0 && (
            <span className="inline-flex items-center gap-2 rounded-xl bg-orange-50 border border-orange-100 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#C76A00]">
              <Bell size={15} />
              {unreadCount.toLocaleString()} unread
            </span>
          )}

          <button
            onClick={() => load(pagination.page, activeSearch, true)}
            disabled={refreshing}
            className="p-3 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-[#002B5B] transition-colors"
            title="Refresh"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
          </button>

          {unreadCount > 0 && (
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

      <form
        onSubmit={submitSearch}
        className="mb-5 rounded-2xl bg-white border border-gray-100 shadow-sm p-3 flex gap-2"
      >
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search communications..."
            className="w-full rounded-xl bg-gray-50 border border-transparent pl-11 pr-4 py-3 outline-none focus:bg-white focus:border-[#F7931E] font-semibold text-[#002B5B]"
          />
        </div>

        <button
          type="submit"
          className="rounded-xl bg-[#002B5B] text-white px-5 py-3 text-[10px] font-black uppercase tracking-widest"
        >
          Search
        </button>

        {activeSearch && (
          <button
            type="button"
            onClick={clearSearch}
            className="rounded-xl border border-gray-200 bg-white px-4 text-gray-500"
            title="Clear search"
          >
            <X size={17} />
          </button>
        )}
      </form>

      {items.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white border border-gray-100 shadow-sm px-4 py-3">
          <label className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={(event) =>
                setSelected(
                  event.target.checked
                    ? items.map((item) => item.id)
                    : []
                )
              }
              className="h-4 w-4 accent-[#002B5B]"
            />
            Select page
          </label>

          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    `Delete ${selected.length} selected communication${
                      selected.length === 1 ? "" : "s"
                    }?`
                  )
                ) {
                  void deleteSelected(selected);
                }
              }}
              disabled={deleting}
              className="inline-flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
            >
              <Trash2 size={15} />
              {deleting ? "Deleting..." : `Delete selected (${selected.length})`}
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="rounded-[2rem] bg-white border border-gray-100 p-12 text-center">
          <RefreshCw
            size={24}
            className="animate-spin mx-auto text-[#F7931E]"
          />
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
            {activeSearch ? "No matching announcements" : "No announcements yet"}
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {activeSearch
              ? "Try another search term."
              : "Official marketplace communications will appear here."}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                onClick={() =>
                  !item.isRead && markRead(item.id)
                }
                className={`rounded-[2rem] border p-5 sm:p-6 shadow-sm transition-all ${
                  item.isRead
                    ? "bg-white border-gray-100"
                    : "bg-orange-50/40 border-orange-100 shadow-md"
                }`}
              >
                <div className="flex gap-4">
                  <div
                    className="pt-1"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(item.id)}
                      onChange={(event) =>
                        setSelected((current) =>
                          event.target.checked
                            ? [...current, item.id]
                            : current.filter(
                                (id) => id !== item.id
                              )
                        )
                      }
                      className="h-4 w-4 accent-[#002B5B]"
                      aria-label={`Select ${item.title}`}
                    />
                  </div>

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

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      {!item.isRead ? (
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#F7931E]">
                          <span className="w-2 h-2 rounded-full bg-[#F7931E]" />
                          Unread
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                          <CheckCheck size={13} />
                          Read
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (
                            window.confirm(
                              "Delete this communication from your dashboard?"
                            )
                          ) {
                            void deleteSelected([item.id]);
                          }
                        }}
                        disabled={deleting}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-700 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-white border border-gray-100 shadow-sm px-4 py-4">
            <p className="text-xs font-semibold text-gray-500">
              Showing{" "}
              <span className="font-black text-[#002B5B]">
                {pageStart.toLocaleString()}-{pageEnd.toLocaleString()}
              </span>{" "}
              of{" "}
              <span className="font-black text-[#002B5B]">
                {pagination.total.toLocaleString()}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1 || loading}
                onClick={() =>
                  load(
                    pagination.page - 1,
                    activeSearch
                  )
                }
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#002B5B] disabled:opacity-40"
              >
                <ChevronLeft size={15} />
                Previous
              </button>

              <span className="min-w-24 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={
                  pagination.page >= pagination.totalPages ||
                  loading
                }
                onClick={() =>
                  load(
                    pagination.page + 1,
                    activeSearch
                  )
                }
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#002B5B] disabled:opacity-40"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {selectedUnreadCount > 0 && (
            <p className="mt-3 text-center text-[10px] font-bold text-gray-400">
              {selectedUnreadCount} selected announcement
              {selectedUnreadCount === 1 ? "" : "s"} unread
            </p>
          )}
        </>
      )}
    </div>
  );
}
