import { prisma } from "@/app/lib/prisma"; 

async function main() {
  try {
    const existing = await prisma.siteSettings.findUnique({
      where: { id:1 },
    });

    if (existing) {
      console.log("SiteSettings row (id=1) already exists. No action taken.");
      return;
    }

    const created = await prisma.siteSettings.create({
      data: {
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
      },
    });

    console.log("Successfully created SiteSettings row:", created);
  } catch (error) {
    console.error("Failed to seed SiteSettings:", error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });