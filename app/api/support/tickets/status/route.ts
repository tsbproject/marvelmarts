import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  id: z.string().cuid() || z.string().uuid(), // Validate ID format
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]), 
});

export async function PUT(req: Request) {
  try {
    const json = await req.json();
    const { id, status } = updateSchema.parse(json);

    // Implementation Note: Add your Admin Session check here
    // const session = await getAdminSession(); 
    // if (!session) return NextResponse.json({error: "Unauthorized"}, {status: 401});

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized or Invalid Request" }, { status: 400 });
  }
}