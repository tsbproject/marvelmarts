


// import "@/app/_styles/globals.css";
// import { Inter } from "next/font/google";
// import { Metadata } from "next";
// import ClientLayout from "./_components/ClientLayout"; 
// import prisma from "@/app/lib/prisma";
// import type { Category } from "@prisma/client";

// // Define the recursive type to match your nested children include

// export type CategoryTree = Category & { 
//   children?: CategoryTree[] 
// };
// export type CategoryWithChildren = Category & {
//   children?: CategoryWithChildren[]; 
// };

// export const dynamic = "force-dynamic";

// export const metadata: Metadata = {
//   title: "Marvelmarts – Nigeria’s Trusted Online Store for Deals & Quality Products",
//   description: "Marvelmarts is your one‑stop online shopping destination in Nigeria. Discover affordable fashion, electronics, beauty, and home essentials with fast delivery and secure checkout."
// };

// const inter = Inter({
//   subsets: ["latin"],
//   variable: "--font-inter",
//   display: "swap",
// });



// export default async function RootLayout({ children }: { children: React.ReactNode }) {
//   let settings = null;
//   let categories: CategoryWithChildren[] = [];

//   try {
//     // Parallel fetch: DB data is ready before the page hits the browser
//     const [dbSettings, dbCategories] = await Promise.all([
//       prisma.siteSettings.findFirst(),
//       prisma.category.findMany({
//         where: { 
//           OR: [
//             { parentId: null },
//             { parentId: "" } 
//           ]
//         },
//         include: {
//           children: {
//             include: { children: true }
//           }
//         },
//         orderBy: { position: 'asc' }
//       })
//     ]);

//     settings = dbSettings;
//     categories = dbCategories as CategoryWithChildren[];

//     // If database returned nothing but didn't throw an error
//     if (categories.length === 0) {
//        console.warn("Database connected but returned 0 categories.");
//     }

//   } catch (error) {
//     console.error("Database fetch failed in RootLayout:", error);
    
//     //FALLBACK: Prevent UI disappearance when Neon DB is ENOTFOUND
//     settings = {
//       footerDesc: "The Ultimate Armory for Gadgets & Tech.",
//       supportPhone: "Contact Support",
//       supportEmail: "support@marvelmarts.com"
//     };
  
//   try{
//     } catch (error) {
//   console.error("Database fetch failed:", error);
//   // This fallback ensures the array is NOT empty
//   categories = [
//     { 
//       id: "fallback-mobile", 
//       name: "Browse All Categories", 
//       slug: "all", 
//       children: [] 
//     }
//   ] as any;
// }
    
//     categories = [
//       { 
//         id: "emergency-all", 
//         name: "Browse Armory", 
//         slug: "all", 
//         parentId: null, 
//         children: [],
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         image: null,
//         description: null,
//         position: 0
//       }
//     ] as any;
//   }

//   return (
//     <html lang="en" className={inter.variable}>
//       <body 
//         className={`${inter.className} bg-brand-ghost text-brand-black antialiased`} 
//         suppressHydrationWarning
//       >
//         <ClientLayout 
//           settings={settings as any} 
//           initialCategories={categories}
//         >
//           {children}
//         </ClientLayout>
//       </body>
//     </html>
//   );
// }





import "@/app/_styles/globals.css";
import { Inter } from "next/font/google";
import { Metadata } from "next";
import ClientLayout from "./_components/ClientLayout"; 
import prisma from "@/app/lib/prisma";
import type { Category } from "@prisma/client";

