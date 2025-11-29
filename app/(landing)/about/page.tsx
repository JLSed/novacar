"use client";
import Footer from "@/components/footer";
import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const teamMembers = [
  {
    name: "John Lawrence Sedillo",
    role: "Founder & CEO",
    description: "20+ years in automotive industry",
  },
  {
    name: "Gab Francisco",
    role: "Head of Operations",
    description: "Former logistics director at Toyota",
  },
  {
    name: "Jaycee Mark Ong",
    role: "Chief Curator",
    description: "JDM specialist and collector",
  },
  {
    name: "John Patrick Del Prado",
    role: "Customer Relations",
    description: "Ensuring seamless experiences",
  },
  {
    name: "Kim Dalawan",
    role: "Customer Relations",
    description: "Ensuring seamless experiences",
  },
];

const stats = [
  { value: "500+", label: "Cars Sold" },
  { value: "10+", label: "Years Experience" },
  { value: "98%", label: "Customer Satisfaction" },
  { value: "24/7", label: "Support Available" },
];

const values = [
  {
    icon: "🔍",
    title: "Transparency",
    description:
      "Every vehicle comes with a complete history report and thorough inspection documentation.",
  },
  {
    icon: "✨",
    title: "Quality",
    description:
      "We curate only the finest vehicles that meet our rigorous standards for performance and condition.",
  },
  {
    icon: "🤝",
    title: "Trust",
    description:
      "Building lasting relationships with our clients through honest dealings and exceptional service.",
  },
  {
    icon: "🚗",
    title: "Passion",
    description:
      "Our team shares your love for automotive excellence, especially JDM legends and sports cars.",
  },
];

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);

  // Hero animation
  useGSAP(() => {
    if (heroRef.current) {
      const elements = heroRef.current.querySelectorAll(".hero-animate");
      gsap.fromTo(
        elements,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
          delay: 0.2,
        }
      );
    }
  }, []);

  // Stats animation on scroll
  useGSAP(() => {
    if (statsRef.current) {
      const statItems = statsRef.current.querySelectorAll(".stat-item");
      gsap.fromTo(
        statItems,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 80%",
          },
        }
      );
    }
  }, []);

  // Values animation on scroll
  useGSAP(() => {
    if (valuesRef.current) {
      const valueCards = valuesRef.current.querySelectorAll(".value-card");
      gsap.fromTo(
        valueCards,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: valuesRef.current,
            start: "top 80%",
          },
        }
      );
    }
  }, []);

  return (
    <div className="bg-background flex flex-col items-center justify-center gap-large max-md:gap-medium relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 left-1/4 w-[600px] h-[600px] bg-accent2/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="pt-32 max-md:pt-20 relative w-full max-w-desktop flex flex-col items-center gap-medium max-md:gap-small px-4"
      >
        <h1 className="text-center text-primary hero-animate">NovaCar</h1>
        <h6 className="text-center max-w-[700px] hero-animate">
          Your trusted destination for premium sports cars and iconic JDM
          legends. We connect passionate enthusiasts with their dream vehicles.
        </h6>
        <div className="h-1 bg-accent2 w-[200px] hero-animate"></div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        className="w-full bg-primary/10 py-medium max-md:py-small"
      >
        <div className="max-w-desktop mx-auto grid grid-cols-4 max-md:grid-cols-2 gap-medium max-md:gap-small px-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="stat-item flex flex-col items-center gap-2 text-center"
            >
              <h2 className="text-accent2">{stat.value}</h2>
              <p className="text-foreground font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What is NovaCar Section */}
      <section className="max-w-desktop w-full grid grid-cols-2 max-md:grid-cols-1 gap-large items-center px-4">
        <div className="flex flex-col gap-small">
          <h2 className="text-primary">
            <span className="text-accent2">What</span> is NovaCar?
          </h2>
          <p className="text-foreground leading-relaxed">
            NovaCar is a premier online automotive marketplace specializing in
            sports cars and JDM (Japanese Domestic Market) legends. Founded by
            automotive enthusiasts, we understand the thrill of finding that
            perfect vehicle.
          </p>
          <p className="text-foreground leading-relaxed">
            Our platform connects sellers with passionate buyers, offering a
            curated selection of vehicles that meet our strict quality
            standards. From classic Nissan Skylines to modern BMW sports cars,
            every listing is verified and documented.
          </p>
          <p className="text-foreground leading-relaxed">
            We handle inquiries, facilitate viewings, and ensure a seamless
            transaction process from browsing to purchase. Our team of experts
            is always available to assist with any questions about our
            inventory.
          </p>
        </div>
        <div className="relative w-full h-[400px] max-md:h-[300px] rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent2/20 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-accent2 mb-2">Premium Selection</h3>
              <p className="text-foreground/70">Curated with passion</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-desktop w-full flex flex-col gap-medium px-4">
        <div className="text-center">
          <h2 className="text-primary">
            <span className="text-accent2">How</span> It Works
          </h2>
          <h6 className="mt-2">Simple steps to find your dream car</h6>
        </div>
        <div className="grid grid-cols-4 max-md:grid-cols-2 gap-medium">
          <div className="flex flex-col items-center text-center gap-4 p-small bg-card rounded-lg border border-border">
            <div className="w-16 h-16 rounded-full bg-accent2/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-accent2">1</span>
            </div>
            <h5 className="text-primary">Browse</h5>
            <p className="text-small text-foreground/80">
              Explore our curated collection of sports cars and JDM legends
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-4 p-small bg-card rounded-lg border border-border">
            <div className="w-16 h-16 rounded-full bg-accent2/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-accent2">2</span>
            </div>
            <h5 className="text-primary">Inquire</h5>
            <p className="text-small text-foreground/80">
              Send an inquiry for any vehicle you&apos;re interested in
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-4 p-small bg-card rounded-lg border border-border">
            <div className="w-16 h-16 rounded-full bg-accent2/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-accent2">3</span>
            </div>
            <h5 className="text-primary">Connect</h5>
            <p className="text-small text-foreground/80">
              Our team will reach out to schedule viewings and answer questions
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-4 p-small bg-card rounded-lg border border-border">
            <div className="w-16 h-16 rounded-full bg-accent2/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-accent2">4</span>
            </div>
            <h5 className="text-primary">Drive</h5>
            <p className="text-small text-foreground/80">
              Complete the purchase and drive home in your dream car
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="max-w-desktop w-full grid grid-cols-2 max-md:grid-cols-1 gap-medium px-4">
        <div className="bg-card border border-border rounded-lg p-medium flex flex-col gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-primary">Our Mission</h3>
          <p className="text-foreground leading-relaxed">
            To revolutionize the way enthusiasts discover and acquire premium
            vehicles. We strive to make the car buying experience transparent,
            enjoyable, and trustworthy. Every interaction with NovaCar should
            feel like connecting with fellow automotive enthusiasts who share
            your passion.
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-medium flex flex-col gap-4">
          <div className="w-12 h-12 rounded-full bg-accent2/20 flex items-center justify-center">
            <span className="text-2xl">🌟</span>
          </div>
          <h3 className="text-accent2">Our Vision</h3>
          <p className="text-foreground leading-relaxed">
            To become the Philippines&apos; most trusted marketplace for sports
            cars and JDM legends. We envision a community where car enthusiasts
            can confidently find authentic, quality vehicles while connecting
            with like-minded individuals who appreciate automotive excellence.
          </p>
        </div>
      </section>

      {/* Our Values Section */}
      <section
        ref={valuesRef}
        className="max-w-desktop w-full flex flex-col gap-medium px-4"
      >
        <div className="text-center">
          <h2 className="text-primary">
            <span className="text-accent2">Our</span> Values
          </h2>
          <h6 className="mt-2">The principles that drive us</h6>
        </div>
        <div className="grid grid-cols-4 max-md:grid-cols-2 gap-small">
          {values.map((value, index) => (
            <div
              key={index}
              className="value-card flex flex-col items-center text-center gap-4 p-small bg-card/50 rounded-lg border border-border hover:border-accent2/50 transition-colors"
            >
              <span className="text-4xl">{value.icon}</span>
              <h5 className="text-primary">{value.title}</h5>
              <p className="text-small text-foreground/80">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-desktop w-full flex flex-col gap-medium px-4">
        <div className="text-center">
          <h2 className="text-primary">
            <span className="text-accent2">Meet</span> The Team
          </h2>
          <h6 className="mt-2">Passionate experts behind NovaCar</h6>
        </div>
        <div className="grid grid-cols-4 max-md:grid-cols-2 gap-medium">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center gap-2"
            >
              <h5 className="text-primary">{member.name}</h5>
              <p className="text-accent2 text-small">{member.role}</p>
              <p className="text-foreground/70 text-xsmall">
                {member.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-desktop w-full bg-gradient-to-r from-primary/10 to-accent2/10 rounded-lg p-large max-md:p-medium flex flex-col items-center gap-medium text-center mx-4">
        <h2 className="text-primary">
          Ready to Find Your <span className="text-accent2">Dream Car?</span>
        </h2>
        <p className="text-foreground max-w-[600px]">
          Browse our curated collection of premium sports cars and JDM legends.
          Your next adventure awaits.
        </p>
        <a href="/browse">
          <button className="shining_button">BROWSE CARS &#8594;</button>
        </a>
      </section>

      <Footer />
    </div>
  );
}
