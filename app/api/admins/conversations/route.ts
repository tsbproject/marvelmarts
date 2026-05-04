import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const conversations = await prisma.conversation.findMany({
      where: {
        participantIds: {
          has: session.user.id,
        },
        NOT: {
          deletedByParticipantIds: {
            has: session.user.id,
          },
        },
        ...(type && { type: type as any }),
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            role: true,
            vendorProfile: {
              select: { id: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("CONV_LIST_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to load threads" },
      { status: 500 }
    );
  }
}