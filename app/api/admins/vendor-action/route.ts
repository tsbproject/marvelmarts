// import { prisma } from "@/app/lib/prisma";
// import { getServerSession } from "next-auth";
// import { NextResponse } from "next/server";
// import { authOptions } from "@/app/lib/auth";
// import { sendVendorActionEmail } from "@/app/lib/mailer";

// export async function PATCH(req: Request) {
//   const session = await getServerSession(authOptions);

//   const userRole = session?.user?.role;
//   const userRoles = Array.isArray(session?.user?.roles) ? session.user.roles : [];

//   const isAdmin =
//     userRole === "ADMIN" ||
//     userRole === "SUPER_ADMIN" ||
//     userRoles.includes("ADMIN") ||
//     userRoles.includes("SUPER_ADMIN");

//   if (!session?.user?.id || !isAdmin) {
//     return new NextResponse("Unauthorized", { status: 401 });
//   }

//   const { vendorProfileId, action, reason } = await req.json();

//   try {
//     let updateData = {};

//     if (action === "SUSPEND") {
//       updateData = { isSuspended: true, status: "REJECTED" };
//     } else if (action === "FLAG") {
//       updateData = { status: "PENDING" };
//     } else if (action === "RESTORE") {
//       updateData = { isSuspended: false, status: "APPROVED" };
//     } else {
//       return NextResponse.json({ error: "Invalid action" }, { status: 400 });
//     }

//     const updatedVendor = await prisma.vendorProfile.update({
//       where: { id: vendorProfileId }, // change this if frontend sends vendorProfile.id
//       data: updateData,
//       include: {
//         user: { select: { email: true, name: true } },
//       },
//     });

//     const conversation = await prisma.conversation.findFirst({
//       where: {
//         participantIds: { has: updatedVendor.userId },
//         type: "VENDOR_ADMIN",
//       },
//     });

//     if (conversation) {
//       await prisma.message.create({
//         data: {
//           conversationId: conversation.id,
//           senderId: session.user.id,
//           senderName: "MARVELMARTS COMPLIANCE",
//           content: `🚨 SYSTEM ACTION: Account has been ${action}ed. \nReason: ${reason}`,
//         },
//       });
//     }

//     if (updatedVendor.user?.email) {
//       await sendVendorActionEmail({
//         email: updatedVendor.user.email,
//         name: updatedVendor.user.name || updatedVendor.storeName,
//         action,
//         reason,
//       });
//     }

//     return NextResponse.json(updatedVendor);
//   } catch (error) {
//     console.error("ADMIN_VENDOR_ACTION_ERROR:", error);
//     return NextResponse.json({ error: "Action failed" }, { status: 500 });
//   }
// }



import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth";
import { sendVendorActionEmail } from "@/app/lib/mailer";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  const userRole = session?.user?.role;
  const userRoles = Array.isArray(session?.user?.roles) ? session.user.roles : [];

  const isAdmin =
    userRole === "ADMIN" ||
    userRole === "SUPER_ADMIN" ||
    userRoles.includes("ADMIN") ||
    userRoles.includes("SUPER_ADMIN");

  if (!session?.user?.id || !isAdmin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { vendorProfileId, action, reason } = await req.json();

  try {
    let updateData: Record<string, any> = {};

    if (action === "SUSPEND") {
      updateData = { isSuspended: true };
    } else if (action === "FLAG") {
      updateData = { status: "PENDING" };
    } else if (action === "RESTORE") {
      updateData = { isSuspended: false };
    } else if (action === "REJECT") {
      updateData = { status: "REJECTED", isSuspended: false };
    } else if (action === "APPROVE") {
      updateData = { status: "APPROVED", isSuspended: false };
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updatedVendor = await prisma.vendorProfile.update({
      where: { id: vendorProfileId },
      data: updateData,
      include: {
        user: { select: { email: true, name: true } },
      },
    });

    const conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: { has: updatedVendor.userId },
        type: "VENDOR_ADMIN",
      },
    });

    if (conversation) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.user.id,
          senderName: "MARVELMARTS COMPLIANCE",
          content: `🚨 SYSTEM ACTION: Account has been ${action}. \nReason: ${reason || "No reason provided"}`,
        },
      });
    }

    if (updatedVendor.user?.email) {
      await sendVendorActionEmail({
        email: updatedVendor.user.email,
        name: updatedVendor.user.name || updatedVendor.storeName,
        action,
        reason,
      });
    }

    return NextResponse.json(updatedVendor);
  } catch (error) {
    console.error("ADMIN_VENDOR_ACTION_ERROR:", error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}