import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/next";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MediChat: AI Powered Prescription analyzer",
  description: "MediChat is an AI-powered healthcare assistant that can read and analyze prescriptions, answer health-related questions, and provide useful insights in a conversational way. Designed to make medical information more accessible, it uses OCR and AI to understand prescription details and respond with clear, context-aware answers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} antialiased`}
      >
        <Analytics />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
