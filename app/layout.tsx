import "@/app/_styles/globals.css";
import { Inter } from "next/font/google";
import { Metadata } from "next";
import ClientLayout from "./_components/ClientLayout"; 
import prisma from "@/app/lib/prisma"; // Import Prisma

// Force dynamic rendering ensures we always get the latest settings from the DB
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MarvelMarts",
  description: "E-commerce for gadgets, phones & computers",
};

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-inter",
});

// We make the Layout function 'async' so we can await the database call
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  
  // Fetch settings from Prisma (Server-side)
  // findFirst() gets the single settings record we created
  const settings = await prisma.siteSettings.findFirst();

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        {/* Pass the settings into ClientLayout to satisfy the TypeScript requirement */}
          <ClientLayout settings={settings as any}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}