import { MessageService } from "@/app/lib/services/message.service";
import { NextResponse } from "next/server";
import { pusherServer } from "@/app/lib/pusherServer";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      email,
      name,
      isVendor,
    } = body;

    const result =
      await MessageService.initiateSupportConversation(
        email,
        name,
        isVendor
      );

    if (!result.userExists) {
      return new NextResponse(
        "User not found. Please use your registered email.",
        {
          status: 404,
        }
      );
    }

    if (!result.adminAvailable) {
      return new NextResponse(
        "Support is currently offline.",
        {
          status: 503,
        }
      );
    }

    if (
  result.created &&
  result.welcomeMessage
) {
  // Notify admin that a new support ticket exists
  await pusherServer.trigger(
    "global-admin-support",
    "new-support-ticket",
    {
      conversationId:
        result.conversation!.id,
      type:
        result.conversation!.type,
      customerName: name,
      customerEmail: email,
    }
  );

  // Deliver the welcome message to the conversation
  await pusherServer.trigger(
    result.conversation!.id,
    "new-message",
    result.welcomeMessage
  );
}

    const conversation = result.conversation!;

    return NextResponse.json({
      conversationId:
       conversation.id,
      type:
        conversation.type,
    });
  } catch (error: any) {
    console.error(
      "--- CHAT INITIATION ERROR ---",
      error.message
    );

    return new NextResponse(
      "Internal Server Error",
      {
        status: 500,
      }
    );
  }
}