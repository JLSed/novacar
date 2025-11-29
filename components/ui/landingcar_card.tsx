'use client";';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import { useRef } from "react";
import { useRouter } from "next/navigation";

type props = {
  image_path: string;
  brand_name: string;
  model_name: string;
};

const LandingCarCard = ({ image_path, brand_name, model_name }: props) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const router = useRouter();

  useGSAP(() => {
    if (!cardRef.current) return;

    const brandChars = cardRef.current.querySelectorAll("#brand_name .char");
    const modelChars = cardRef.current.querySelectorAll("#model_name .char");

    timelineRef.current = gsap.timeline({ paused: true });
    timelineRef.current.to(
      cardRef.current.querySelector("#brand_name"),
      {
        y: -100,
        x: -60,
        scale: 0.9,
        ease: "circ.inOut",
      },
      0
    );

    brandChars.forEach((char, i) => {
      const rotation = (i - brandChars.length / 2) * 8;
      timelineRef.current?.to(
        char,
        {
          rotation: rotation,
          y: Math.abs(rotation) * 2,
          ease: "circ.inOut",
        },
        0
      );
    });

    timelineRef.current.to(
      cardRef.current.querySelector("#model_name"),
      {
        y: 120,
        x: 50,
        scale: 0.9,
        ease: "circ.inOut",
      },
      0
    );

    modelChars.forEach((char, i) => {
      const rotation = (i - modelChars.length / 2) * 8;
      timelineRef.current?.to(
        char,
        {
          rotation: rotation,
          y: Math.abs(rotation) * -1,
          ease: "circ.inOut",
        },
        0
      );
    });
  }, []);

  const handleMouseEnter = () => {
    timelineRef.current?.play();
  };

  const handleMouseLeave = () => {
    timelineRef.current?.reverse();
  };

  const handleClick = () => {
    router.push(`/browse?search=${encodeURIComponent(model_name)}`);
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className="relative w-lx h-full max-md:w-full aspect-video hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer"
    >
      <div className="flex flex-col w-full h-full items-center justify-center">
        <h1 id="brand_name" className="scale-50 text-primary flex">
          {brand_name.split("").map((char, i) => (
            <span key={i} className="char inline-block">
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h1>
        <h1 id="model_name" className="scale-50 text-accent2 flex">
          {model_name.split("").map((char, i) => (
            <span key={i} className="char inline-block">
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h1>
      </div>
      <Image
        src={image_path}
        alt={`${brand_name} ${model_name}`}
        fill
        className="object-cover"
      />
    </div>
  );
};

export default LandingCarCard;
