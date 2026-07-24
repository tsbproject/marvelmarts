// app/api/admins/categories/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { CategoryService } from "@/app/lib/services/category.service";
import { handleApiError, requireManageCategories } from "@/app/lib/auth/api";

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  parentId: z.string().optional(),
  position: z.number().optional(),
});

/* -------------------------------------------------------------------------- */
/*                              CREATE CATEGORY                               */
/* -------------------------------------------------------------------------- */

export async function POST(req: NextRequest) {
  try {
    await requireManageCategories();

    const body = await req.json();

    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid payload",
          details: parsed.error.format(),
        },
        {
          status: 400,
        }
      );
    }

    const category =
      await CategoryService.createCategory(
        parsed.data
      );

    return NextResponse.json(
      {
        success: true,
        category,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/* -------------------------------------------------------------------------- */
/*                              LIST CATEGORIES                               */
/* -------------------------------------------------------------------------- */

export async function GET(
  req: NextRequest
) {
  try {
    await requireManageCategories();

    const { searchParams } =
      new URL(req.url);

    const all =
      searchParams.get("all") ===
      "true";

    const page = parseInt(
      searchParams.get("page") ??
        "1",
      10
    );

    const pageSize = parseInt(
      searchParams.get("pageSize") ??
        "10",
      10
    );

    const search =
      searchParams.get("search") ??
      "";

    const sortBy =
      (searchParams.get("sortBy") ??
        "position") as
        | "position"
        | "name"
        | "slug"
        | "createdAt"
        | "updatedAt";

    const sortOrder =
      (searchParams.get("sortOrder") ??
        "asc") as
        | "asc"
        | "desc";

    const result =
      await CategoryService.getCategories({
        all,
        page,
        pageSize,
        search,
        sortBy,
        sortOrder,
      });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}