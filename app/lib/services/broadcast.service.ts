import { NotificationContext, UserRole } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { pusherServer } from "@/app/lib/pusherServer";
import { sendBroadcastEmails } from "@/app/lib/mail/services/communications.service";

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

function audienceContext(
  audience: BroadcastAudience
): NotificationContext {
  return audience === "CUSTOMERS"
    ? NotificationContext.CUSTOMER
    : NotificationContext.VENDOR;
}

function communicationsLink(
  context: NotificationContext
) {
  return context === NotificationContext.CUSTOMER
    ? "/account/customer/communications"
    : "/account/vendor/communications";
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

  const context = audienceContext(params.audience);

  const recipients = await prisma.user.findMany({
    where: {
      roles: { has: audienceRole(params.audience) },
      isSuspended: false,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  if (recipients.length === 0) {
    return {
      recipientCount: 0,
      emailSentCount: 0,
      emailFailedCount: 0,
    };
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
        link: communicationsLink(context),
        context,
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
      .map(({ id }) => `user-${id}-${context.toLowerCase()}`);

    try {
      await pusherServer.trigger(channels, "broadcast-message", payload);
    } catch (error) {
      // Database delivery is authoritative. Realtime failure should not
      // invalidate a successfully persisted broadcast.
      console.error("[BROADCAST_PUSHER_ERROR]", error);
    }
  }

  const emailResult = await sendBroadcastEmails(
    recipients.map(({ email, name }) => ({ email, name })),
    {
      title: cleanTitle,
      message: cleanMessage,
      context,
    }
  );

  return {
    recipientCount: recipients.length,
    emailSentCount: emailResult.sent,
    emailFailedCount: emailResult.failed,
  };
}

export async function getUserBroadcasts(params: {
  userId: string;
  context: NotificationContext;
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  const page = Math.max(1, Math.floor(params.page || 1));
  const pageSize = Math.min(
    50,
    Math.max(1, Math.floor(params.pageSize || 10))
  );
  const search = params.search?.trim() || "";

  const where = {
    userId: params.userId,
    type: "broadcast",
    context: params.context,
    ...(search
      ? {
          OR: [
            {
              title: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              message: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const [total, unreadCount, broadcasts] = await prisma.$transaction([
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: {
        userId: params.userId,
        type: "broadcast",
        context: params.context,
        isRead: false,
      },
    }),
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    broadcasts,
    total,
    unreadCount,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function markBroadcastRead(
  userId: string,
  notificationId: string,
  context: NotificationContext
) {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
      type: "broadcast",
      context,
    },
    data: { isRead: true },
  });
}

export async function markAllBroadcastsRead(
  userId: string,
  context: NotificationContext
) {
  return prisma.notification.updateMany({
    where: {
      userId,
      type: "broadcast",
      context,
      isRead: false,
    },
    data: { isRead: true },
  });
}

export async function deleteBroadcasts(
  userId: string,
  notificationIds: string[],
  context: NotificationContext
) {
  const ids = [...new Set(notificationIds.filter(Boolean))];

  if (ids.length === 0) {
    return { deletedCount: 0 };
  }

  const result = await prisma.notification.deleteMany({
    where: {
      id: { in: ids },
      userId,
      type: "broadcast",
      context,
    },
  });

  return { deletedCount: result.count };
}
