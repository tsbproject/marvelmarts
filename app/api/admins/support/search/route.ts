import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const articles = await prisma.helpArticle.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { keywords: { has: query.toLowerCase() } }
        ]
      },
      take: 5, // Limit results for the small dropdown
    });

    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}