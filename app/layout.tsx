import "@/app/_styles/globals.css"
import { Metadata } from 'next'
import { Inter } from "next/font/google"
import Footer from '@/app/_components/Footer'
import Header from '@/app/_components/Header'

export const metadata: Metadata = {
  title: 'MarvelMarts',
  description: 'E-commerce for gadgets, phones & computers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" >
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}



const inter = Inter({
  subsets: ["latin"],
  weight: ["100","200","300","400", "500", "600", "700", "800", "900"], 
  display: "swap",
  variable: "--font-inter",   // optional CSS variable
});



