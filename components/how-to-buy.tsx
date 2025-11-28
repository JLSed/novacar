"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  IconCar,
  IconFileDescription,
  IconMail,
  IconBuilding,
  IconCircleNumber1,
  IconCircleNumber2,
  IconCircleNumber3,
  IconCircleNumber4,
  IconCheck,
} from "@tabler/icons-react";

interface Step {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: <IconCar className="h-6 w-6" />,
    title: "Select Your Vehicle",
    description:
      "Browse our extensive inventory and choose the vehicle that best suits your needs and preferences.",
  },
  {
    number: 2,
    icon: <IconFileDescription className="h-6 w-6" />,
    title: "Complete the Order Sheet",
    description:
      "Fill out the inquiry form with your contact information and any questions you may have about the vehicle.",
  },
  {
    number: 3,
    icon: <IconMail className="h-6 w-6" />,
    title: "Await Confirmation",
    description:
      "Our team will review your inquiry and send you a confirmation email with further details and next steps.",
  },
  {
    number: 4,
    icon: <IconBuilding className="h-6 w-6" />,
    title: "Visit NovaCar",
    description:
      "Once confirmed, visit our showroom to complete the necessary paperwork and finalize your purchase.",
  },
];

const numberIcons = [
  <IconCircleNumber1 key={1} className="h-8 w-8 text-accent2" />,
  <IconCircleNumber2 key={2} className="h-8 w-8 text-accent2" />,
  <IconCircleNumber3 key={3} className="h-8 w-8 text-accent2" />,
  <IconCircleNumber4 key={4} className="h-8 w-8 text-accent2" />,
];

export function HowToBuy() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconCheck className="h-5 w-5 text-accent2" />
          How to Purchase Your Vehicle
        </CardTitle>
        <CardDescription>
          Follow these simple steps to make your dream car a reality.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.number}>
              <div className="flex gap-4">
                {/* Step Number Icon */}
                <div className="shrink-0 flex items-start pt-1">
                  {numberIcons[index]}
                </div>

                {/* Step Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent2/10 text-accent2">
                      {step.icon}
                    </div>
                    <h4 className="font-semibold text-primary">{step.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-14">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Separator between steps */}
              {index < steps.length - 1 && (
                <div className="ml-4 pl-[11px] py-2">
                  <div className="w-0.5 h-6 bg-border" />
                </div>
              )}
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        {/* Additional Info */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <IconBuilding className="h-4 w-4 text-accent2" />
            Visit Us
          </h4>
          <p className="text-sm text-muted-foreground">
            Our showroom is open Monday to Saturday, 9:00 AM - 6:00 PM. We look
            forward to helping you find your perfect vehicle.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
