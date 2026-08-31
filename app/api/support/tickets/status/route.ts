import { NextResponse } from "next/server";
import { z } from "zod";

import {
  requireAdmin,
  handleApiError,
} from "@/app/lib/auth/api";

import { TicketService } from "@/app/lib/services/ticket.service";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

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

export const PUT = withApiLogging(
  async (req: Request) => {
    try {
      verifyOrigin(req);

      await requireAdmin();

      const json =
        await req.json();

      const {
        id,
        status,
      } = updateSchema.parse(json);

      const updatedTicket =
        await TicketService.updateStatus(
          id,
          status
        );

      return NextResponse.json({
        success: true,
        ticket: updatedTicket,
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);