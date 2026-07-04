import { prisma } from "@/app/lib/prisma";
import { forbidden, notFound } from "@/app/lib/auth/errors";

type Session = {
  user: {
    id: string;
    role: string;
  };
};

export async function requireProductOwnershipBySlug(
  slug: string,
  session: Session
) {
  const product = await prisma.product.findUnique({
    where: {
      slug,
    },
    include: {
      vendorProfile: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!product) {
    throw notFound("Product not found.");
  }

  const isAdmin =
    session.user.role === "ADMIN" ||
    session.user.role === "SUPER_ADMIN";

  if (!isAdmin) {
    const vendor = await prisma.vendorProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!vendor) {
      throw notFound("Vendor profile not found.");
    }

    if (vendor.id !== product.vendorProfileId) {
      throw forbidden(
        "You do not have permission to modify this product."
      );
    }
  }

  return product;
}