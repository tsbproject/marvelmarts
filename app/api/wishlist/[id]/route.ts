// // app/api/wishlist/[id]/route.ts
// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import prisma from "@/app/lib/prisma";

// export async function DELETE(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
//     const { id } = params;

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Use deleteMany instead of delete. 
//     // .delete() throws an error if ID is missing.
//     // .deleteMany() simply returns count: 0 if not found, preventing a 500 crash.
//     const deletion = await prisma.wishlist.deleteMany({
//       where: {
//         id: id,
//         userId: session.user.id,
//       },
//     });

//     if (deletion.count === 0) {
//        // If not found by ID, let's try finding by productId as a fallback
//        // This prevents the 2nd-item-failure if your IDs are mixed up.
//        await prisma.wishlist.deleteMany({
//          where: {
//            productId: id,
//            userId: session.user.id,
//          },
//        });
//     }

//     return NextResponse.json({ success: true }, { status: 200 });
//   } catch (error: any) {
//     console.error("DATABASE_DELETE_ERROR:", error.message);
//     return NextResponse.json({ message: "Server Error" }, { status: 500 });
//   }
// }



// app/api/wishlist/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Await params to satisfy Next.js 15 type constraints
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Use deleteMany instead of delete. 
    // .delete() throws an error if ID is missing.
    // .deleteMany() simply returns count: 0 if not found, preventing a 500 crash.
    const deletion = await prisma.wishlist.deleteMany({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (deletion.count === 0) {
      // 3. Fallback: If not found by ID, try finding by productId.
      // This prevents the 2nd-item-failure if your IDs are mixed up.
      await prisma.wishlist.deleteMany({
        where: {
          productId: id,
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("DATABASE_DELETE_ERROR:", error.message);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}