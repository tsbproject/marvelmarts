import { NextResponse } from "next/server";

import { ProductService } from "@/app/lib/services/product.service";

import {
  handleApiError,
  requireAuth,
} from "@/app/lib/auth/api";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST =
  withApiLogging(
    async (req: Request) => {
      try {
        verifyOrigin(req);

        const session =
          await requireAuth();

        const body =
          await req.json();

        const review =
          await ProductService.createProductReview(
            session.user.id,
            {
              productId:
                body.productId,

              rating:
                Number(body.rating),

              body:
                body.body,
            }
          );

        return NextResponse.json(
          {
            success: true,
            review,
          },
          {
            status: 201,
          }
        );
      } catch (error) {
        return handleApiError(error);
      }
    }
  );