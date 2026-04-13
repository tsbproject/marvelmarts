// import { prisma } from "@/app/lib/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import { NextResponse } from "next/server";

// /**
//  * TACTICAL UPDATE: In Next.js 16, params must be treated as a Promise.
//  * We also ensure the user is a verified participant before leaking messages.
//  */
// export async function GET(
//   req: Request,
//   { params }: { params: Promise<{ conversationId: string }> }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
    
//     // 1. Resolve params as a Promise (Next.js 16 requirement)
//     const resolvedParams = await params;
//     const conversationId = resolvedParams.conversationId;

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Identity Required" }, { status: 401 });
//     }

//     // 2. Fetch conversation with nested messages
//     const conversation = await prisma.conversation.findUnique({
//       where: {
//         id: conversationId,
//       },
//       include: {
//         messages: {
//           orderBy: {
//             createdAt: "asc",
//           },
//         },
//       },
//     });

//     // 3. Validation
//     if (!conversation) {
//       return NextResponse.json({ error: "Signal Lost: Channel not found" }, { status: 404 });
//     }

//     // 4. Security Check: Participant Authorization
//     // Checks if the logged-in user's ID exists in the participantIds array
//     if (!conversation.participantIds.includes(session.user.id)) {
//       console.warn(`Unauthorized access attempt by ${session.user.id} on channel ${conversationId}`);
//       return NextResponse.json({ error: "Access Denied: Encrypted Channel" }, { status: 403 });
//     }

//     // 5. Success Response
//     // We return the messages array directly so VendorChatPage's (data.messages) works.
//     return NextResponse.json({ 
//       messages: conversation.messages,
//       subject: conversation.subject 
//     });

//   } catch (error) {
//     console.error("FETCH_MESSAGES_ERROR:", error);
//     return NextResponse.json({ error: "System Error: Comms link failed" }, { status: 500 });
//   }
// }



import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { conversationId } = await params;

    const url = new URL(req.url);
    const guestAccessToken = url.searchParams.get("guestAccessToken");

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Signal Lost: Channel not found" }, { status: 404 });
    }

    if (session?.user?.id) {
      if (!conversation.participantIds.includes(session.user.id)) {
        return NextResponse.json({ error: "Access Denied: Encrypted Channel" }, { status: 403 });
      }
    } else {
      if (!conversation.isGuest) {
        return NextResponse.json({ error: "Identity Required" }, { status: 401 });
      }

      if (!guestAccessToken || guestAccessToken !== conversation.guestAccessToken) {
        return NextResponse.json({ error: "Invalid guest access token" }, { status: 403 });
      }
    }

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        subject: conversation.subject,
        status: conversation.status,
        isGuest: conversation.isGuest,
        visitorName: conversation.visitorName,
        visitorEmail: conversation.visitorEmail,
        endedAt: conversation.endedAt,
        endedById: conversation.endedById,
        endedByRole: conversation.endedByRole,
      },
      messages: conversation.messages,
    });
  } catch (error) {
    console.error("FETCH_MESSAGES_ERROR:", error);
    return NextResponse.json({ error: "System Error: Comms link failed" }, { status: 500 });
  }
}