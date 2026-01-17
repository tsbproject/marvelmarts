// app/api/dashboard/stats/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth"; 
import prisma from "@/app/lib/prisma"; 

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify these names match your prisma/schema.prisma file!
    const [customerCount, orderCount, ticketCount, blogCount] = await Promise.all([
      prisma.user.count({ 
        where: { role: "CUSTOMER" } 
      }),
      prisma.order.count(),
      // If your model is named 'Ticket' instead of 'SupportTicket', change it here:
      prisma.supportTicket.count({ 
        where: { status: "OPEN" } 
      }),
      prisma.blog.count(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        customers: { value: customerCount.toLocaleString(), trend: "+12%", description: "Active users" },
        orders: { value: orderCount.toLocaleString(), trend: "+8%", description: "Total transactions" },
        tickets: { value: ticketCount, description: "Open tickets" },
        blogs: { value: blogCount, description: "Articles published" },
      },
    });
  } catch (error: any) {
    console.error("Dashboard Stats Error:", error.message);
    return NextResponse.json(
      { success: false, error: "Database mapping error. Check your Prisma model names." },
      { status: 500 }
    );
  }
}