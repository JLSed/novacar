"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  IconArrowLeft,
  IconLoader2,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

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
  engine_size: string | null;
  horsepower: number | null;
  drive_type: string | null;
  exterior_color: string | null;
  interior_color: string | null;
  number_of_doors: number | null;
  seating_capacity: number | null;
  vin: string | null;
  condition: string;
  description: string | null;
  features: string[] | null;
  image_urls: string[] | null;
  status: "available" | "sold" | "pending" | "reserved";
  created_at: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-800 border-green-300",
  sold: "bg-gray-100 text-gray-800 border-gray-300",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  reserved: "bg-blue-100 text-blue-800 border-blue-300",
};

export default function EditCarPage() {
  const router = useRouter();
  const params = useParams();
  const carId = params.id as string;

  const { user, loading: authLoading } = useAuth();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Car>>({});

  const supabase = createClient();

  useEffect(() => {
    const fetchCar = async () => {
      if (!user || !carId) return;

      try {
        setLoading(true);
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;

        if (!token) {
          setError("No authentication token found");
          return;
        }

        const response = await fetch(`/api/cars/${carId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch car");
        }

        const data = await response.json();
        setCar(data.car);
        setFormData(data.car);
      } catch (err) {
        console.error("Error fetching car:", err);
        setError("Failed to load car details");
      } finally {
        setLoading(false);
      }
    };

    if (user && carId) {
      fetchCar();
    }
  }, [user, carId, supabase.auth]);

  const handleInputChange = (
    field: keyof Car,
    value: string | number | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!car || !user) return;

    try {
      setSaving(true);
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await fetch(`/api/cars/${carId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update car");
      }

      const data = await response.json();
      setCar(data.car);
      toast.success("Car updated successfully");
    } catch (err) {
      console.error("Error updating car:", err);
      toast.error("Failed to update car");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to edit this car</p>
      </div>
    );
  }

  if (error || !car) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard/listed-cars">
                    Listed Cars
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Error</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 items-center justify-center p-4">
            <Card className="max-w-md w-full">
              <CardContent className="pt-6 text-center">
                <p className="text-destructive">{error || "Car not found"}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push("/dashboard/listed-cars")}
                >
                  <IconArrowLeft className="mr-2 h-4 w-4" />
                  Back to Listed Cars
                </Button>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
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
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard/listed-cars">
                  Listed Cars
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit Car</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Back Button & Save */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/listed-cars")}
            >
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back to Listed Cars
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="shining_button"
            >
              {saving ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IconDeviceFloppy className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-4">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Edit the vehicle&apos;s basic details
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="stock_number">Stock Number</Label>
                    <Input
                      id="stock_number"
                      value={formData.stock_number || ""}
                      onChange={(e) =>
                        handleInputChange("stock_number", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand || ""}
                      onChange={(e) =>
                        handleInputChange("brand", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={formData.model || ""}
                      onChange={(e) =>
                        handleInputChange("model", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year || ""}
                      onChange={(e) =>
                        handleInputChange("year", parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₱)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "price",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mileage">Mileage (km)</Label>
                    <Input
                      id="mileage"
                      type="number"
                      value={formData.mileage || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "mileage",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Technical Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">
                    Technical Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fuel_type">Fuel Type</Label>
                    <Select
                      value={formData.fuel_type || ""}
                      onValueChange={(value) =>
                        handleInputChange("fuel_type", value)
                      }
                    >
                      <SelectTrigger id="fuel_type">
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gasoline">Gasoline</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="Electric">Electric</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                        <SelectItem value="LPG">LPG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transmission">Transmission</Label>
                    <Select
                      value={formData.transmission || ""}
                      onValueChange={(value) =>
                        handleInputChange("transmission", value)
                      }
                    >
                      <SelectTrigger id="transmission">
                        <SelectValue placeholder="Select transmission" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Automatic">Automatic</SelectItem>
                        <SelectItem value="Manual">Manual</SelectItem>
                        <SelectItem value="CVT">CVT</SelectItem>
                        <SelectItem value="Semi-Automatic">
                          Semi-Automatic
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select
                      value={formData.condition || ""}
                      onValueChange={(value) =>
                        handleInputChange("condition", value)
                      }
                    >
                      <SelectTrigger id="condition">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Used">Used</SelectItem>
                        <SelectItem value="Certified Pre-Owned">
                          Certified Pre-Owned
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="drive_type">Drive Type</Label>
                    <Select
                      value={formData.drive_type || ""}
                      onValueChange={(value) =>
                        handleInputChange("drive_type", value)
                      }
                    >
                      <SelectTrigger id="drive_type">
                        <SelectValue placeholder="Select drive type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FWD">FWD</SelectItem>
                        <SelectItem value="RWD">RWD</SelectItem>
                        <SelectItem value="AWD">AWD</SelectItem>
                        <SelectItem value="4WD">4WD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="engine_size">Engine Size</Label>
                    <Input
                      id="engine_size"
                      value={formData.engine_size || ""}
                      onChange={(e) =>
                        handleInputChange("engine_size", e.target.value)
                      }
                      placeholder="e.g., 2.0L"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="horsepower">Horsepower</Label>
                    <Input
                      id="horsepower"
                      type="number"
                      value={formData.horsepower || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "horsepower",
                          parseInt(e.target.value) || null
                        )
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Colors & Interior */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">
                    Colors & Interior
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="exterior_color">Exterior Color</Label>
                    <Input
                      id="exterior_color"
                      value={formData.exterior_color || ""}
                      onChange={(e) =>
                        handleInputChange("exterior_color", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interior_color">Interior Color</Label>
                    <Input
                      id="interior_color"
                      value={formData.interior_color || ""}
                      onChange={(e) =>
                        handleInputChange("interior_color", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number_of_doors">Number of Doors</Label>
                    <Input
                      id="number_of_doors"
                      type="number"
                      value={formData.number_of_doors || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "number_of_doors",
                          parseInt(e.target.value) || null
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seating_capacity">Seating Capacity</Label>
                    <Input
                      id="seating_capacity"
                      type="number"
                      value={formData.seating_capacity || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "seating_capacity",
                          parseInt(e.target.value) || null
                        )
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={5}
                    placeholder="Enter vehicle description..."
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Vehicle Status</CardTitle>
                  <CardDescription>
                    Update the availability status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Current Status:
                    </span>
                    <Badge
                      variant="outline"
                      className={statusColors[car.status]}
                    >
                      {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status-select">Change Status</Label>
                    <Select
                      value={formData.status || car.status}
                      onValueChange={(value) =>
                        handleInputChange("status", value)
                      }
                    >
                      <SelectTrigger id="status-select">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      <strong>Created:</strong> {formatDate(car.created_at)}
                    </p>
                    <p>
                      <strong>Last Updated:</strong>{" "}
                      {formatDate(car.updated_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* VIN */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">VIN</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    id="vin"
                    value={formData.vin || ""}
                    onChange={(e) => handleInputChange("vin", e.target.value)}
                    placeholder="Vehicle Identification Number"
                  />
                </CardContent>
              </Card>

              {/* Images Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Images</CardTitle>
                  <CardDescription>
                    {car.image_urls?.length || 0} image(s) uploaded
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {car.image_urls && car.image_urls.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {car.image_urls.slice(0, 4).map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`${car.brand} ${car.model} - ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No images uploaded
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/car/${car.id}`)}
                  >
                    View Public Listing
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
