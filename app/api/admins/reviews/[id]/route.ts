import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

/**
 * PATCH: Update Review Status (Approve/Unapprove)
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Security Check: Ensure only Admins can access
    const session = await getServerSession(authOptions);
    
    // Tactical Note: Add your specific admin email or role check here
    if (!session?.user || session.user.email !== "your-admin-email@example.com") {
      return new NextResponse("Unauthorized Command", { status: 401 });
    }

    const { id } = await params;
    const { approved } = await req.json();

    const updatedReview = await prisma.review.update({
      where: { id },
      data: { approved },
    });

    return NextResponse.json(updatedReview);
  } catch (error: any) {
    console.error("ADMIN_REVIEW_PATCH_ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * DELETE: Permanently Remove a Review
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.email !== "your-admin-email@example.com") {
      return new NextResponse("Unauthorized Command", { status: 401 });
    }

    const { id } = await params;

    await prisma.review.delete({
      where: { id },
    });

    return new NextResponse("Report Purged", { status: 200 });
  } catch (error: any) {
    console.error("ADMIN_REVIEW_DELETE_ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}