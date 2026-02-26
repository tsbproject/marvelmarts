import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { pusherServer } from "@/app/lib/pusherServer";

/**
 * Handles the "Typing..." indicator signal.
 * Triggered by the frontend when a user focuses/types in the message input.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // Params is a Promise in Next.js 15
) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Await params to get the conversationId
    const { id: conversationId } = await context.params;

    // Guard: Only authenticated users can trigger signals
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { typing } = await req.json();
    const userId = (session.user as any).id;

    if (!userId) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 500 });
    }

    // 2. Broadcast the typing status to the specific chat channel
    // Using the channel naming convention 'chat-[id]' as per your code
    await pusherServer.trigger(`chat-${conversationId}`, "typing", {
      userId: userId,
      typing: !!typing, // Ensure boolean
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("TYPING_SIGNAL_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to transmit signal", details: error.message },
      { status: 500 }
    );
  }
}