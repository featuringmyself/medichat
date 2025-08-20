import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "MediChat - Your AI Healthcare Companion",
  description: "AI-powered healthcare assistant that reads prescriptions, analyzes medical information, and provides conversational health insights.",
  keywords: ["healthcare", "AI", "prescription analysis", "medical assistant", "telemedicine", "health tech"],
  authors: [{ name: "Dodox (Rudra N Ghosh)" }],
  creator: "Dodox",
  publisher: "Dodox",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://medichat.dodox.in'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "MediChat - Your AI Healthcare Companion",
    description: "AI-powered healthcare assistant that reads prescriptions, analyzes medical information, and provides conversational health insights.",
    url: 'https://medichat.dodox.in',
    siteName: 'MediChat',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MediChat - AI Healthcare Companion',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "MediChat - Your AI Healthcare Companion",
    description: "AI-powered healthcare assistant that reads prescriptions, analyzes medical information, and provides conversational health insights.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable} antialiased`}>
      <body>
        {children}
      </body>
    </html>
    </ClerkProvider>
  )
}
