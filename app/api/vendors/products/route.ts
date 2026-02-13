import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

// --- GET: Fetch My Products ---
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendorProfile) {
      return NextResponse.json({ success: false, message: "Vendor profile not found" }, { status: 404 });
    }

    const products = await prisma.product.findMany({
      where: { vendorProfileId: vendorProfile.id },
      include: { 
        category: { select: { name: true } },
        images: { select: { url: true }, take: 1 } // Fetch the primary image
      },
      orderBy: { createdAt: "desc" },
    });

    // Flatten data for the frontend
    const items = products.map(p => ({
      ...p,
      name: p.title || "Untitled Product",
      // Priority: 1. Related images array, 2. Direct imageUrl field, 3. Placeholder
      imageUrl: p.images?.[0]?.url || (p as any).imageUrl || "/logo.png"
    }));

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("GET_VENDOR_PRODUCTS_ERROR:", error);
    return NextResponse.json({ success: false, message: "Error fetching inventory" }, { status: 500 });
  }
}

// --- DELETE: Remove My Product ---
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id");

    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (!productId) {
      return NextResponse.json({ success: false, message: "Product ID required" }, { status: 400 });
    }

    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendorProfile) {
      return NextResponse.json({ success: false, message: "Vendor profile not found" }, { status: 404 });
    }

    // Verify ownership before deleting
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    if (product.vendorProfileId !== vendorProfile.id) {
      return NextResponse.json({ success: false, message: "Permission denied" }, { status: 403 });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("DELETE_PRODUCT_ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to delete product" }, { status: 500 });
  }
}