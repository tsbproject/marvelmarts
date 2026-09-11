$ErrorActionPreference = "Stop"

$root = Get-Location
Write-Host "MarvelMarts Broadcast Communications installer" -ForegroundColor Cyan
Write-Host "Working directory: $root"

function Write-Utf8NoBom([string]$Path, [string]$Content) {
    $full = Join-Path $root $Path
    $dir = Split-Path $full -Parent
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    $utf8 = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($full, $Content, $utf8)
}

function Backup-Once([string]$Path) {
    $full = Join-Path $root $Path
    if (Test-Path $full) {
        $backup = "$full.broadcast-backup"
        if (!(Test-Path $backup)) {
            Copy-Item $full $backup
            Write-Host "Backup: $backup" -ForegroundColor DarkGray
        }
    }
}

function Replace-Required([string]$Path, [string]$Old, [string]$New, [string]$Description) {
    $full = Join-Path $root $Path
    $content = Get-Content $full -Raw
    if (!$content.Contains($Old)) {
        throw "Could not find expected insertion point for $Description in $Path. No change was made to that file."
    }
    $content = $content.Replace($Old, $New)
    Write-Utf8NoBom $Path $content
    Write-Host "Updated: $Path ($Description)" -ForegroundColor Green
}

# ---------------------------------------------------------------------------
# 1. Broadcast service
# ---------------------------------------------------------------------------
Write-Utf8NoBom "app/lib/services/broadcast.service.ts" @'
import { UserRole } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { pusherServer } from "@/app/lib/pusherServer";

export type BroadcastAudience = "CUSTOMERS" | "VENDORS";

const PUSHER_BATCH_SIZE = 50;
const RECIPIENT_BATCH_SIZE = 500;
const MAX_TITLE_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 5000;

function validateInput(title: string, message: string) {
  const cleanTitle = title.trim();
  const cleanMessage = message.trim();

  if (!cleanTitle) throw new Error("Broadcast title is required.");
  if (!cleanMessage) throw new Error("Broadcast message is required.");

  if (cleanTitle.length > MAX_TITLE_LENGTH) {
    throw new Error(
      `Broadcast title must be ${MAX_TITLE_LENGTH} characters or fewer.`
    );
  }

  if (cleanMessage.length > MAX_MESSAGE_LENGTH) {
    throw new Error(
      `Broadcast message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`
    );
  }

  return { cleanTitle, cleanMessage };
}

function audienceRole(audience: BroadcastAudience) {
  return audience === "CUSTOMERS" ? UserRole.CUSTOMER : UserRole.VENDOR;
}

export async function sendBroadcast(params: {
  audience: BroadcastAudience;
  title: string;
  message: string;
}) {
  const { cleanTitle, cleanMessage } = validateInput(
    params.title,
    params.message
  );

  const recipients = await prisma.user.findMany({
    where: {
      roles: { has: audienceRole(params.audience) },
      isSuspended: false,
    },
    select: { id: true },
  });

  if (recipients.length === 0) {
    return { recipientCount: 0 };
  }

  const createdAt = new Date();

  for (
    let index = 0;
    index < recipients.length;
    index += RECIPIENT_BATCH_SIZE
  ) {
    const batch = recipients.slice(index, index + RECIPIENT_BATCH_SIZE);

    await prisma.notification.createMany({
      data: batch.map(({ id }) => ({
        userId: id,
        type: "broadcast",
        title: cleanTitle,
        message: cleanMessage,
        link: "/account/communications",
        createdAt,
      })),
    });
  }

  const payload = {
    type: "broadcast",
    title: cleanTitle,
    message: cleanMessage,
    audience: params.audience,
    createdAt: createdAt.toISOString(),
  };

  for (
    let index = 0;
    index < recipients.length;
    index += PUSHER_BATCH_SIZE
  ) {
    const channels = recipients
      .slice(index, index + PUSHER_BATCH_SIZE)
      .map(({ id }) => `user-${id}`);

    try {
      await pusherServer.trigger(channels, "broadcast-message", payload);
    } catch (error) {
      // Database delivery is authoritative. Realtime failure should not
      // invalidate a successfully persisted broadcast.
      console.error("[BROADCAST_PUSHER_ERROR]", error);
    }
  }

  return { recipientCount: recipients.length };
}

