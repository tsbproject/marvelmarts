import { NextResponse } from "next/server";
import { MessageService } from "@/app/lib/services/message.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const conversations =
      await MessageService.getConversations(
        session.user.id,
        type
      );

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("CONV_LIST_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to load threads" },
      { status: 500 }
    );
  }
}