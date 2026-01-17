import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth"; 
import { NextResponse } from "next/server";

/**
 * UTILITY: Check Permissions
 * Ensures the user is a Super Admin or has the 'manageSupport' permission
 */
async function checkAuth() {
  const session = await getServerSession(authOptions);
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const hasPermission = session?.user?.permissions?.manageSupport;

  if (!session || (!isSuperAdmin && !hasPermission)) {
    return false;
  }
  return true;
}

// 1. CREATE NEW ARTICLE
export async function POST(req: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    
    // Automatic slug generation if not provided
    const slug = body.slug || body.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

    const article = await prisma.helpArticle.create({
      data: {
        title: body.title,
        slug: slug,
        excerpt: body.excerpt,
        content: body.content,
        category: body.category,
        keywords: Array.isArray(body.keywords) ? body.keywords : [],
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error("POST_SUPPORT_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 2. UPDATE EXISTING ARTICLE
export async function PUT(req: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing article ID" }, { status: 400 });
    }

    const updated = await prisma.helpArticle.update({
      where: { id },
      data: {
        title: body.title,
        excerpt: body.excerpt,
        content: body.content,
        category: body.category,
        keywords: Array.isArray(body.keywords) ? body.keywords : [],
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT_SUPPORT_ERROR", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// 3. DELETE ARTICLE
export async function DELETE(req: Request) {
  try {
    if (!(await checkAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing article ID" }, { status: 400 });
    }

    await prisma.helpArticle.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("DELETE_SUPPORT_ERROR", error);
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}