"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import useAuth from "@/hooks/useAuth";
import { HomeNav } from "@/components/home-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import {
  IconBookmark,
  IconBookmarkFilled,
  IconArrowLeft,
  IconGasStation,
  IconManualGearbox,
  IconGauge,
  IconCalendar,
  IconPalette,
  IconUsers,
  IconEngine,
  IconSteeringWheel,
  IconNumber,
  IconCar,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { OrderSheet } from "@/components/order-sheet";
import { HowToBuy } from "@/components/how-to-buy";

interface Car {
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
  engine_size?: string;
  horsepower?: number;
  drive_type?: string;
  exterior_color?: string;
  interior_color?: string;
  number_of_doors?: number;
  seating_capacity?: number;
  vin?: string;
  description?: string;
  features?: string[];
  image_urls?: string[];
  status: string;
}

export default function CarViewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchCar = async () => {
      if (!params.id) return;

      try {
        const { data, error } = await supabase
          .from("cars")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error) {
          console.error("Error fetching car:", error);
          toast.error("Failed to load car details");
          return;
        }

        setCar(data);

        // Check if bookmarked
        if (user) {
          const { data: bookmark } = await supabase
            .from("bookmarks")
            .select("id")
            .eq("user_id", user.id)
            .eq("car_id", params.id)
            .single();

          setIsBookmarked(!!bookmark);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [params.id, user, supabase]);

  const handleBookmarkToggle = async () => {
    if (!user || !car) return;

    try {
      if (isBookmarked) {
        await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("car_id", car.id);
        setIsBookmarked(false);
        toast.success("Removed from bookmarks");
      } else {
        await supabase
          .from("bookmarks")
          .insert({ user_id: user.id, car_id: car.id });
        setIsBookmarked(true);
        toast.success("Added to bookmarks");
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast.error("Failed to update bookmark");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <HomeNav />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded-lg" />
              <div className="h-96 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-background">
        <HomeNav />
        <div className="container mx-auto px-4 py-8 text-center">
          <IconCar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-primary mb-2">
            Car Not Found
          </h1>
          <p className="text-muted-foreground mb-4">
            The car you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Button onClick={() => router.push("/home")}>
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const images =
    car.image_urls && car.image_urls.length > 0
      ? car.image_urls
      : ["/placeholder-car.jpg"];

  return (
    <div className="min-h-screen bg-background">
      <HomeNav />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <IconArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Header with Title and Bookmark */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-h3 font-bold text-primary">
              {car.year} {car.brand} {car.model}
            </h2>
            <p className="text-muted-foreground">Stock #{car.stock_number}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-h4 font-bold text-accent2">
              {formatPrice(car.price)}
            </span>
            <Button
              size="icon"
              variant="outline"
              onClick={handleBookmarkToggle}
              className="rounded-full"
            >
              {isBookmarked ? (
                <IconBookmarkFilled className="h-5 w-5 text-accent2" />
              ) : (
                <IconBookmark className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Main Content Grid: [Car Images][Order Sheet] */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Car Images Section */}
          <Card>
            <CardContent className="p-4">
              {/* Main Image */}
              <div className="relative aspect-4/3 rounded-lg overflow-hidden mb-4">
                <Image
                  src={images[selectedImage]}
                  alt={`${car.brand} ${car.model}`}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
                <div className="absolute top-2 left-2">
                  <Badge
                    variant="secondary"
                    className="bg-background/80 backdrop-blur"
                  >
                    {car.condition}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={
                      car.status === "available" ? "default" : "secondary"
                    }
                    className="capitalize"
                  >
                    {car.status}
                  </Badge>
                </div>
              </div>

              {/* Image Thumbnails Carousel */}
              {images.length > 1 && (
                <Carousel className="mx-12">
                  <CarouselContent>
                    {images.map((image, index) => (
                      <CarouselItem key={index} className="basis-1/4">
                        <button
                          onClick={() => setSelectedImage(index)}
                          className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                            selectedImage === index
                              ? "border-accent2"
                              : "border-transparent hover:border-muted-foreground/50"
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`${car.brand} ${car.model} - Image ${
                              index + 1
                            }`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              )}
            </CardContent>
          </Card>

          {/* Order Sheet Section */}
          <OrderSheet car={car} user={user} />
        </div>

        {/* Secondary Content Grid: [Car Details][How to Buy] */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Car Details Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconCar className="h-5 w-5 text-accent2" />
                Vehicle Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <IconCalendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Year</p>
                    <p className="font-medium">{car.year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <IconGauge className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Mileage</p>
                    <p className="font-medium">
                      {car.mileage.toLocaleString()} km
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <IconGasStation className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Fuel Type</p>
                    <p className="font-medium">{car.fuel_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <IconManualGearbox className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Transmission
                    </p>
                    <p className="font-medium">{car.transmission}</p>
                  </div>
                </div>
                {car.engine_size && (
                  <div className="flex items-center gap-2">
                    <IconEngine className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Engine</p>
                      <p className="font-medium">{car.engine_size}</p>
                    </div>
                  </div>
                )}
                {car.horsepower && (
                  <div className="flex items-center gap-2">
                    <IconSteeringWheel className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Horsepower
                      </p>
                      <p className="font-medium">{car.horsepower} HP</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Additional Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">
                  Additional Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {car.drive_type && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Drive Type</span>
                      <span className="font-medium">{car.drive_type}</span>
                    </div>
                  )}
                  {car.exterior_color && (
                    <div className="flex items-center gap-2">
                      <IconPalette className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Exterior</span>
                      <span className="font-medium ml-auto">
                        {car.exterior_color}
                      </span>
                    </div>
                  )}
                  {car.interior_color && (
                    <div className="flex items-center gap-2">
                      <IconPalette className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Interior</span>
                      <span className="font-medium ml-auto">
                        {car.interior_color}
                      </span>
                    </div>
                  )}
                  {car.number_of_doors && (
                    <div className="flex items-center gap-2">
                      <IconNumber className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Doors</span>
                      <span className="font-medium ml-auto">
                        {car.number_of_doors}
                      </span>
                    </div>
                  )}
                  {car.seating_capacity && (
                    <div className="flex items-center gap-2">
                      <IconUsers className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Seats</span>
                      <span className="font-medium ml-auto">
                        {car.seating_capacity}
                      </span>
                    </div>
                  )}
                  {car.vin && (
                    <div className="col-span-2 flex justify-between">
                      <span className="text-muted-foreground">VIN</span>
                      <span className="font-medium font-mono text-xs">
                        {car.vin}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {car.description && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {car.description}
                    </p>
                  </div>
                </>
              )}

              {/* Features */}
              {car.features && car.features.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {car.features.map((feature, index) => (
                        <Badge key={index} variant="outline">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* How to Buy Section */}
          <HowToBuy />
        </div>
      </main>
    </div>
  );
}
