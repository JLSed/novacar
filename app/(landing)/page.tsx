'use client';
import { LoginForm } from "@/components/login-form";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import LogoCard from "@/components/ui/logo_card";
import Image from "next/image";
import Link from "next/link";


export default function Home() {
  return (
    <div className="bg-background flex flex-col items-center justify-center gap-medium">
      <div className="absolute inset-0 w-full h-full">
        <AspectRatio ratio={16 / 9}>
          <Image
            src="/landing_bg1.png"
            alt="Landing Background"
            fill
            className="object-cover"
          />
        </AspectRatio>
      </div>
      <div className=" pt-32 max-md:pt-16 relative w-full max-w-desktop flex flex-col items-center gap-medium max-md:gap-small">
        <h1 className="text-center text-primary ">
          <span className="text-accent2">Find</span> the right car.
        </h1>
        <h6 className="text-center max-w-[582px] max-md:max-w-[85%]">
          Unleash the thrill. Discover a curated collection of sports cars and
          iconic JDM legends.
        </h6>
        <Link href={"/browse"} className="max-md:scale-85">
          <button className="shining_button w-full">BROWSE &#8594;</button>
        </Link>
      </div>
      <div className="max-w-desktop flex w-full justify-between z-20">
        <LogoCard image_path="/toyota_logo.png" />
        <LogoCard image_path="/nissan_logo.png" />
        <LogoCard image_path="/bmw_logo.png" />
        <LogoCard image_path="/ford_logo.png" />
        <LogoCard image_path="/acura_logo.png" />
        <LogoCard image_path="/subaru_logo.png" />
        <LogoCard image_path="/ferrari_logo.png" />
        <LogoCard image_path="/mazda_logo.png" />
      </div>
      <div className="min-h-svh">
      </div>
    </div >
  );
}