export async function getUserBroadcasts(userId: string) {
  return prisma.notification.findMany({
    where: {
      userId,
      type: "broadcast",
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function markBroadcastRead(
  userId: string,
  notificationId: string
) {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
      type: "broadcast",
    },
    data: { isRead: true },
  });
}

export async function markAllBroadcastsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      type: "broadcast",
      isRead: false,
    },
    data: { isRead: true },
  });
}
'@

# ---------------------------------------------------------------------------
# 2. API route
# ---------------------------------------------------------------------------
Write-Utf8NoBom "app/api/communications/route.ts" @'
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";

import { authOptions } from "@/app/lib/auth";
import {
  getUserBroadcasts,
  markAllBroadcastsRead,
  markBroadcastRead,
  sendBroadcast,
  type BroadcastAudience,
} from "@/app/lib/services/broadcast.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAdminSession(session: any) {
  const role = session?.user?.role;
  return (
    role === UserRole.SUPER_ADMIN ||
    role === UserRole.ADMIN ||
    session?.user?.admin?.manageMessages === true
  );
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const broadcasts = await getUserBroadcasts(session.user.id);

  return NextResponse.json({
    broadcasts: broadcasts.map((item) => ({
      id: item.id,
      title: item.title,
      message: item.message,
      isRead: item.isRead,
      createdAt: item.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!isAdminSession(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();

    const audience = body?.audience as BroadcastAudience;
    const title = typeof body?.title === "string" ? body.title : "";
    const message = typeof body?.message === "string" ? body.message : "";

    if (audience !== "CUSTOMERS" && audience !== "VENDORS") {
      return NextResponse.json(
        { error: "Audience must be CUSTOMERS or VENDORS." },
        { status: 400 }
      );
    }

    const result = await sendBroadcast({
      audience,
      title,
      message,
    });

    return NextResponse.json({
      success: true,
      audience,
      recipientCount: result.recipientCount,
    });
  } catch (error: any) {
    console.error("[BROADCAST_SEND_ERROR]", error);

    return NextResponse.json(
      { error: error?.message || "Unable to send broadcast." },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body?.all === true) {
      await markAllBroadcastsRead(session.user.id);
      return NextResponse.json({ success: true });
    }

    const notificationId =
      typeof body?.notificationId === "string"
        ? body.notificationId
        : "";

    if (!notificationId) {
      return NextResponse.json(
        { error: "notificationId is required." },
        { status: 400 }
      );
    }

    await markBroadcastRead(session.user.id, notificationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[BROADCAST_READ_ERROR]", error);

    return NextResponse.json(
      { error: "Unable to update broadcast read state." },
      { status: 500 }
    );
  }
}
'@

# ---------------------------------------------------------------------------
# 3. Admin broadcast center
# ---------------------------------------------------------------------------
Write-Utf8NoBom "app/dashboard/admins/communications/page.tsx" @'
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
        `Broadcast sent successfully to ${data.recipientCount.toLocaleString()} ${
          audience === "CUSTOMERS" ? "customers" : "vendors"
        }.`
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
'@

# ---------------------------------------------------------------------------
# 4. Shared customer/vendor inbox
# ---------------------------------------------------------------------------
Write-Utf8NoBom "app/account/communications/page.tsx" @'
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
'@

# ---------------------------------------------------------------------------
# 5. Add navigation entries without overwriting existing layouts
# ---------------------------------------------------------------------------
Backup-Once "app/account/layout.tsx"
Backup-Once "app/dashboard/admins/AdminLayoutClient.tsx"

function Read-Utf8NoBom([string]$Path) {
    $full = Join-Path $root $Path
    return [System.IO.File]::ReadAllText($full, [System.Text.UTF8Encoding]::new($false))
}

function Add-OnceRegex([string]$Path, [string]$Pattern, [string]$Replacement, [string]$Description) {
    $full = Join-Path $root $Path
    $content = Read-Utf8NoBom $Path

    if ($content -match $Pattern) {
        Write-Host "Skipped: $Description already exists" -ForegroundColor DarkGray
        return
    }

    $updated = [regex]::Replace($content, $Pattern, $Replacement, 1)
    if ($updated -eq $content) {
        throw "Could not find expected insertion point for $Description in $Path. No change was made to that file."
    }

    Write-Utf8NoBom $Path $updated
    Write-Host "Updated: $Path ($Description)" -ForegroundColor Green
}

# The first failed run may have rewritten account/layout.tsx with mojibake
# separators. Restore the pristine backup before applying the final patch.
$accountPath = Join-Path $root "app/account/layout.tsx"
$accountBackup = "$accountPath.broadcast-backup"
if (Test-Path $accountBackup) {
    Copy-Item $accountBackup $accountPath -Force
    Write-Host "Restored: app/account/layout.tsx from broadcast backup" -ForegroundColor DarkGray
}

# Customer + vendor both use the shared Communications inbox.
$customerNavReplacement = '$1' + "`r`n" + '      {' + "`r`n" +
    '        label: "Communications",' + "`r`n" +
    '        href: "/account/communications",' + "`r`n" +
    '        icon: <MessageCircle size={16} />,' + "`r`n" +
    '        visible: true,' + "`r`n" +
    '      },'

Add-OnceRegex `
    "app/account/layout.tsx" `
    '(?s)(label:\s*"My Orders".*?visible:\s*true,\s*\},)' `
    $customerNavReplacement `
    "customer Communications navigation"

$vendorNavReplacement = '$1' + "`r`n" + '      {' + "`r`n" +
    '        label: "Communications",' + "`r`n" +
    '        href: "/account/communications",' + "`r`n" +
    '        icon: <MessageCircle size={16} />,' + "`r`n" +
    '        visible: true,' + "`r`n" +
    '      },'

Add-OnceRegex `
    "app/account/layout.tsx" `
    '(?s)(label:\s*"Live Chat".*?href:\s*"/account/vendor/messages".*?visible:\s*true,\s*\},)' `
    $vendorNavReplacement `
    "vendor Communications navigation"

# Add MessageCircle to account lucide import if needed.
$messageImportReplacement = '$1' + "`r`n" + '  MessageCircle,'
Add-OnceRegex `
    "app/account/layout.tsx" `
    '(?s)(import\s*\{\s*.*?BarChart3,)' `
    $messageImportReplacement `
    "MessageCircle import"

# Admin layout: add Megaphone import and navigation.
$megaphoneImportReplacement = '$1' + "`r`n" + '  Megaphone,'
Add-OnceRegex `
    "app/dashboard/admins/AdminLayoutClient.tsx" `
    '(?s)(import\s*\{.*?MessageCircle,)' `
    $megaphoneImportReplacement `
    "Megaphone import"

$adminNavReplacement = '$1' + "`r`n`r`n" + '        {' + "`r`n" +
    '          label: "Broadcast Communications",' + "`r`n" +
    '          href: "/dashboard/admins/communications",' + "`r`n" +
    '          icon: (' + "`r`n" +
    '            <Megaphone size={16} />' + "`r`n" +
    '          ),' + "`r`n" +
    '        },'

Add-OnceRegex `
    "app/dashboard/admins/AdminLayoutClient.tsx" `
    '(?s)(label:\s*"Live Chat".*?href:\s*"/dashboard/admins/support/messages".*?\},)' `
    $adminNavReplacement `
    "admin Communications navigation"

Write-Host ""
Write-Host "Broadcast Communications installation completed." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. npx prisma generate"
Write-Host "  2. npm run lint"
Write-Host "  3. npm run build"
Write-Host ""
Write-Host "Routes:" -ForegroundColor Cyan
Write-Host "  Admin:    /dashboard/admins/communications"
Write-Host "  Customer: /account/communications"
Write-Host "  Vendor:   /account/communications"
Write-Host ""
Write-Host "No Prisma schema or migration change was required: broadcasts are persisted through the existing Notification model." -ForegroundColor DarkGray
