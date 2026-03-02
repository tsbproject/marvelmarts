import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; // adjust path
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth"; // adjust path to your NextAuth config

// ────────────────────────────────────────────────────────────────
// GET: Fetch current site settings (public or admin read)
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 1 },
    });

    console.log("[GET /api/site-settings] Found:", settings);

    if (!settings) {
      console.warn("[GET] No settings row found – returning defaults");
      return NextResponse.json({
        id: 1,
        accentNavy: "#002B5B",
        brandPrimary: "#F7931E",
        brandOrangeLight: "#FFE8CC",
        neutralWhite: "#FFFFFF",
        neutralLight: "#F8F8F8",
        neutralGray: "#4B4B4B",
        neutralDark: "#1E1E1E",
        layoutScale: 1.0,
        baseFontSize: 16,
        bodyFontScale: 1.0,
        headingFontScale: 1.0,
        headerFontScale: 1.0,
        footerFontScale: 1.0,
        carouselFontScale: 1.0,
        headerBg: "#FFFFFF",
        headerText: "#000000",
        headerBorder: "transparent",
        showSearchBar: true,
        footerBg: "#F8F8F8",
        footerText: "#333333",
        showSocialIcons: true,
        productCardRadius: "2rem",
        productCardShadow: "sm",
        productPriceColor: "#002B5B",
        addToCartBg: "#002B5B",
        addToCartText: "#FFFFFF",
        showFeaturedProducts: true,
        showEcommerceCarousel: true,
        showFlashSales: true,
        showFeaturedCategories: true,
        showTrendingProducts: true,
        showNewArrivals: true,
        showTestimonials: true,
        cartDrawerPosition: "right",
        cartDrawerWidth: "400px",
        helpMenuPosition: "bottom-right",
        // add more defaults from your model
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("[GET ERROR]:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// ────────────────────────────────────────────────────────────────
// PATCH: Update site settings (admin only)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    console.log("[PATCH] Session:", session);

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;

    if (!["ADMIN", "SUPER_ADMIN"].includes(userRole)) {
      return NextResponse.json(
        { error: `Unauthorized – insufficient role (${userRole || "none"})` },
        { status: 403 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    console.log("[PATCH] Received:", body);

    const updated = await prisma.siteSettings.update({
      where: { id: 1 },
      data: body,
    });

    console.log("[PATCH] Success:", updated);

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[PATCH ERROR]:", error);
    const status = error.code === "P2025" ? 404 : 500;
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status }
    );
  }
}