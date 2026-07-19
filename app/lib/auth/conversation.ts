import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import type { Prisma } from "@prisma/client";

import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

import { requireAuth } from "./guards";
import { hasPermission, isSuperAdmin } from "./authorization";
import {
  forbidden,
  notFound,
  unauthorized,
} from "./errors";

type ConversationWithParticipants =
  Prisma.ConversationGetPayload<{
    select: {
      id: true;
      subject: true;
      type: true;
      status: true;
      isGuest: true;
      visitorName: true;
      visitorEmail: true;
      endedAt: true;
      endedById: true;
      endedByRole: true;
      createdAt: true;
      updatedAt: true;
      participantIds: true;
      guestAccessToken: true;
      deletedByParticipantIds: true;
      participants: {
        select: {
          id: true;
          name: true;
          email: true;
          role: true;
          vendorProfile: {
            select: {
              id: true;
            };
          };
        };
      };
    };
  }>;

/* -------------------------------------------------------------------------- */
/*                              RETURN TYPE                                   */
/* -------------------------------------------------------------------------- */

export interface ConversationAccess {
  session: Session | null;
  userId: string;
  isAdmin: boolean;
  isParticipant: boolean;
  conversation: ConversationWithParticipants;
}

/* -------------------------------------------------------------------------- */
/*                    REQUIRE CONVERSATION ACCESS                             */
/* -------------------------------------------------------------------------- */

export async function requireConversationAccess(
  conversationId: string
): Promise<ConversationAccess> {
  const session = await requireAuth();

  const userId = session.user.id;

  const conversation =
    await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      select: {
        id: true,
        subject: true,
        type: true,
        status: true,
        isGuest: true,
        visitorName: true,
        visitorEmail: true,
        endedAt: true,
        endedById: true,
        endedByRole: true,
        createdAt: true,
        updatedAt: true,
        participantIds: true,
        guestAccessToken: true,
        deletedForUserIds: true,
        deletedByParticipantIds: true,
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            vendorProfile: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

  if (!conversation) {
    throw notFound("Conversation not found.");
  }

  const isParticipant =
    conversation.participantIds.includes(
      userId
    );

  const isAdmin =
    isSuperAdmin(session) ||
    hasPermission(
      session,
      "manageMessages"
    );

  if (!isParticipant && !isAdmin) {
    throw forbidden(
      "You do not have permission to access this conversation."
    );
  }

  if (
    !isAdmin &&
    conversation.deletedByParticipantIds.includes(
      userId
    )
  ) {
    throw notFound(
      "Conversation not available."
    );
  }

  return {
    session,
    userId,
    isAdmin,
    isParticipant,
    conversation,
  };
}

/* -------------------------------------------------------------------------- */
/*                REQUIRE SUPPORT CONVERSATION ACCESS                         */
/* -------------------------------------------------------------------------- */

export async function requireSupportConversationAccess(
  conversationId: string,
  email?: string
): Promise<ConversationAccess> {
  const session =
    await getServerSession(authOptions);

  const conversation =
    await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      select: {
        id: true,
        subject: true,
        type: true,
        status: true,
        isGuest: true,
        visitorName: true,
        visitorEmail: true,
        endedAt: true,
        endedById: true,
        endedByRole: true,
        createdAt: true,
        updatedAt: true,
        participantIds: true,
        deletedByParticipantIds: true,
        guestAccessToken: true,
        deletedForUserIds: true,
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            vendorProfile: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

  if (!conversation) {
    throw notFound(
      "Conversation not found."
    );
  }

  // Logged-in user
  if (session) {
    const userId = session.user.id;

    const isParticipant =
      conversation.participantIds.includes(
        userId
      );

    const isAdmin =
      isSuperAdmin(session) ||
      hasPermission(
        session,
        "manageMessages"
      );

    if (!isParticipant && !isAdmin) {
      throw forbidden(
        "You do not have permission to access this conversation."
      );
    }

    return {
      session,
      userId,
      isAdmin,
      isParticipant,
      conversation,
    };
  }

  // Not logged in
  if (!email?.trim()) {
    throw unauthorized(
      "Email is required."
    );
  }

  const user =
    await prisma.user.findUnique({
      where: {
        email: email
          .trim()
          .toLowerCase(),
      },
    });

  if (!user) {
    throw forbidden(
      "This email is not registered."
    );
  }

  if (
    !conversation.participantIds.includes(
      user.id
    )
  ) {
    throw forbidden(
      "You do not have permission to access this conversation."
    );
  }

  return {
    session: null,
    userId: user.id,
    isAdmin: false,
    isParticipant: true,
    conversation,
  };
}