import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { pusherServer } from "@/app/lib/pusherServer";

/**
 * Handles the "Typing..." indicator signal.
 * Triggered by the frontend when a user focuses/types in the message input.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Guard: Only authenticated users can trigger signals
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { typing } = await req.json();
    const conversationId = params.id;

    // Broadcast the typing status to the specific chat channel
    // The frontend listens for this to show/hide the three-dot animation
    await pusherServer.trigger(`chat-${conversationId}`, "typing", {
      userId: session.user.id,
      typing: !!typing, // Ensure boolean
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("TYPING_SIGNAL_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to transmit signal" },
      { status: 500 }
    );
  }
}