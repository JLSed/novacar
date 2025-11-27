"use client";
import { LoginForm } from "@/components/login-form";
import { AspectRatio } from "@/components/ui/aspect-ratio";

import LandingCarCard from "@/components/ui/landingcar_card";
import LogoCard from "@/components/ui/logo_card";
import ReviewCard from "@/components/ui/review_card";
import Image from "next/image";
import Link from "next/link";
import { REVIEWS } from "@/lib/constants/reviews";
import Footer from "@/components/footer";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useLoginModal } from "@/lib/contexts/login-modal-context";

export default function Home() {
  const { showLogin, setShowLogin } = useLoginModal();
  const loginModalRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (showLogin && loginModalRef.current) {
      gsap.fromTo(
        loginModalRef.current,
        {
          scale: 0,
          opacity: 0,
          rotation: -10,
        },
        {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 0.5,
          ease: "back.out(1.7)",
        }
      );
    }
  }, [showLogin]);

  const handleCloseLogin = () => {
    if (loginModalRef.current) {
      gsap.to(loginModalRef.current, {
        scale: 0,
        opacity: 0,
        rotation: 10,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => setShowLogin(false),
      });
    }
  };

  return (
    <div className="bg-background flex flex-col items-center justify-center gap-large max-md:gap-medium relative overflow-hidden">
      {showLogin && (
        <div
          onClick={handleCloseLogin}
          className="fixed inset-0 z-50 flex justify-center items-center bg-background/50 backdrop-blur-lg"
        >
          <div
            ref={loginModalRef}
            onClick={(e) => e.stopPropagation()}
            className="relative"
          >
            <button
              onClick={handleCloseLogin}
              className="absolute -top-4 -right-4 z-10 w-10 h-10 rounded-full bg-primary text-foreground flex items-center justify-center hover:scale-110 transition-transform"
            >
              ✕
            </button>
            <LoginForm />
          </div>
        </div>
      )}
      {/* Background Image */}
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
      {/* Glowing Effects */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-[700px] h-[700px] bg-accent2/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/3 w-[550px] h-[550px] bg-primary/5 rounded-full blur-[110px] pointer-events-none"></div>

      <section className=" pt-32 max-md:pt-16 relative w-full max-w-desktop flex flex-col items-center gap-medium max-md:gap-small">
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
      </section>
      <section className="max-w-desktop grid grid-cols-8 w-full gap-small place-items-center max-md:grid-cols-2 ">
        <LogoCard image_path="/toyota_logo.png" />
        <LogoCard image_path="/nissan_logo.png" />
        <LogoCard image_path="/bmw_logo.png" />
        <LogoCard image_path="/ford_logo.png" />
        <LogoCard image_path="/acura_logo.png" />
        <LogoCard image_path="/subaru_logo.png" />
        <LogoCard image_path="/ferrari_logo.png" />
        <LogoCard image_path="/mazda_logo.png" />
      </section>
      <section className="max-w-desktop w-full relative">
        <div className="absolute left-0 top-0 inset-0 w-3xl h-24 max-md:w-sm">
          <AspectRatio ratio={24 / 10} className="">
            <Image
              src="/landing_car1.png"
              alt="Landing car"
              fill
              className="object-contain absolute"
            />
          </AspectRatio>
        </div>
        <div className="flex flex-col place-self-end max-w-[784px] max-md:max-w-[392px]">
          <h2 className="text-primary text-right">
            <span className="text-accent2"> Explore</span> Our Curated
            Collection
          </h2>
          <div className="bg-primary flex gap-3 items-center justify-end py-4 px-2 ">
            <h1 className="text-accent2 z-10">236</h1>
            <h4 className="text-accent2 z-10">Listed Cars</h4>
          </div>
        </div>
        <div className="pt-32 flex flex-col gap-6 items-center justify-center w-full">
          <h6 className="text-center max-w-[582px] max-md:max-w-[85%]">
            Unleash the thrill. Discover a curated collection of sports cars and
            iconic JDM legends.
          </h6>
          <div className="h-1 bg-primary w-[392px] max-md:w-[50%]"></div>
        </div>
      </section>
      <section className="max-w-desktop grid grid-cols-2 max-md:grid-cols-1 w-full gap-medium ">
        <LandingCarCard
          image_path="/Nissan180SXSileightyS15.png"
          brand_name="Nissan"
          model_name="180SX"
        />
        <LandingCarCard
          image_path="/BMWZ4.png"
          brand_name="BMW"
          model_name="Z4"
        />
        <LandingCarCard
          image_path="/NissanSilviaSpec.png"
          brand_name="Nissan"
          model_name="Silvia"
        />
        <LandingCarCard
          image_path="/NissanSkyline25GTT.png"
          brand_name="Nissan"
          model_name="Skyline"
        />
      </section>
      <section className="max-w-desktop w-full flex flex-col gap-small max-md:px-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-primary">
            <span className="text-accent2">Customer</span> Feedback
          </h2>
          <h6>Testimonies from our clients.</h6>
        </div>
        <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4">
          {REVIEWS.map((review, index) => (
            <ReviewCard
              key={index}
              user={review.user}
              description={review.description}
            />
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
