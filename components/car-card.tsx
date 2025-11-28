"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconBookmark, IconBookmarkFilled, IconEye } from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";

interface CarCardProps {
  car: {
    id: string;
    stock_number: string;
    brand: string;
    model: string;
    year: number;
    month: number;
    mileage: number;
    fuel_type: string;
    transmission: string;
    price: number;
    condition: string;
    status?: string;
    image_urls?: string[];
  };
  isBookmarked?: boolean;
  onBookmarkToggle?: (carId: string, isBookmarked: boolean) => void;
  onViewDetails?: (carId: string) => void;
  showStatus?: boolean;
}

export function CarCard({
  car,
  isBookmarked = false,
  onBookmarkToggle,
  onViewDetails,
  showStatus = false,
}: CarCardProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  const handleBookmarkClick = () => {
    setBookmarked(!bookmarked);
    onBookmarkToggle?.(car.id, !bookmarked);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "bg-green-600";
      case "pending":
        return "bg-yellow-500";
      case "reserved":
        return "bg-blue-600";
      case "sold":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const mainImage =
    car.image_urls && car.image_urls.length > 0
      ? car.image_urls[0]
      : "/placeholder-car.jpg";

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border">
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <Image
          src={mainImage}
          alt={`${car.brand} ${car.model}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Status Ribbon */}
        {showStatus && car.status && (
          <div className="absolute top-0 left-0 overflow-hidden w-28 h-28 pointer-events-none">
            <div
              className={`${getStatusColor(
                car.status
              )} text-white text-[11px] font-bold uppercase py-1.5 text-center transform -rotate-45 -translate-x-7 translate-y-5 w-36 shadow-md tracking-wide`}
            >
              {car.status}
            </div>
          </div>
        )}

        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur hover:bg-background"
            onClick={handleBookmarkClick}
          >
            {bookmarked ? (
              <IconBookmarkFilled className="h-4 w-4 text-accent2" />
            ) : (
              <IconBookmark className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur">
            {car.condition}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Car Name */}
        <div>
          <h3 className="font-bold text-lg text-primary">
            {car.brand} {car.model}
          </h3>
          <p className="text-sm text-muted-foreground">
            {car.year} • {car.month} Month • {car.mileage.toLocaleString()} km
          </p>
        </div>

        {/* Details */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {car.transmission}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {car.fuel_type}
          </Badge>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-2xl font-bold text-primary">
              {formatPrice(car.price)}
            </p>
            <p className="text-xs text-muted-foreground">
              Stock: {car.stock_number}
            </p>
          </div>
          <Button
            onClick={() => onViewDetails?.(car.id)}
            className="shining_button"
          >
            <IconEye className="mr-2 h-4 w-4" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
