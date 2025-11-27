"use client";
import { ArrowLeft } from "lucide-react";

import { SignupForm } from "@/components/signup-form";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SignupPage() {
  const router = useRouter();

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-foreground hover:text-primary hover:cursor-pointer hover:scale-105 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/signup_image.png"
          alt="Image"
          fill
          className="absolute inset-0 object-cover"
          unoptimized={true}
        />
      </div>
    </div>
  );
}
