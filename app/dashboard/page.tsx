"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconCar,
  IconCash,
  IconShoppingCart,
  IconTrendingUp,
  IconTrendingDown,
  IconClipboardList,
  IconClock,
  IconBookmark,
  IconEye,
} from "@tabler/icons-react";
import useAuth from "@/hooks/useAuth";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Car {
  id: string;
  stock_number: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  status: string;
  condition: string;
  fuel_type: string;
  transmission: string;
  created_at: string;
  updated_at: string;
}

interface Inquiry {
  id: string;
  status: string;
  created_at: string;
}

interface DashboardStats {
  carsListed: number;
  carsSold: number;
  totalRevenue: number;
  monthlyGrowth: number;
  previousMonthRevenue: number;
  currentMonthRevenue: number;
  availableCars: number;
  pendingCars: number;
  reservedCars: number;
  pendingInquiries: number;
  totalInquiries: number;
  totalBookmarks: number;
  newCarsThisMonth: number;
  avgCarPrice: number;
}

interface RecentCar {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCars, setRecentCars] = useState<RecentCar[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get current date info for monthly calculations
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonthStart = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Fetch all cars
      const { data: allCars, error: carsError } = await supabase
        .from("cars")
        .select(
          "id, stock_number, brand, model, year, price, status, condition, fuel_type, transmission, created_at, updated_at"
        );

      if (carsError) {
        console.error("Error fetching cars:", carsError);
        return;
      }

      const cars: Car[] = allCars || [];

      // Fetch all inquiries
      const { data: allInquiries } = await supabase
        .from("inquiries")
        .select("id, status, created_at");

      const inquiries: Inquiry[] = allInquiries || [];

      // Fetch bookmarks count
      const { count: bookmarksCount } = await supabase
        .from("bookmarks")
        .select("*", { count: "exact", head: true });

      // Calculate stats
      const totalCars = cars.length;
      const soldCars = cars.filter((car) => car.status === "sold");
      const availableCars = cars.filter((car) => car.status === "available");
      const pendingCars = cars.filter((car) => car.status === "pending");
      const reservedCars = cars.filter((car) => car.status === "reserved");

      // Total revenue from sold cars
      const totalRevenue = soldCars.reduce(
        (sum, car) => sum + Number(car.price),
        0
      );

      // Calculate monthly revenue (cars sold in current month)
      const currentMonthSoldCars = soldCars.filter((car) => {
        const soldDate = new Date(car.updated_at);
        return soldDate >= currentMonthStart;
      });
      const currentMonthRevenue = currentMonthSoldCars.reduce(
        (sum, car) => sum + Number(car.price),
        0
      );

      // Previous month sold cars
      const previousMonthSoldCars = soldCars.filter((car) => {
        const soldDate = new Date(car.updated_at);
        return soldDate >= previousMonthStart && soldDate <= previousMonthEnd;
      });
      const previousMonthRevenue = previousMonthSoldCars.reduce(
        (sum, car) => sum + Number(car.price),
        0
      );

      // Monthly growth percentage
      let monthlyGrowth = 0;
      if (previousMonthRevenue > 0) {
        monthlyGrowth =
          ((currentMonthRevenue - previousMonthRevenue) /
            previousMonthRevenue) *
          100;
      } else if (currentMonthRevenue > 0) {
        monthlyGrowth = 100; // 100% growth if no previous month data
      }

      // New cars added this month
      const newCarsThisMonth = cars.filter((car) => {
        const createdDate = new Date(car.created_at);
        return createdDate >= currentMonthStart;
      }).length;

      // Average car price (available cars only)
      const avgCarPrice =
        availableCars.length > 0
          ? availableCars.reduce((sum, car) => sum + Number(car.price), 0) /
            availableCars.length
          : 0;

      // Inquiries stats
      const pendingInquiries = inquiries.filter(
        (inq) => inq.status === "pending"
      ).length;
      const totalInquiries = inquiries.length;

      setStats({
        carsListed: totalCars,
        carsSold: soldCars.length,
        totalRevenue,
        monthlyGrowth,
        previousMonthRevenue,
        currentMonthRevenue,
        availableCars: availableCars.length,
        pendingCars: pendingCars.length,
        reservedCars: reservedCars.length,
        pendingInquiries,
        totalInquiries,
        totalBookmarks: bookmarksCount || 0,
        newCarsThisMonth,
        avgCarPrice,
      });

      // Fetch recent listings (5 most recent)
      const { data: recentData } = await supabase
        .from("cars")
        .select("id, brand, model, year, price, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentCars(recentData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchDashboardData();
    }
  }, [user, authLoading, fetchDashboardData]);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/home");
    }
  }, [authLoading, isAdmin, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      available: "bg-green-100 text-green-800 border-green-300",
      sold: "bg-gray-100 text-gray-800 border-gray-300",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      reserved: "bg-blue-100 text-blue-800 border-blue-300",
    };
    return (
      <Badge variant="outline" className={statusStyles[status] || ""}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (authLoading || loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-20 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">
          Please log in to access the dashboard
        </p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Cars Listed Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Cars Listed
                </CardTitle>
                <IconCar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {stats?.carsListed || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.availableCars || 0} available •{" "}
                  {stats?.newCarsThisMonth || 0} added this month
                </p>
              </CardContent>
            </Card>

            {/* Cars Sold Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cars Sold</CardTitle>
                <IconShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent2">
                  {stats?.carsSold || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total vehicles sold all time
                </p>
              </CardContent>
            </Card>

            {/* Total Revenue Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <IconCash className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {formatPrice(stats?.totalRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(stats?.currentMonthRevenue || 0)} this month
                </p>
              </CardContent>
            </Card>

            {/* Growth Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Growth
                </CardTitle>
                {(stats?.monthlyGrowth || 0) >= 0 ? (
                  <IconTrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <IconTrendingDown className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    (stats?.monthlyGrowth || 0) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {(stats?.monthlyGrowth || 0) >= 0 ? "+" : ""}
                  {(stats?.monthlyGrowth || 0).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  vs {formatPrice(stats?.previousMonthRevenue || 0)} last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Section */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle className="text-primary">Recent Listings</CardTitle>
                <CardDescription>
                  Latest cars added to your inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentCars.length > 0 ? (
                  <div className="space-y-4">
                    {recentCars.map((car) => (
                      <div
                        key={car.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() =>
                          router.push(`/dashboard/listed-cars/${car.id}`)
                        }
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {car.year} {car.brand} {car.model}
                            </p>
                            {getStatusBadge(car.status)}
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <IconClock className="h-3 w-3" />
                            Added {formatTimeAgo(car.created_at)}
                          </p>
                        </div>
                        <p className="font-semibold text-primary">
                          {formatPrice(car.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <IconCar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No cars listed yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle className="text-primary">Quick Stats</CardTitle>
                <CardDescription>Overview of your dealership</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-2">
                    <IconCar className="h-4 w-4 text-green-500" />
                    Available Cars
                  </span>
                  <span className="font-semibold">
                    {stats?.availableCars || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-2">
                    <IconClock className="h-4 w-4 text-yellow-500" />
                    Pending Sales
                  </span>
                  <span className="font-semibold">
                    {stats?.pendingCars || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-2">
                    <IconBookmark className="h-4 w-4 text-blue-500" />
                    Reserved Cars
                  </span>
                  <span className="font-semibold">
                    {stats?.reservedCars || 0}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <IconClipboardList className="h-4 w-4 text-accent2" />
                    Pending Inquiries
                  </span>
                  <span className="font-bold text-accent2">
                    {stats?.pendingInquiries || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-2">
                    <IconClipboardList className="h-4 w-4 text-muted-foreground" />
                    Total Inquiries
                  </span>
                  <span className="font-semibold">
                    {stats?.totalInquiries || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-2">
                    <IconEye className="h-4 w-4 text-muted-foreground" />
                    Customer Bookmarks
                  </span>
                  <span className="font-semibold">
                    {stats?.totalBookmarks || 0}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Avg. Listing Price
                  </span>
                  <span className="font-bold text-primary">
                    {formatPrice(stats?.avgCarPrice || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
