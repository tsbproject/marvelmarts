


import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function PATCH(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } // Type as Promise for Next.js 15
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Authorization: Only Admins or Super Admins
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await the params to get the ID
    const { id: userId } = await params;
    const body = await req.json();

    console.log(` Updating User ${userId}:`, body);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        // Handle suspension toggle
        ...(body.isSuspended !== undefined && { isSuspended: body.isSuspended }),
        
        // Handle role updates
        ...(body.role && { role: body.role }),
        
        // Handle profile updates (Name & Email)
        ...(body.name && { name: body.name }),
        ...(body.email && { email: body.email }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("❌ PATCH ERROR:", error.message);
    
    // Specific error for missing fields in DB
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



// DELETE USER

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow SUPER_ADMIN to delete users
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.user.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error("❌ DELETE ERROR:", error.message);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}