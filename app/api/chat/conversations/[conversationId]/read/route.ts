import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const resolvedParams = await params;
    const conversationId = resolvedParams.conversationId;

    // GENTLE CORRECTION: Always return JSON for Client Components to parse safely
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Mark all messages from the OTHER person as read
    const updateResult = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: session.user.id },
        isRead: false
      },
      data: { isRead: true }
    });

    // 2. Return a proper JSON object
    return NextResponse.json({ 
      success: true, 
      count: updateResult.count 
    }, { status: 200 });

  } catch (error) {
    console.error("READ_STATUS_ERROR:", error);
    // Returning JSON here prevents the "Unexpected token" error on the client
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}