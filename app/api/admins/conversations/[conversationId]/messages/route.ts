// import { prisma } from "@/app/lib/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import { NextRequest, NextResponse } from "next/server";
// import DOMPurify from "isomorphic-dompurify";
// import { pusherServer } from "@/app/lib/pusherServer";


// export async function POST(
//   req: NextRequest,
//   { params }: { params: Promise<{ conversationId: string }> }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
//     const { conversationId } = await params;
//     const { content } = await req.json();

//     if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const userId = (session.user as any).id;
//     const cleanContent = DOMPurify.sanitize(content);

//     const newMessage = await prisma.$transaction(async (tx) => {
//       const msg = await tx.message.create({
//         data: {
//           content: cleanContent,
//           conversationId,
//           senderId: userId,
//           senderName: session.user.name || "Administrator",
//         },
//       });

//       await tx.conversation.update({
//         where: { id: conversationId },
//         data: { updatedAt: new Date() },
//       });
//       return msg;
//     });

//     // --- PUSHER TRIGGERS ---
    
//     // 1. Notify the specific chat room (updates the bubble for whoever is looking at it)
//     await pusherServer.trigger(conversationId, "new-message", newMessage);

//     // 2. Notify the GLOBAL Admin Support Channel (updates the sidebar list)
//     await pusherServer.trigger("global-admin-support", "incoming-support-message", {
//       conversationId,
//       content: newMessage.content,
//       senderName: newMessage.senderName,
//       createdAt: newMessage.createdAt,
//     });

//     return NextResponse.json(newMessage, { status: 201 });
//   } catch (error: any) {
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }
// /**
//  * GET: Fetch messages for a specific conversation
//  */
// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ conversationId: string }> }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
//     const { conversationId } = await params; // Await params for Next.js 15

//     if (!session?.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const messages = await prisma.message.findMany({
//       where: { conversationId },
//       orderBy: { createdAt: "asc" },
//     });

//     return NextResponse.json(messages);
//   } catch (error: any) {
//     console.error("MESSAGE_GET_ERROR:", error);
//     return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
//   }
// }



import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/app/lib/pusherServer";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { conversationId } = await params;
    
    // 1. Session Check
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Request Body Check
    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    // 3. User ID Mapping (Handling standard NextAuth 'id' vs 'sub')
    const userId = (session.user as any).id || (session.user as any).sub;

    // 4. Prisma Transaction
    const newMessage = await prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          content: content.trim(), // Stripping whitespace
          conversationId,
          senderId: userId,
          senderName: session.user.name || "Administrator",
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });
      return msg;
    });

    // 5. Pusher Triggers (Wrapped in try-catch to prevent Prisma rollback if Pusher fails)
    try {
      await Promise.all([
        pusherServer.trigger(conversationId, "new-message", newMessage),
        pusherServer.trigger("global-admin-support", "incoming-support-message", {
          conversationId,
          content: newMessage.content,
          senderName: newMessage.senderName,
          createdAt: newMessage.createdAt,
        })
      ]);
    } catch (pusherError) {
      console.error("PUSHER_RUNTIME_ERROR:", pusherError);
      // We don't return error here because the message IS saved in DB
    }

    return NextResponse.json(newMessage, { status: 201 });

  } catch (error: any) {
    // This will show up in Vercel Logs (Functions tab)
    console.error("CRITICAL_API_ERROR:", error.message || error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message }, 
      { status: 500 }
    );
  }
}

// GET handler remains the same
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}