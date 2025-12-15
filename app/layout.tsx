import "@/app/_styles/globals.css";
import { Inter } from "next/font/google";
import { Metadata } from "next";
import ClientLayout from "./_components/ClientLayout";
// import { NotificationProvider } from "@/app/_context/NotificationContext"; 

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        {/* Wrap everything with NotificationProvider to give access to the notification context */}
        
          <ClientLayout>
            {children}
          </ClientLayout>
      
      </body>
    </html>
  );
}

