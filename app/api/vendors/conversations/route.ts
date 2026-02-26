import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Ensure vendor is logged in
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // We look for conversations where the vendor's ID is in the participant list
    const conversations = await prisma.conversation.findMany({
      where: {
        participantIds: {
          has: session.user.id
        }
      },
      include: {
        // We include messages to show the content snippet in the inbox
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1 // Only need the most recent one for the preview
        }
      },
      orderBy: {
        updatedAt: 'desc' // Newest conversations at the top
      }
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("INBOX_FETCH_ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}