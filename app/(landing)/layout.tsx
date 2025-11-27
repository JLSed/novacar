"use client";
import "../globals.css";
import LandingNavbar from "@/components/landing-navbar";
import { LoginModalProvider } from "@/lib/contexts/login-modal-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LoginModalProvider>
      <LandingNavbar />
      {children}
    </LoginModalProvider>
  );
}
