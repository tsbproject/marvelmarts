import { prisma } from "@/app/lib/prisma";

import { NextResponse } from "next/server";

import { z } from "zod";

const updateSchema = z.object({
  id: z
    .string()
    .cuid()
    .or(z.string().uuid()),

  status: z.enum([
    "OPEN",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
  ]),
});

export async function PUT(req: Request) {
  try {

    const json = await req.json();

    const { id, status } =
      updateSchema.parse(json);

    // TODO:
    // Add admin authentication/session protection here

    const updatedTicket =
      await prisma.ticket.update({
        where: {
          id,
        },

        data: {
          status,
        },
      });

    return NextResponse.json({
      success: true,

      ticket: updatedTicket,
    });

  } catch (error) {

    console.error(
      "Ticket Update Error:",
      error
    );

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request data.",
        },
        {
          status: 422,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Unauthorized or invalid request.",
      },
      {
        status: 400,
      }
    );
  }
}