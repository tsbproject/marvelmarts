// import { prisma } from "@/app/lib/prisma";
// import { NextResponse } from "next/server";
// import { ConversationType } from "@prisma/client";
// import { pusherServer } from "@/app/lib/pusherServer";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { email, name, isVendor } = body;

//     console.log("--- CHAT INITIATION START ---");
//     console.log("Payload:", { email, name, isVendor });

//     // 1. Locate the User and include vendorProfile as per your context
//     const user = await prisma.user.findUnique({
//       where: { email },
//       include: { vendorProfile: true },
//     });

//     if (!user) {
//       console.error("User not found for email:", email);
//       return new NextResponse("User not found. Please use your registered email.", { status: 404 });
//     }

//     // 2. Vendor validation check
//     // If they claim to be a vendor but have no profile, you might want to warn them
//     if (isVendor && !user.vendorProfile) {
//       console.warn(`User ${email} tried to initiate as Vendor but has no vendorProfile.`);
//       // We'll allow it but log it, or you can return an error here.
//     }

//     // 3. Determine conversation type based on your Prisma Enum
//     const type = isVendor ? ConversationType.VENDOR_ADMIN : ConversationType.CUSTOMER_ADMIN;

//     // 4. Check for existing conversation
//     // We search for a conversation of this type where this user is a participant
//     let conversation = await prisma.conversation.findFirst({
//       where: {
//         type: type,
//         participantIds: { has: user.id },
//       },
//     });

//     if (conversation) {
//       console.log("Existing conversation found:", conversation.id);
//     } else {
//       console.log("Creating new conversation...");
      
//       // 5. Find an active staff member (ADMIN or SUPER_ADMIN)
//       const admin = await prisma.user.findFirst({
//         where: {
//           role: { in: ["ADMIN", "SUPER_ADMIN"] },
//           isSuspended: false,
//         },
//       });

//       if (!admin) {
//         console.error("CRITICAL: No Staff found in database.");
//         return new NextResponse("Support is currently offline (No staff found).", { status: 503 });
//       }

//       // 6. Create the conversation
//       conversation = await prisma.conversation.create({
//         data: {
//           type: type,
//           subject: isVendor ? `Vendor Support: ${name}` : `Customer Support: ${name}`,
//           participantIds: [user.id, admin.id],
//         },
//       });

//       // 7. Automated Welcome Message
//       await prisma.message.create({
//         data: {
//           conversationId: conversation.id,
//           senderId: "SYSTEM",
//           senderName: "MarvelMarts Support",
//           content: `Hello ${name}, thank you for reaching out. A member of our team will be with you shortly.`,
//         },
//       });
      
//       console.log("New conversation created successfully.");
//     }

//     // --- FINAL CHECK ---
//     // Ensure the conversation object exists before returning
//     if (!conversation?.id) {
//        throw new Error("Failed to retrieve or create conversation ID.");
//     }

//     console.log("--- CHAT INITIATION SUCCESS --- ID:", conversation.id);
    
//     // Always return this exact structure
//     return NextResponse.json({ 
//       conversationId: conversation.id,
//       type: conversation.type
//     });

//   } catch (error: any) {
//     console.error("--- CHAT INITIATION ERROR ---");
//     console.error("Error Detail:", error.message);
//     return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
//   }

  
// }

import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { ConversationType } from "@prisma/client";
import { pusherServer } from "@/app/lib/pusherServer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, isVendor } = body;

    console.log("--- CHAT INITIATION START ---");

    // 1. Locate the User
    const user = await prisma.user.findUnique({
      where: { email },
      include: { vendorProfile: true },
    });

    if (!user) {
      return new NextResponse("User not found. Please use your registered email.", { status: 404 });
    }

    // 2. Determine conversation type
    const type = isVendor ? ConversationType.VENDOR_ADMIN : ConversationType.CUSTOMER_ADMIN;

    // 3. Check for existing conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        type: type,
        participantIds: { has: user.id },
      },
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        participants: { select: { id: true, name: true, role: true } } // Added for consistency
      }
    });

    if (!conversation) {
      console.log("Creating new conversation...");
      
      // 4. Find staff
      const admin = await prisma.user.findFirst({
        where: {
          role: { in: ["ADMIN", "SUPER_ADMIN"] },
          isSuspended: false,
        },
      });

      if (!admin) {
        return new NextResponse("Support is currently offline.", { status: 503 });
      }

      // 5. Create conversation
      conversation = await prisma.conversation.create({
        data: {
          type: type,
          subject: isVendor ? `Vendor Support: ${name}` : `Customer Support: ${name}`,
          participantIds: [user.id, admin.id],
        },
        include: {
          participants: { select: { id: true, name: true, role: true } }
        }
      });

      // 6. Automated Welcome Message
      const welcomeMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: "SYSTEM",
          senderName: "MarvelMarts Support",
          content: `Hello ${name}, thank you for reaching out. A member of our team will be with you shortly.`,
        },
      });

      // 7. Trigger Global Pusher Event (For Dropdown Badge & Sidebar)
      await pusherServer.trigger("global-admin-channel", "new-support-ticket", {
        ...conversation,
        messages: [welcomeMessage],
      });
    }

    return NextResponse.json({ 
      conversationId: conversation.id,
      type: conversation.type
    });

  } catch (error: any) {
    console.error("--- CHAT INITIATION ERROR ---", error.message);
    return new NextResponse(`Internal Server Error`, { status: 500 });
  }
}