"use client";
import "../globals.css";
import LandingNavbar from "@/components/landing-navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <LandingNavbar />
      {children}
    </>
  );
}
