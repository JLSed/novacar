import { LoginForm } from "@/components/login-form";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-background flex flex-col items-center justify-center">
      <div className="absolute inset-0 w-full h-full">
        <AspectRatio ratio={16 / 9}>
          <Image
            src="/landing_bg1.png"
            alt="Landing Background"
            fill
            className="object-cover z-0"
          />
        </AspectRatio>
      </div>
      <div className="pt-32 relative w-full max-w-desktop flex flex-col items-center gap-medium">
        <h1 className="text-center text-primary">
          <span className="text-accent2">Find</span> the right car.
        </h1>
        <h6 className="text-center max-w-[582px]">
          Unleash the thrill. Discover a curated collection of sports cars and
          iconic JDM legends.
        </h6>
        <Link href={"/browse"} className="">
          <button className="shining_button w-full">BROWSE &#8594;</button>
        </Link>
      </div>
    </div>
  );
}
