import { GalleryVerticalEnd } from "lucide-react";
import Image from "next/image";

import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/login_background.avif"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-background/80"></div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/90"></div>
      </div>
      
      {/* Glowing effects */}
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-accent2/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="flex w-full max-w-sm flex-col gap-6 relative z-10">
        <a
          href="#"
          className="flex items-center gap-2 self-center font-medium"
        ></a>
        <LoginForm />
      </div>
    </div>
  );
}
