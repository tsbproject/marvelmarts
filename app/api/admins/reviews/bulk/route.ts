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
/*                           BULK APPROVE / REJECT                            */
/* -------------------------------------------------------------------------- */

export const PATCH =
  withApiLogging(
    async (req: Request) => {
      try {
        verifyOrigin(req);

       const session =
      await requireManageReviews();
        
         const {
          ids,
          approved,
        } = await req.json();

        const updated =
          await ProductService.bulkApproveReviews(
            ids,
            approved,
            session.user.id
          );

        return NextResponse.json(
          {
            success: true,
            updated,
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
/*                             BULK DELETE                                    */
/* -------------------------------------------------------------------------- */

export const DELETE =
  withApiLogging(
    async (req: Request) => {
      try {
        
        const session =
        await requireManageReviews();

      const { ids } =
        await req.json();

      const deleted =
        await ProductService.bulkDeleteReviews(
          ids,
          session.user.id
        );

        return NextResponse.json(
          {
            success: true,
            deleted,
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