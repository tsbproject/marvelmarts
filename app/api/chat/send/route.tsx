import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { pusherServer } from "@/app/lib/pusherServer";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    const body = await req.json();
    const {
      content,
      recipientId, // this is vendorProfileId from frontend
      productId,
      productPrice,
      productImage,
      conversationId,
      visitorName,
      visitorEmail,
      guestAccessToken,
    } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    let conversation;
    let vendorUserId: string | null = null;

    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });

      if (!conversation) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
      }

      if (conversation.status === "CLOSED") {
        return NextResponse.json({ error: "This chat has already been ended." }, { status: 403 });
      }

      if (session?.user?.id) {
        if (!conversation.participantIds.includes(session.user.id)) {
          return NextResponse.json({ error: "Unauthorized conversation access" }, { status: 403 });
        }

        vendorUserId =
          conversation.participantIds.find((id) => id !== session.user.id) || null;
      } else {
        if (!conversation.isGuest) {
          return NextResponse.json({ error: "Guest access is not allowed for this chat" }, { status: 403 });
        }

        if (!guestAccessToken || guestAccessToken !== conversation.guestAccessToken) {
          return NextResponse.json({ error: "Invalid guest access token" }, { status: 403 });
        }

        vendorUserId = conversation.participantIds[0] || null;
      }
    } else {
      if (!recipientId) {
        return NextResponse.json({ error: "Vendor recipient is required" }, { status: 400 });
      }

      const vendorProfile = await prisma.vendorProfile.findUnique({
        where: { id: recipientId },
        select: {
          id: true,
          userId: true,
        },
      });

      if (!vendorProfile?.userId) {
        return NextResponse.json({ error: "Vendor account not found" }, { status: 404 });
      }

      vendorUserId = vendorProfile.userId;

      if (session?.user?.id) {
        conversation = await prisma.conversation.create({
          data: {
            participantIds: [session.user.id, vendorUserId],
            type: "CUSTOMER_VENDOR",
            subject: "Product Inquiry",
            isGuest: false,
          },
        });
      } else {
        if (!visitorName?.trim() || !visitorEmail?.trim()) {
          return NextResponse.json(
            { error: "Name and email are required before starting chat" },
            { status: 400 }
          );
        }

        const token = crypto.randomBytes(24).toString("hex");

        conversation = await prisma.conversation.create({
          data: {
            participantIds: [vendorUserId],
            type: "CUSTOMER_VENDOR",
            subject: "Product Inquiry",
            isGuest: true,
            visitorName: visitorName.trim(),
            visitorEmail: visitorEmail.trim().toLowerCase(),
            guestAccessToken: token,
          },
        });
      }
    }

    const senderId = session?.user?.id ?? null;
    const senderName =
      session?.user?.name ||
      conversation.visitorName ||
      visitorName?.trim() ||
      "Guest Customer";

    const newMessage = await prisma.message.create({
      data: {
        content: content.trim(),
        conversationId: conversation.id,
        senderId,
        senderName,
        productId: productId || null,
        productPrice: productPrice || null,
        productImage: productImage || null,
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    await pusherServer.trigger(conversation.id, "new-message", newMessage);

    if (vendorUserId) {
      await pusherServer.trigger(`vendor-${vendorUserId}`, "new-inquiry", {
        conversationId: conversation.id,
        subject: conversation.subject,
        status: conversation.status,
        isGuest: conversation.isGuest,
        visitorName: conversation.visitorName,
        visitorEmail: conversation.visitorEmail,
        lastMessage: newMessage.content,
        unreadCount: 1,
        updatedAt: new Date().toISOString(),
      });

      await pusherServer.trigger(`user-${vendorUserId}`, "new-message", {
        id: newMessage.id,
        content: newMessage.content,
        senderName,
        conversationId: conversation.id,
      });
    }

    return NextResponse.json({
      message: newMessage,
      conversationId: conversation.id,
      guestAccessToken: conversation.guestAccessToken || null,
      status: conversation.status,
    });
  } catch (error: any) {
    console.error("CUSTOMER_SEND_ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to send message" },
      { status: 500 }
    );
  }
}