import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextResponse } from "next/server";
import { ConversationType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { targetUserId, type, subject } = await req.json();

    // 1. RESOLVE THE CORRECT USER ID
    // If targetUserId is a vendorProfileId, we must get the associated User
    const vendorRecord = await prisma.vendorProfile.findUnique({
      where: { id: targetUserId },
      select: { userId: true } // Assuming 'userId' is the FK to the User model
    });

    // Fallback: If no vendor found, assume it's a direct User ID (for ADMIN types)
    const actualParticipantId = vendorRecord ? vendorRecord.userId : targetUserId;

    if (!actualParticipantId) {
      return NextResponse.json({ error: "Target participant not found" }, { status: 404 });
    }

    // 2. CHECK EXISTING CONVERSATION
    let conversation = await prisma.conversation.findFirst({
      where: {
        type: type as ConversationType,
        participantIds: { hasEvery: [session.user.id, actualParticipantId] },
      },
    });

    // 3. CREATE IF NEW
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          type: type as ConversationType,
          subject: subject || "Product Inquiry",
          participantIds: [session.user.id, actualParticipantId],
          participants: {
            connect: [
              { id: session.user.id }, 
              { id: actualParticipantId }
            ],
          },
        },
      });
    }

    return NextResponse.json({ conversationId: conversation.id });
  } catch (error: any) {
    console.error("CHAT_INIT_ERROR:", error);
    // Return the error message in JSON to avoid the SyntaxError on frontend
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message 
    }, { status: 500 });
  }
}




