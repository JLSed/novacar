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
import {
  IconCar,
  IconCash,
  IconShoppingCart,
  IconTrendingUp,
} from "@tabler/icons-react";
import useAuth from "@/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Mock data - replace with actual data from your database
  const stats = {
    carsListed: 236,
    carsSold: 48,
    totalRevenue: "₱1,248,000",
    monthlyGrowth: "+12.5%",
  };

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
                  {stats.carsListed}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total vehicles in inventory
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
                  {stats.carsSold}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
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
                  {stats.totalRevenue}
                </div>
                <p className="text-xs text-muted-foreground">All time sales</p>
              </CardContent>
            </Card>

            {/* Growth Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Growth
                </CardTitle>
                <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent2">
                  {stats.monthlyGrowth}
                </div>
                <p className="text-xs text-muted-foreground">
                  Compared to last month
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
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">Nissan Skyline GT-R R34</p>
                      <p className="text-sm text-muted-foreground">
                        Added 2 hours ago
                      </p>
                    </div>
                    <p className="font-semibold text-primary">₱85,000</p>
                  </div>
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">Toyota Supra MK4</p>
                      <p className="text-sm text-muted-foreground">
                        Added 5 hours ago
                      </p>
                    </div>
                    <p className="font-semibold text-primary">₱72,000</p>
                  </div>
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">Mazda RX-7 FD</p>
                      <p className="text-sm text-muted-foreground">
                        Added 1 day ago
                      </p>
                    </div>
                    <p className="font-semibold text-primary">₱45,000</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle className="text-primary">Quick Stats</CardTitle>
                <CardDescription>Overview of your dealership</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">JDM Cars</span>
                  <span className="font-semibold">142</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Sports Cars</span>
                  <span className="font-semibold">68</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Luxury Cars</span>
                  <span className="font-semibold">26</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pending Sales</span>
                  <span className="font-bold text-accent2">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Inquiries</span>
                  <span className="font-bold text-accent2">34</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
