"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CarCard } from "@/components/car-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  IconSearch,
  IconFilter,
  IconX,
  IconCar,
  IconLoader2,
  IconChevronLeft,
  IconChevronRight,
  IconUserCircle,
  IconLogout,
  IconLogin,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import useAuth from "@/hooks/useAuth";

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
  drive_type?: string;
  exterior_color?: string;
}

interface Filters {
  search: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  year: string;
  transmission: string;
  fuelType: string;
  condition: string;
  driveType: string;
  status: string;
  sortBy: string;
}

const initialFilters: Filters = {
  search: "",
  brand: "all",
  minPrice: "",
  maxPrice: "",
  year: "all",
  transmission: "all",
  fuelType: "all",
  condition: "all",
  driveType: "all",
  status: "all",
  sortBy: "newest",
};

export default function BrowsePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const itemsPerPage = 12;

  // Extract unique values for filters
  const brands = useMemo(
    () => [...new Set(cars.map((car) => car.brand))].sort(),
    [cars]
  );
  const years = useMemo(
    () => [...new Set(cars.map((car) => car.year))].sort((a, b) => b - a),
    [cars]
  );
  const transmissions = useMemo(
    () => [...new Set(cars.map((car) => car.transmission))].sort(),
    [cars]
  );
  const fuelTypes = useMemo(
    () => [...new Set(cars.map((car) => car.fuel_type))].sort(),
    [cars]
  );
  const conditions = useMemo(
    () => [...new Set(cars.map((car) => car.condition))].sort(),
    [cars]
  );
  const driveTypes = useMemo(
    () =>
      [...new Set(cars.map((car) => car.drive_type).filter(Boolean))].sort(),
    [cars]
  );
  const statuses = useMemo(
    () => [...new Set(cars.map((car) => car.status).filter(Boolean))].sort(),
    [cars]
  );

  // Fetch cars
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("cars")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching cars:", error);
        } else {
          setCars(data || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [supabase]);

  // Fetch bookmarks if user is logged in
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("bookmarks")
        .select("car_id")
        .eq("user_id", user.id);

      if (!error && data) {
        setBookmarkedIds(new Set(data.map((b) => b.car_id)));
      }
    };

    fetchBookmarks();
  }, [user, supabase]);

  // Filter and sort cars
  const filteredCars = useMemo(() => {
    let result = [...cars];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (car) =>
          car.brand.toLowerCase().includes(searchLower) ||
          car.model.toLowerCase().includes(searchLower) ||
          car.stock_number.toLowerCase().includes(searchLower)
      );
    }

    // Brand filter
    if (filters.brand !== "all") {
      result = result.filter((car) => car.brand === filters.brand);
    }

    // Price range filter
    if (filters.minPrice) {
      result = result.filter(
        (car) => car.price >= parseFloat(filters.minPrice)
      );
    }
    if (filters.maxPrice) {
      result = result.filter(
        (car) => car.price <= parseFloat(filters.maxPrice)
      );
    }

    // Year filter
    if (filters.year !== "all") {
      result = result.filter((car) => car.year === parseInt(filters.year));
    }

    // Transmission filter
    if (filters.transmission !== "all") {
      result = result.filter(
        (car) => car.transmission === filters.transmission
      );
    }

    // Fuel type filter
    if (filters.fuelType !== "all") {
      result = result.filter((car) => car.fuel_type === filters.fuelType);
    }

    // Condition filter
    if (filters.condition !== "all") {
      result = result.filter((car) => car.condition === filters.condition);
    }

    // Drive type filter
    if (filters.driveType !== "all") {
      result = result.filter((car) => car.drive_type === filters.driveType);
    }

    // Status filter
    if (filters.status !== "all") {
      result = result.filter((car) => car.status === filters.status);
    }

    // Sorting
    switch (filters.sortBy) {
      case "newest":
        // Already sorted by created_at desc
        break;
      case "oldest":
        result.reverse();
        break;
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "mileage-low":
        result.sort((a, b) => a.mileage - b.mileage);
        break;
      case "mileage-high":
        result.sort((a, b) => b.mileage - a.mileage);
        break;
      case "year-new":
        result.sort((a, b) => b.year - a.year);
        break;
      case "year-old":
        result.sort((a, b) => a.year - b.year);
        break;
    }

    return result;
  }, [cars, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  const paginatedCars = filteredCars.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.brand !== "all") count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.year !== "all") count++;
    if (filters.transmission !== "all") count++;
    if (filters.fuelType !== "all") count++;
    if (filters.condition !== "all") count++;
    if (filters.driveType !== "all") count++;
    if (filters.status !== "all") count++;
    return count;
  }, [filters]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
  };

  const handleBookmarkToggle = async (carId: string, isBookmarked: boolean) => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from("bookmarks")
          .insert({ user_id: user.id, car_id: carId });

        if (!error) {
          setBookmarkedIds((prev) => new Set([...prev, carId]));
        }
      } else {
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
        }
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const handleViewDetails = (carId: string) => {
    router.push(`/car/${carId}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const userName =
    user?.user_metadata?.first_name || user?.email?.split("@")[0] || "User";

  // Filter sidebar content (reused in both desktop and mobile)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-primary">
          Price Range
        </Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            className="flex-1"
          />
          <span className="self-center text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      <Separator />

      {/* Brand */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-primary">Brand</Label>
        <Select
          value={filters.brand}
          onValueChange={(value) => handleFilterChange("brand", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-primary">Year</Label>
        <Select
          value={filters.year}
          onValueChange={(value) => handleFilterChange("year", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Transmission */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-primary">
          Transmission
        </Label>
        <Select
          value={filters.transmission}
          onValueChange={(value) => handleFilterChange("transmission", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Transmissions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transmissions</SelectItem>
            {transmissions.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fuel Type */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-primary">Fuel Type</Label>
        <Select
          value={filters.fuelType}
          onValueChange={(value) => handleFilterChange("fuelType", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Fuel Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fuel Types</SelectItem>
            {fuelTypes.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Condition */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-primary">Condition</Label>
        <Select
          value={filters.condition}
          onValueChange={(value) => handleFilterChange("condition", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Conditions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conditions</SelectItem>
            {conditions.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Drive Type */}
      {driveTypes.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-primary">
            Drive Type
          </Label>
          <Select
            value={filters.driveType}
            onValueChange={(value) => handleFilterChange("driveType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Drive Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Drive Types</SelectItem>
              {driveTypes.map((d) => (
                <SelectItem key={d} value={d as string}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Status */}
      {statuses.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-primary">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s as string} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Separator />

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            clearFilters();
            setMobileFiltersOpen(false);
          }}
        >
          <IconX className="mr-2 h-4 w-4" />
          Clear All Filters ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image
              src="/novacar_logo.svg"
              width={80}
              height={80}
              alt="NovaCar Logo"
              className="cursor-pointer"
              onClick={() => router.push("/")}
            />
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl mx-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by brand, model, or stock number..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* User Menu */}
          {authLoading ? (
            <IconLoader2 className="h-5 w-5 animate-spin" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <IconUserCircle className="h-5 w-5" />
                  <span className="hidden sm:inline">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/home")}
                  className="cursor-pointer"
                >
                  <IconCar className="mr-2 h-4 w-4" />
                  My Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  <IconLogout className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  <IconLogin className="mr-2 h-4 w-4" />
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="shining_button" size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Search Bar - Mobile */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search cars..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-primary">Filters</h2>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">{activeFiltersCount} active</Badge>
                )}
              </div>
              <div className="border rounded-lg p-4 bg-card">
                <FilterContent />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <IconCar className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold text-primary">
                  Browse <span className="text-accent2">Cars</span>
                </h1>
                <Badge variant="outline" className="ml-2">
                  {filteredCars.length} results
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <Sheet
                  open={mobileFiltersOpen}
                  onOpenChange={setMobileFiltersOpen}
                >
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <IconFilter className="mr-2 h-4 w-4" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                      <SheetDescription>
                        Narrow down your car search
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => handleFilterChange("sortBy", value)}
                >
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="mileage-low">
                      Mileage: Low to High
                    </SelectItem>
                    <SelectItem value="mileage-high">
                      Mileage: High to Low
                    </SelectItem>
                    <SelectItem value="year-new">Year: Newest</SelectItem>
                    <SelectItem value="year-old">Year: Oldest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.brand !== "all" && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleFilterChange("brand", "all")}
                  >
                    Brand: {filters.brand}
                    <IconX className="ml-1 h-3 w-3" />
                  </Badge>
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => {
                      handleFilterChange("minPrice", "");
                      handleFilterChange("maxPrice", "");
                    }}
                  >
                    Price: ₱{filters.minPrice || "0"} - ₱
                    {filters.maxPrice || "∞"}
                    <IconX className="ml-1 h-3 w-3" />
                  </Badge>
                )}
                {filters.year !== "all" && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleFilterChange("year", "all")}
                  >
                    Year: {filters.year}
                    <IconX className="ml-1 h-3 w-3" />
                  </Badge>
                )}
                {filters.transmission !== "all" && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleFilterChange("transmission", "all")}
                  >
                    {filters.transmission}
                    <IconX className="ml-1 h-3 w-3" />
                  </Badge>
                )}
                {filters.fuelType !== "all" && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleFilterChange("fuelType", "all")}
                  >
                    {filters.fuelType}
                    <IconX className="ml-1 h-3 w-3" />
                  </Badge>
                )}
                {filters.condition !== "all" && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleFilterChange("condition", "all")}
                  >
                    {filters.condition}
                    <IconX className="ml-1 h-3 w-3" />
                  </Badge>
                )}
                {filters.driveType !== "all" && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleFilterChange("driveType", "all")}
                  >
                    {filters.driveType}
                    <IconX className="ml-1 h-3 w-3" />
                  </Badge>
                )}
              </div>
            )}

            {/* Cars Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-96 bg-muted animate-pulse rounded-lg"
                  />
                ))}
              </div>
            ) : paginatedCars.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedCars.map((car) => (
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <IconChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <IconChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 border border-dashed border-border rounded-lg">
                <IconCar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-primary mb-2">
                  No cars found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms
                </p>
                {activeFiltersCount > 0 && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
