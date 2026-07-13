import { prisma } from "@/app/lib/prisma";

import { badRequest } from "@/app/lib/auth/errors";

interface HelpArticleData {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  category: string;
  keywords?: string[];
}

export class HelpCenterService {
  private static generateSlug(
    title: string
  ) {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");
  }

  static async createArticle(
    data: HelpArticleData
  ) {
    if (
      !data.title ||
      !data.content ||
      !data.category
    ) {
      throw badRequest(
        "Title, content and category are required."
      );
    }

    const slug =
      data.slug?.trim() ||
      this.generateSlug(data.title);

    return prisma.helpArticle.create({
      data: {
        title: data.title.trim(),
        slug,
        excerpt:
          data.excerpt?.trim() ?? "",
        content: data.content,
        category: data.category,
        keywords: Array.isArray(
          data.keywords
        )
          ? data.keywords
          : [],
      },
    });
  }

  static async updateArticle(
    id: string,
    data: HelpArticleData
  ) {
    return prisma.helpArticle.update({
      where: {
        id,
      },
      data: {
        title: data.title?.trim(),
        excerpt:
          data.excerpt?.trim(),
        content: data.content,
        category: data.category,
        keywords: Array.isArray(
          data.keywords
        )
          ? data.keywords
          : [],
      },
    });
  }

  static async deleteArticle(
    id: string
  ) {
    await prisma.helpArticle.delete({
      where: {
        id,
      },
    });
  }

  static async searchArticles(
    query: string
    ) {
    if (
        !query ||
        query.trim().length < 2
    ) {
        return [];
    }

    return prisma.helpArticle.findMany({
        where: {
        OR: [
            {
            title: {
                contains: query,
                mode: "insensitive",
            },
            },
            {
            content: {
                contains: query,
                mode: "insensitive",
            },
            },
            {
            keywords: {
                has: query.toLowerCase(),
            },
            },
        ],
        },
        take: 5,
        orderBy: {
        title: "asc",
        },
    });
    }
}