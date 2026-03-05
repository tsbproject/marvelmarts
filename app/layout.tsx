


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
  let settings = null;
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

    // If database returned nothing but didn't throw an error
    if (categories.length === 0) {
       console.warn("Database connected but returned 0 categories.");
    }

  } catch (error) {
    console.error("Database fetch failed in RootLayout:", error);
    
    //FALLBACK: Prevent UI disappearance when Neon DB is ENOTFOUND
    settings = {
      footerDesc: "The Ultimate Armory for Gadgets & Tech.",
      supportPhone: "Contact Support",
      supportEmail: "support@marvelmarts.com"
    };
  
  try{
    } catch (error) {
  console.error("Database fetch failed:", error);
  // This fallback ensures the array is NOT empty
  categories = [
    { 
      id: "fallback-mobile", 
      name: "Browse All Categories", 
      slug: "all", 
      children: [] 
    }
  ] as any;
}
    
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

  return (
    <html lang="en" className={inter.variable}>
      <body 
        className={`${inter.className} bg-brand-ghost text-brand-black antialiased`} 
        suppressHydrationWarning
      >
        <ClientLayout 
          // settings={settings as any} 
          initialCategories={categories}
        >
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}





