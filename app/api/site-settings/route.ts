import { NextResponse } from "next/server";
import { SiteSettingsService } from "@/app/lib/services/site-settings.service";

import { requireAdmin,
  handleApiError,
} from "@/app/lib/auth/api";

import {
  badRequest,
  notFound,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                              DEFAULT SETTINGS                              */
/* -------------------------------------------------------------------------- */

const DEFAULT_SETTINGS = {
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
};

/* -------------------------------------------------------------------------- */
/*                                   GET                                      */
/* -------------------------------------------------------------------------- */

export async function GET() {
  try {
   const settings =
    await SiteSettingsService.getSettings();

    return NextResponse.json(
      settings ?? DEFAULT_SETTINGS
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/* -------------------------------------------------------------------------- */
/*                                  PATCH                                     */
/* -------------------------------------------------------------------------- */

export async function PATCH(request: Request) {
  try {
    await requireAdmin();

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      throw badRequest("Invalid JSON payload.");
    }

    const updated =
      await SiteSettingsService.updateSettings(
        body
      );

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}