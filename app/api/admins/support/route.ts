import { NextResponse } from "next/server";

import { HelpCenterService } from "@/app/lib/services/help-center.service";
import {
  handleApiError,
  requireManageSupport,
} from "@/app/lib/auth/api";
import { badRequest } from "@/app/lib/auth/errors";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface HelpArticleRequest {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  category: string;
  keywords?: string[];
}

/* ========================================================================== */
/* CREATE HELP ARTICLE                                                        */
/* ========================================================================== */

export const POST =
  withApiLogging(
    async (req: Request) => {
      try {
        verifyOrigin(req);

        await requireManageSupport();

        const body =
          (await req.json()) as HelpArticleRequest;

        const article =
          await HelpCenterService.createArticle(
            body
          );

        return NextResponse.json(
          {
            success: true,
            article,
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

/* ========================================================================== */
/* UPDATE HELP ARTICLE                                                        */
/* ========================================================================== */

export const PUT =
  withApiLogging(
    async (req: Request) => {
      try {
        verifyOrigin(req);

        await requireManageSupport();

        const { searchParams } =
          new URL(req.url);

        const id =
          searchParams.get("id");

        if (!id) {
          throw badRequest(
            "Article id is required."
          );
        }

        const body =
          (await req.json()) as HelpArticleRequest;

        const article =
          await HelpCenterService.updateArticle(
            id,
            body
          );

        return NextResponse.json({
          success: true,
          article,
        });
      } catch (error) {
        return handleApiError(error);
      }
    }
  );

/* ========================================================================== */
/* DELETE HELP ARTICLE                                                        */
/* ========================================================================== */

export const DELETE =
  withApiLogging(
    async (req: Request) => {
      try {
        await requireManageSupport();

        const { searchParams } =
          new URL(req.url);

        const id =
          searchParams.get("id");

        if (!id) {
          throw badRequest(
            "Article id is required."
          );
        }

        await HelpCenterService.deleteArticle(
          id
        );

        return NextResponse.json({
          success: true,
          message:
            "Help article deleted successfully.",
        });
      } catch (error) {
        return handleApiError(error);
      }
    }
  );