import { prisma } from "@/app/lib/prisma";
import { notFound } from "@/app/lib/auth/errors";

export class SiteSettingsService {
  static async getSettings() {
    return prisma.siteSettings.findUnique({
      where: {
        id: 1,
      },
    });
  }

  static async updateSettings(
    data: Record<string, unknown>
  ) {
    const existing =
      await prisma.siteSettings.findUnique({
        where: {
          id: 1,
        },
        select: {
          id: true,
        },
      });

    if (!existing) {
      throw notFound(
        "Site settings record not found."
      );
    }

    return prisma.siteSettings.update({
      where: {
        id: 1,
      },
      data,
    });
  }



  static async getHomepageSettings() {
  return prisma.siteSettings.findUnique({
    where: {
      id: 1,
    },
  });
}
}