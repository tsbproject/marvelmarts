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