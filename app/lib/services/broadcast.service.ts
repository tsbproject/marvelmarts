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