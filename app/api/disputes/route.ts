import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth";
import { sendAdminAlert } from "@/app/lib/mailer";
import { pusherServer } from "@/app/lib/pusherServer";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { orderId, reason, description, vendorName, vendorProfileId } = await req.json();

    // 1. Create the Dispute record in Prisma
    const dispute = await prisma.dispute.create({
      data: {
        vendorProfileId: vendorProfileId,
        orderId,
        reason,
        description,
        status: "OPEN",
        raisedById: session.user.id,
      },
    });

    // 2. Find Admin Users (to send them the notification)
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true }
    });

    // 3. Save to DB for the NotificationBell & Trigger Pusher
    // We map through admins if you have multiple, or just target the main one
    await Promise.all(admins.map(async (admin) => {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: "DISPUTE",
          title: "New Dispute Filed",
          message: `Vendor ${vendorName} filed a dispute for Order #${orderId}`,
          link: `/admin/disputes/${dispute.id}`,
        },
      });
    }));

    // 4. Instant UI Update via Pusher (Targeting the admin-notifications channel)
    await pusherServer.trigger("admin-notifications", "new-alert", {
      type: "DISPUTE",
      title: "New Dispute Filed",
      message: `${vendorName} raised a dispute for Order #${orderId}`,
      link: `/admin/disputes/${dispute.id}`
    });

    // 5. Send External Branded Admin Email via mailer.ts
    await sendAdminAlert({
      type: 'DISPUTE',
      subject: `Order #${orderId} Dispute`,
      details: `Vendor: ${vendorName}\nReason: ${reason}\nDescription: ${description}\n\nAction required immediately in the Admin Control Center.`
    });

    return NextResponse.json({ success: true, disputeId: dispute.id });
  } catch (error) {
    console.error("DISPUTE_SUBMISSION_ERROR", error);
    return NextResponse.json({ error: "Failed to submit dispute" }, { status: 500 });
  }
}