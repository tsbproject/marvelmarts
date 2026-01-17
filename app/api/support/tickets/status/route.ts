import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const { id, status } = await req.json();

  const updatedTicket = await prisma.ticket.update({
    where: { id },
    data: { status }
  });

  return NextResponse.json(updatedTicket);
}