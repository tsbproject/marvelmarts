// import { NextResponse } from "next/server";
// import { prisma } from "@/app/lib/prisma"; // adjust path
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth"; // adjust path to your NextAuth config

// // ────────────────────────────────────────────────────────────────
// // GET: Fetch current site settings (public or admin read)
// export async function GET() {
//   try {
//     const settings = await prisma.siteSettings.findUnique({
//       where: { id: 1 },
//     });

//     console.log("[GET /api/site-settings] Found:", settings);

//     if (!settings) {
//       console.warn("[GET] No settings row found – returning defaults");
//       return NextResponse.json({
//         id: 1,
//         accentNavy: "#002B5B",
//         brandPrimary: "#F7931E",
//         brandOrangeLight: "#FFE8CC",
//         neutralWhite: "#FFFFFF",
//         neutralLight: "#F8F8F8",
//         neutralGray: "#4B4B4B",
//         neutralDark: "#1E1E1E",
//         layoutScale: 1.0,
//         baseFontSize: 16,
//         bodyFontScale: 1.0,
//         headingFontScale: 1.0,
//         headerFontScale: 1.0,
//         footerFontScale: 1.0,
//         carouselFontScale: 1.0,
//         headerBg: "#FFFFFF",
//         headerText: "#000000",
//         headerBorder: "transparent",
//         showSearchBar: true,
//         footerBg: "#F8F8F8",
//         footerText: "#333333",
//         showSocialIcons: true,
//         productCardRadius: "2rem",
//         productCardShadow: "sm",
//         productPriceColor: "#002B5B",
//         addToCartBg: "#002B5B",
//         addToCartText: "#FFFFFF",
//         showFeaturedProducts: true,
//         showEcommerceCarousel: true,
//         showFlashSales: true,
//         showFeaturedCategories: true,
//         showTrendingProducts: true,
//         showNewArrivals: true,
//         showTestimonials: true,
//         cartDrawerPosition: "right",
//         cartDrawerWidth: "400px",
//         helpMenuPosition: "bottom-right",
//         // add more defaults from your model
//       });
//     }

//     return NextResponse.json(settings);
//   } catch (error: any) {
//     console.error("[GET ERROR]:", error);
//     return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
//   }
// }

// // ────────────────────────────────────────────────────────────────
// // PATCH: Update site settings (admin only)
// export async function PATCH(request: Request) {
//   try {
//     const session = await getServerSession(authOptions);

//     console.log("[PATCH] Session:", session);

//     if (!session) {
//       return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
//     }

//     const userRole = (session.user as any)?.role;

//     if (!["ADMIN", "SUPER_ADMIN"].includes(userRole)) {
//       return NextResponse.json(
//         { error: `Unauthorized – insufficient role (${userRole || "none"})` },
//         { status: 403 }
//       );
//     }

//     let body;
//     try {
//       body = await request.json();
//     } catch {
//       return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
//     }

//     console.log("[PATCH] Received:", body);

//     const updated = await prisma.siteSettings.update({
//       where: { id: 1 },
//       data: body,
//     });

//     console.log("[PATCH] Success:", updated);

//     return NextResponse.json(updated);
//   } catch (error: any) {
//     console.error("[PATCH ERROR]:", error);
//     const status = error.code === "P2025" ? 404 : 500;
//     return NextResponse.json(
//       { error: error.message || "Server error" },
//       { status }
//     );
//   }
// }




import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

// ────────────────────────────────────────────────────────────────
// GET: Fetch current site settings (public or admin read)
export async function GET() {
  try {
    console.log("[GET /api/site-settings] Request received");

    const settings = await prisma.siteSettings.findUnique({
      where: { id: 1 },
    });

    console.log("[GET /api/site-settings] Found:", settings);

    if (!settings) {
      console.warn("[GET] No settings row found – returning full defaults");
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
        footerLogo: "/logo.png",
        footerBodyFontSize: 16,
        footerHeadingFontSize: 20,
        showSocialIcons: true,
        facebookUrl: "",
        instagramUrl: "",
        twitterUrl: "",
        whatsappUrl: "",
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
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("[GET /api/site-settings] ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// ────────────────────────────────────────────────────────────────
// PATCH: Update site settings (admin/super-admin only)
export async function PATCH(request: Request) {
  try {
    // 1. Auth check
    const session = await getServerSession(authOptions);
    console.log("[PATCH /api/site-settings] Session:", session);

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

    // 2. Parse body safely
    let body;
    try {
      body = await request.json();
      console.log("[PATCH] Received payload:", body);
    } catch (e) {
      console.error("[PATCH] Invalid JSON body:", e);
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    // 3. Update in Prisma – let it handle only existing fields
    const updated = await prisma.siteSettings.update({
      where: { id: 1 },
      data: body,
    });

    console.log("[PATCH] Update successful:", updated);

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[PATCH /api/site-settings] ERROR:", {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack?.split("\n").slice(0, 5),
    });

    let status = 500;
    let errorMessage = "Internal server error";

    if (error.code === "P2025") {
      status = 404;
      errorMessage = "Settings record not found (id=1 missing)";
    } else if (error.code?.startsWith("P")) {
      status = 400;
      errorMessage = `Database error: ${error.message}`;
    }

    return NextResponse.json({ error: errorMessage }, { status });
  }
}