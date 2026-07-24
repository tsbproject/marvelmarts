import { NextResponse } from "next/server";

import { HelpCenterService } from "@/app/lib/services/help-center.service";
import { handleApiError, requireManageSupport } from "@/app/lib/auth/api";
import { badRequest} from "@/app/lib/auth/errors";

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

export async function POST(
  req: Request
) {
  try {
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

/* ========================================================================== */
/* UPDATE HELP ARTICLE                                                        */
/* ========================================================================== */

export async function PUT(
  req: Request
) {
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

/* ========================================================================== */
/* DELETE HELP ARTICLE                                                        */
/* ========================================================================== */

export async function DELETE(
  req: Request
) {
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