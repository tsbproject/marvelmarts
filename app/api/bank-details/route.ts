import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { requireAuth } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import {
  badRequest,
  notFound,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                          GET BANK ACCOUNT                                  */
/* -------------------------------------------------------------------------- */

export async function GET() {
  try {
    const session = await requireAuth();

    const bankAccount =
      await prisma.bankAccount.findUnique({
        where: {
          userId: session.user.id,
        },
      });

    return NextResponse.json(
      {
        success: true,
        bankAccount,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/* -------------------------------------------------------------------------- */
/*                     CREATE / UPDATE BANK ACCOUNT                           */
/* -------------------------------------------------------------------------- */

export async function POST(
  req: NextRequest
) {
  try {
    const session =
      await requireAuth();

    const body = await req.json();

    const {
      bankName,
      accountNumber,
      accountName,
    } = body;

    if (
      !bankName ||
      !accountNumber ||
      !accountName
    ) {
      throw badRequest(
        "Bank name, account number and account name are required."
      );
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        select: {
          id: true,
        },
      });

    if (!user) {
      throw notFound(
        "User not found."
      );
    }

    const bankAccount =
      await prisma.bankAccount.upsert({
        where: {
          userId: user.id,
        },
        update: {
          bankName,
          accountNumber,
          accountName,
        },
        create: {
          userId: user.id,
          bankName,
          accountNumber,
          accountName,
        },
      });

    return NextResponse.json(
      {
        success: true,
        bankAccount,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}