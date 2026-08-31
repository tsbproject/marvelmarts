import { NextResponse } from "next/server";
import { z } from "zod";

import { CategoryService } from "@/app/lib/services/category.service";

import {
  requireManageCategories,
  handleApiError,
} from "@/app/lib/auth/api";

import { badRequest } from "@/app/lib/auth/errors";
import { verifyOrigin } from "@/app/lib/auth/csrf";

import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  parentId: z.string().optional(),
  position: z.number().optional(),
  imageUrl: z.string().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
});

/* -------------------------------------------------------------------------- */
/*                                   GET                                      */
/* -------------------------------------------------------------------------- */

export const GET =
  withApiLogging(
    async (
      _req: Request,
      {
        params,
      }: {
        params: Promise<{
          id: string;
        }>;
      }
    ) => {
      try {
        await requireManageCategories();

        const { id } =
          await params;

        if (!id) {
          throw badRequest(
            "Category ID is required."
          );
        }

        const category =
          await CategoryService.getCategoryById(
            id
          );

        return NextResponse.json(
          {
            success: true,
            category,
          },
          {
            status: 200,
          }
        );
      } catch (error) {
        return handleApiError(error);
      }
    }
  );

/* -------------------------------------------------------------------------- */
/*                                   PUT                                      */
/* -------------------------------------------------------------------------- */

export const PUT =
  withApiLogging(
    async (
      req: Request,
      {
        params,
      }: {
        params: Promise<{
          id: string;
        }>;
      }
    ) => {
      try {
        verifyOrigin(req);

        await requireManageCategories();

        const { id } =
          await params;

        if (!id) {
          throw badRequest(
            "Category ID is required."
          );
        }

        const body =
          await req.json();

        const parsed =
          updateSchema.safeParse(body);

        if (!parsed.success) {
          return NextResponse.json(
            {
              error: "Invalid payload",
              details:
                parsed.error.format(),
            },
            {
              status: 400,
            }
          );
        }

        const category =
          await CategoryService.updateCategory(
            id,
            parsed.data
          );

        return NextResponse.json(
          {
            success: true,
            category,
          },
          {
            status: 200,
          }
        );
      } catch (error) {
        return handleApiError(error);
      }
    }
  );

/* -------------------------------------------------------------------------- */
/*                                 DELETE                                     */
/* -------------------------------------------------------------------------- */

export const DELETE =
  withApiLogging(
    async (
      req: Request,
      {
        params,
      }: {
        params: Promise<{
          id: string;
        }>;
      }
    ) => {
      try {
        verifyOrigin(req);

        await requireManageCategories();

        const { id } =
          await params;

        if (!id) {
          throw badRequest(
            "Category ID is required."
          );
        }

        await CategoryService.deleteCategory(
          id
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
  );