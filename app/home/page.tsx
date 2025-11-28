"use client";

import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { HomeNav } from "@/components/home-nav";
import { CarCard } from "@/components/car-card";
import { IconBookmark, IconCar } from "@tabler/icons-react";

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
  status?: string;
  image_urls?: string[];
}

export default function HomePage() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [bookmarkedCars, setBookmarkedCars] = useState<Car[]>([]);
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loadingCars, setLoadingCars] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      router.push("/dashboard");
    }
  }, [isAdmin, router]);

  const fetchCars = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingCars(true);

      // Fetch bookmarked cars
      const { data: bookmarks, error: bookmarksError } = await supabase
        .from("bookmarks")
        .select(
          `
          car_id,
          cars (*)
        `
        )
        .eq("user_id", user.id);

      if (bookmarksError) {
        console.error("Error fetching bookmarks:", bookmarksError);
      } else {
        const bookmarkedCarsList =
          bookmarks?.map((b: any) => b.cars).filter(Boolean) || [];
        setBookmarkedCars(bookmarkedCarsList);
        setBookmarkedIds(new Set(bookmarkedCarsList.map((car: Car) => car.id)));
      }

      // Fetch all cars
      const { data: cars, error: carsError } = await supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: false });

      if (carsError) {
        console.error("Error fetching cars:", carsError);
      } else {
        setAllCars(cars || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingCars(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleBookmarkToggle = async (carId: string, isBookmarked: boolean) => {
    if (!user) return;
    try {
      if (isBookmarked) {
        // Add bookmark
        const { error } = await supabase
          .from("bookmarks")
          .insert({ user_id: user.id, car_id: carId });

        if (!error) {
          setBookmarkedIds((prev) => new Set([...prev, carId]));
          // Refresh bookmarked cars list
          fetchCars();
        }
      } else {
        // Remove bookmark
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("car_id", carId);

        if (!error) {
          setBookmarkedIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(carId);
            return newSet;
          });
          setBookmarkedCars((prev) => prev.filter((car) => car.id !== carId));
        }
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const handleViewDetails = (carId: string) => {
    router.push(`/car/${carId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HomeNav />

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Bookmarked Cars Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <IconBookmark className="h-6 w-6 text-accent2" />
            <h2 className="text-h4 text-primary">
              <span className="text-accent2">My</span> Bookmarks
            </h2>
          </div>

          {loadingCars ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-96 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : bookmarkedCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {bookmarkedCars.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  isBookmarked={true}
                  onBookmarkToggle={handleBookmarkToggle}
                  onViewDetails={handleViewDetails}
                  showStatus={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <IconBookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No bookmarked cars yet. Start browsing to add your favorites!
              </p>
            </div>
          )}
        </section>

        {/* All Cars Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <IconCar className="h-6 w-6 text-primary" />
            <h2 className="text-h4 text-primary">
              <span className="text-accent2">Browse</span> All Cars
            </h2>
          </div>

          {loadingCars ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="h-96 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : allCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allCars.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  isBookmarked={bookmarkedIds.has(car.id)}
                  onBookmarkToggle={handleBookmarkToggle}
                  onViewDetails={handleViewDetails}
                  showStatus={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <IconCar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No cars available at the moment.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
