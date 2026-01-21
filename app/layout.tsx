import "@/app/_styles/globals.css";
import { Inter } from "next/font/google";
import { Metadata } from "next";
import ClientLayout from "./_components/ClientLayout"; 
import prisma from "@/app/lib/prisma";

// Force dynamic rendering ensures we always get the latest settings from the DB
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MarvelMarts | The Armory",
  description: "E-commerce for gadgets, phones & computers",
};

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-inter",
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  
  // Fetch settings from Prisma (Server-side)
  // Wrapped in a try-catch to prevent the whole app from failing if DB is asleep
  let settings = null;
  try {
    settings = await prisma.siteSettings.findFirst();
  } catch (error) {
    console.error("Failed to load site settings:", error);
  }

  return (
    <html lang="en" className={inter.variable}>
      <body 
        className={`${inter.className} bg-brand-ghost text-brand-black antialiased`}
        suppressHydrationWarning
      >
        
        <ClientLayout settings={settings as any}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}