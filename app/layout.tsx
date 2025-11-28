"use client";
import "./globals.css";
import { Miss_Fajardose, Oi, Poppins } from "next/font/google";
import { Toaster } from "sonner";

const oi = Oi({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-oi",
});

const poppins = Poppins({
  weight: ["400", "600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const missFajardose = Miss_Fajardose({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-miss-fajardose",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${oi.variable} ${poppins.variable} ${missFajardose.variable}`}
    >
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
