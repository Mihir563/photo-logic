import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import BackButton from "@/components/BackButton"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "PhotoLogic - Photography Booking Platform",
  description: "Connect with talented photographers for your special moments",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          <BackButton/>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

