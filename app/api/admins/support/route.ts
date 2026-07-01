import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { requireManageSupport } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";

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

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

/* ========================================================================== */
/* CREATE HELP ARTICLE                                                        */
/* ========================================================================== */

export async function POST(req: Request) {
  try {
    await requireManageSupport();

    const body = (await req.json()) as HelpArticleRequest;

    if (!body.title || !body.content || !body.category) {
      return NextResponse.json(
        {
          success: false,
          error: "Title, content and category are required.",
        },
        {
          status: 400,
        }
      );
    }

    const slug =
      body.slug?.trim() || generateSlug(body.title);

    const article = await prisma.helpArticle.create({
      data: {
        title: body.title.trim(),
        slug,
        excerpt: body.excerpt?.trim() ?? "",
        content: body.content,
        category: body.category,
        keywords: Array.isArray(body.keywords)
          ? body.keywords
          : [],
      },
    });

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

export async function PUT(req: Request) {
  try {
    await requireManageSupport();

    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Article id is required.",
        },
        {
          status: 400,
        }
      );
    }

    const body = (await req.json()) as HelpArticleRequest;

    const article = await prisma.helpArticle.update({
      where: {
        id,
      },
      data: {
        title: body.title?.trim(),
        excerpt: body.excerpt?.trim(),
        content: body.content,
        category: body.category,
        keywords: Array.isArray(body.keywords)
          ? body.keywords
          : [],
      },
    });

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

export async function DELETE(req: Request) {
  try {
    await requireManageSupport();

    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Article id is required.",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.helpArticle.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Help article deleted successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}