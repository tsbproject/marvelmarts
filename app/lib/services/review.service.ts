import { prisma } from "@/app/lib/prisma";

export class ReviewService {

  /* -------------------------------------------------------------------------- */
  /*                               REVIEW QUERIES                               */
  /* -------------------------------------------------------------------------- */

  static async getAdminReviews() {
    return prisma.review.findMany({
      include: {
        product: {
          select: {
            title: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}