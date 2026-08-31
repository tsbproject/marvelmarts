import { NextResponse } from "next/server";

import { ProductService } from "@/app/lib/services/product.service";

import {
  handleApiError,
  requireManageReviews,
} from "@/app/lib/auth/api";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                           UPDATE REVIEW                                    */
/* -------------------------------------------------------------------------- */

export const PATCH =
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
        await requireManageReviews();

        const { id } =
          await params;

        const {
          approved,
        } = await req.json();

        const review =
          await ProductService.updateReviewApproval(
            id,
            approved
          );

        return NextResponse.json(
          {
            success: true,
            review,
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
/*                           DELETE REVIEW                                    */
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

        await requireManageReviews();

        const { id } =
          await params;

        await ProductService.deleteReview(
          id
        );

        return NextResponse.json(
          {
            success: true,
            message:
              "Review deleted successfully.",
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