import prisma from "@/app/lib/prisma";
import {
  badRequest,
  forbidden,
  notFound,
} from "@/app/lib/auth/errors";

const SUPPORTED_PROVIDERS = [
  "google",
  "facebook",
] as const;

type SupportedProvider =
  (typeof SUPPORTED_PROVIDERS)[number];

export class AuthAccountService {
  static async getLinkedAccounts(
    userId: string
  ) {
    return prisma.account.findMany({
      where: {
        userId,
        provider: {
          in: [...SUPPORTED_PROVIDERS],
        },
      },
      select: {
        id: true,
        provider: true,
        type: true,
      },
      orderBy: {
        provider: "asc",
      },
    });
  }

  static async unlinkAccount(
    userId: string,
    provider: string
  ) {
    if (
      !SUPPORTED_PROVIDERS.includes(
        provider as SupportedProvider
      )
    ) {
      throw badRequest(
        "Unsupported authentication provider."
      );
    }

    const account =
      await prisma.account.findFirst({
        where: {
          userId,
          provider,
        },
      });

    if (!account) {
      throw notFound(
        "Authentication account not found."
      );
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          passwordHash: true,
          _count: {
            select: {
              accounts: true,
            },
          },
        },
      });

    if (!user) {
      throw notFound(
        "User account not found."
      );
    }

    if (
      !user.passwordHash &&
      user._count.accounts <= 1
    ) {
      throw forbidden(
        "You cannot disconnect your only sign-in method. Set a password first."
      );
    }

    await prisma.account.delete({
      where: {
        id: account.id,
      },
    });

    return {
      success: true,
      provider,
    };
  }
}