"use client";
import Image from "next/image";
import Link from "next/link";

const LandingNavbar = () => {
  return (
    <nav className="sticky navbar_background flex justify-between items-center p-xsmall top-0 z-50">
      <div className="cursor-pointer ">
        <Image
          src={"/novacar_logo.svg"}
          width={90}
          height={110}
          alt="logo"
          className="hover:scale-105"
        />
      </div>
      <div className="flex gap-2">
        <button className="hover:scale-105 text-accent2 p-xsmall">
          <Link href={"/browse"}>BROWSE</Link>
        </button>
        <button className="hover:scale-105 text-accent2 p-xsmall">
          <Link href={"/about"}>ABOUT</Link>
        </button>
        <Link href={"/login"}>
          <button className="hover:scale-105 text-primary p-xsmall cursor-pointer">
            LOG IN
          </button>
        </Link>
        <Link href={"/signup"}>
          <button className="shining_button">SIGN UP</button>
        </Link>
      </div>
    </nav>
  );
};

export default LandingNavbar;
