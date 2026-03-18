import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  console.log("WISHLIST POST SESSION USER:", session?.user?.id);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await req.json();

  console.log("WISHLIST POST PRODUCT:", productId);

  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    console.log("WISHLIST REMOVED:", existing.id);
    return NextResponse.json({ action: "removed" });
  }

  const created = await prisma.wishlist.create({
    data: { userId: session.user.id, productId },
  });

  console.log("WISHLIST ADDED:", created);

  return NextResponse.json({ action: "added" });
}