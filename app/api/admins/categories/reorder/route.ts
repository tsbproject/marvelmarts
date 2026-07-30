import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { CategoryService } from "@/app/lib/services/category.service";

import { handleApiError, requireManageCategories } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


const reorderSchema = z.array(
  z.object({
    id: z.string().min(1),
    position: z.number().int().min(0),
  })
);

export async function PUT(
  req: NextRequest
) {
  try {
    await requireManageCategories();

    const body = await req.json();

    const parsed =
      reorderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid payload.",
          details: parsed.error.format(),
        },
        {
          status: 400,
        }
      );
    }

    await CategoryService.reorderCategories(
      parsed.data
    );

    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}