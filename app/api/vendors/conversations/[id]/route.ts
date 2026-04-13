// import { NextResponse } from "next/server";
// import prisma from "@/app/lib/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";

// export async function GET(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> | { id: string } } 
// ) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

//     // TACTICAL FIX: Await the params to prevent 'undefined' id
//     const resolvedParams = await params;
//     const { id } = resolvedParams;

//     if (!id || id === "undefined") {
//       return new NextResponse("Conversation ID is missing", { status: 400 });
//     }

//     const conversation = await prisma.conversation.findUnique({
//       where: { 
//         id: id // Now guaranteed to be a string
//       },
//       include: {
//         messages: {
//           orderBy: { createdAt: 'asc' }
//         }
//       }
//     });

//     if (!conversation) {
//       return new NextResponse("Conversation not found", { status: 404 });
//     }

//     // Security check
//     if (!conversation.participantIds.includes(session.user.id)) {
//       return new NextResponse("Forbidden", { status: 403 });
//     }

//     return NextResponse.json(conversation);
//   } catch (error: any) {
//     console.error("CRITICAL_DATABASE_ERROR:", error.message);
//     return new NextResponse(
//       JSON.stringify({ error: "Server Error", details: error.message }), 
//       { status: 500 }
//     );
//   }
// }



import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id || id === "undefined") {
      return NextResponse.json({ error: "Conversation ID is missing" }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (!conversation.participantIds.includes(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        subject: conversation.subject,
        type: conversation.type,
        status: conversation.status,
        isGuest: conversation.isGuest,
        visitorName: conversation.visitorName,
        visitorEmail: conversation.visitorEmail,
        endedAt: conversation.endedAt,
        endedById: conversation.endedById,
        endedByRole: conversation.endedByRole,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
      messages: conversation.messages,
    });
  } catch (error: any) {
    console.error("VENDOR_FETCH_CONVERSATION_ERROR:", error);
    return NextResponse.json(
      {
        error: "Server Error",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}