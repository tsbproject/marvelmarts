import type { Session } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import type { Prisma } from "@prisma/client";
import { requireAuth } from "./guards";
import { hasPermission, isSuperAdmin } from "./authorization";
import { forbidden, notFound } from "./errors";


type ConversationWithParticipants =
  Prisma.ConversationGetPayload<{
    select: {
      id: true;
      status: true;
      participantIds: true;
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
  session: Session;

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

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    select: {
      id: true,
      status: true,
      participantIds: true,
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

  const participantIds =
    conversation.participantIds ?? [];

  const deletedByParticipantIds =
    conversation.deletedByParticipantIds ?? [];

  const isParticipant =
    participantIds.includes(userId);

  const isAdmin =
    isSuperAdmin(session) ||
    hasPermission(session, "manageMessages");

  if (!isParticipant && !isAdmin) {
    throw forbidden(
      "You do not have permission to access this conversation."
    );
  }

  if (
    !isAdmin &&
    deletedByParticipantIds.includes(userId)
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