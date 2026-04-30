import type { Metadata } from "next";
import { Archivo_Black, Space_Grotesk } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-head",
  display: "swap",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TikTakTuk",
  description: "Ticketing platform for awesome events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${archivoBlack.variable} ${space.variable} antialiased min-h-screen flex flex-col font-sans bg-background text-foreground`}
      >
        <Navbar />
        <main className="flex-1 w-full">
          <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8 pt-4 flex flex-col min-h-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
