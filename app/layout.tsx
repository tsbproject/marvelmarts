import "@/app/_styles/globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";

import ClientLayout from "./_components/ClientLayout";

import type { Category } from "@prisma/client";
import { CategoryService } from "@/app/lib/services/category.service";

const SITE_URL = "https://marvelmarts.com";

export type CategoryTree = Category & {
  children?: CategoryTree[];
};

export type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[];
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default:
      "MarvelMarts – Nigeria's Trusted Online Marketplace",
    template: "%s | MarvelMarts",
  },

  description:
    "Shop quality products from trusted Nigerian merchants on MarvelMarts. Discover fashion, electronics, beauty, home essentials and more with secure checkout and convenient delivery.",

  applicationName: "MarvelMarts",

  generator: "Next.js",

  referrer: "origin-when-cross-origin",

  keywords: [
    "MarvelMarts",
    "online shopping Nigeria",
    "Nigerian online marketplace",
    "shop online Nigeria",
    "buy products online Nigeria",
    "Nigerian marketplace",
    "fashion Nigeria",
    "electronics Nigeria",
    "beauty products Nigeria",
    "home essentials Nigeria",
    "mobile phone Nigeria",
    "furniture products Nigeria",
    "laptop computer Nigeria",
    "ladies wears Nigeria",
    "mens wears Migeria",

    
  ],

  alternates: {
    canonical: SITE_URL,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_NG",
    url: SITE_URL,
    siteName: "MarvelMarts",
    title:
      "MarvelMarts – Nigeria's Trusted Online Marketplace",
    description:
      "Shop quality products from trusted Nigerian merchants. Discover fashion, electronics, beauty, home essentials and more on MarvelMarts.",
  },

  twitter: {
    card: "summary_large_image",
    title:
      "MarvelMarts – Nigeria's Trusted Online Marketplace",
    description:
      "Shop quality products from trusted Nigerian merchants on MarvelMarts.",
  },

  category: "shopping",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let categories: CategoryWithChildren[] = [];

  try {
    const dbCategories =
      await CategoryService.getNavigationCategories();

    categories = dbCategories as CategoryWithChildren[];

    if (categories.length === 0) {
      console.warn(
        "Database connected but returned 0 categories."
      );
    }
  } catch (error) {
    console.error(
      "Database fetch failed in RootLayout:",
      error
    );

   categories = [
      {
        id: "emergency-all",
        name: "Browse All",
        slug: "all",
        parentId: null,
        children: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        position: 0,
        imageUrl: null,
        metaDescription: null,
        metaTitle: null,
        isFeatured: false,
      },
    ] as CategoryWithChildren[];
  }

  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`${inter.className} bg-brand-ghost text-brand-black antialiased`}
        suppressHydrationWarning
      >
        <ClientLayout initialCategories={categories}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}