// Define the recursive type to match your nested children include
export type CategoryTree = Category & { 
  children?: CategoryTree[] 
};
export type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[]; 
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marvelmarts – Nigeria’s Trusted Online Store for Deals & Quality Products",
  description: "Marvelmarts is your one‑stop online shopping destination in Nigeria. Discover affordable fashion, electronics, beauty, and home essentials with fast delivery and secure checkout."
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let settings: any = null;
  let categories: CategoryWithChildren[] = [];

  try {
    // Parallel fetch: DB data is ready before the page hits the browser
    const [dbSettings, dbCategories] = await Promise.all([
      prisma.siteSettings.findFirst(),
      prisma.category.findMany({
        where: { 
          OR: [
            { parentId: null },
            { parentId: "" } 
          ]
        },
        include: {
          children: {
            include: { children: true }
          }
        },
        orderBy: { position: 'asc' }
      })
    ]);

    settings = dbSettings;
    categories = dbCategories as CategoryWithChildren[];

    if (categories.length === 0) {
       console.warn("Database connected but returned 0 categories.");
    }

  } catch (error) {
    console.error("Database fetch failed in RootLayout:", error);
    
    // FALLBACK: Robust default settings to prevent UI breakage
    settings = {
      siteName: "MarvelMarts",
      primaryColor: "#002B5B",
      secondaryColor: "#F7931E",
      accentColor: "#1E1E1E",
      bodyBg: "#F8F8F8",
      cardBg: "#FFFFFF",
      textPrimary: "#1E1E1E",
      baseFontSize: 16, // Defaulting to 16px stabilized root
      headingFontSize: 1.0, 
      bodyFontSize: 1.0, 
      footerDesc: "The Ultimate Armory for Gadgets & Tech.",
      supportPhone: "Contact Support",
      supportEmail: "support@marvelmarts.com"
    };
  
    categories = [
      { 
        id: "emergency-all", 
        name: "Browse Armory", 
        slug: "all", 
        parentId: null, 
        children: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        image: null,
        description: null,
        position: 0
      }
    ] as any;
  }

  // --- ENTERPRISE DESIGN SYSTEM INJECTION ---
  const dynamicStyles = {
   
    "--accent-navy": settings?.primaryColor || "#002B5B",
    "--brand-primary": settings?.secondaryColor || "#F7931E",
    "--brand-black": settings?.accentColor || "#1E1E1E",
    
    "--brand-ghost": settings?.bodyBg || "#F8F8F8",
    "--brand-white": settings?.cardBg || "#FFFFFF",
    "--sidebar-bg": settings?.sidebarBg || "#002B5B",
    
    "--success-color": settings?.successColor || "#10B981",
    "--error-color": settings?.errorColor || "#EF4444",
    "--warning-color": settings?.warningColor || "#FBBF24",
    "--border-main": settings?.borderDefault || "#E5E7EB",

        "--root-stabilizer": "16px", 

      // DYNAMIC TEXT: This is what the slider actually controls
      // We calculate a ratio: (Target Size / 16)
      "--text-scale-factor": (Number(settings?.baseFontSize) || 16) / 16,

    // TYPOGRAPHY - Added strict Number conversion to prevent string errors
    "--base-font-size": "16px",
    // "--base-font-size": `${Number(settings?.baseFontSize) || 16}px`, 
    "--heading-font-scale": Number(settings?.headingFontSize) || 1.0, 
    "--body-font-scale": (Number(settings?.baseFontSize) / 16) * (Number(settings?.bodyFontSize) || 1.0),
    // "--body-font-scale": Number(settings?.bodyFontSize) || 1.0,
    
    "--font-main": settings?.fontFamily || "Inter",
    "--font-heading": settings?.headingFont || "Outfit",

    // ZONE SCALES - Ensure these match your new Prisma fields exactly
    "--header-font-scale": Number(settings?.headerFontScale) || 1.0,
    "--footer-font-scale": Number(settings?.footerFontScale) || 1.0,
    "--carousel-font-scale": Number(settings?.carouselFontScale) || 1.0,
  } as React.CSSProperties;
  return (
    <html lang="en" className={inter.variable}>
      <body 
        className={`${inter.className} bg-brand-ghost text-brand-black antialiased`} 
        style={dynamicStyles} 
        suppressHydrationWarning
      >
        <ClientLayout 
          settings={settings as any} 
          initialCategories={categories}
        >
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}