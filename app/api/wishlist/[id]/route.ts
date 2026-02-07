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

//     if (!session?.user?.email) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Use deleteMany to avoid crashing if the record is already gone
//     // We check for the Record ID OR the Product ID for this specific user
//     const result = await prisma.wishlist.deleteMany({
//       where: {
//         user: { email: session.user.email },
//         OR: [
//           { id: id },
//           { productId: id }
//         ]
//       },
//     });

//     if (result.count === 0) {
//       return NextResponse.json({ error: "Item not found" }, { status: 404 });
//     }

//     return NextResponse.json({ message: "Deleted" }, { status: 200 });
//   } catch (error: any) {
//     console.error("WISHLIST_DELETE_API_ERROR:", error.message);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }



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

//     // Must check session inside the API since we bypassed middleware
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // deleteMany avoids crashing if the item was already deleted
//     const result = await prisma.wishlist.deleteMany({
//       where: {
//         id: id,
//         userId: session.user.id,
//       },
//     });

//     if (result.count === 0) {
//       return NextResponse.json({ error: "Item not found" }, { status: 404 });
//     }

//     return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
//   } catch (error: any) {
//     console.error("API_DELETE_ERROR:", error.message);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }





// app/api/wishlist/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use deleteMany instead of delete. 
    // .delete() throws an error if ID is missing.
    // .deleteMany() simply returns count: 0 if not found, preventing a 500 crash.
    const deletion = await prisma.wishlist.deleteMany({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (deletion.count === 0) {
       // If not found by ID, let's try finding by productId as a fallback
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