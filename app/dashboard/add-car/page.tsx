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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddCarPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    stock_number: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    mileage: 0,
    fuel_type: "",
    transmission: "",
    price: 0,
    engine_size: "",
    horsepower: 0,
    drive_type: "",
    exterior_color: "",
    interior_color: "",
    number_of_doors: 4,
    seating_capacity: 5,
    vin: "",
    condition: "",
    description: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "year" ||
        name === "month" ||
        name === "mileage" ||
        name === "price" ||
        name === "horsepower" ||
        name === "number_of_doors" ||
        name === "seating_capacity"
          ? Number(value)
          : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let imageUrls: string[] = [];

      // Upload images first if any
      if (imageFiles.length > 0) {
        setIsUploading(true);
        const uploadFormData = new FormData();
        imageFiles.forEach((file) => {
          uploadFormData.append("files", file);
        });

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || "Failed to upload images");
        }

        imageUrls = uploadData.urls;
        setIsUploading(false);
      }

      // Add car with image URLs
      const response = await fetch("/api/cars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image_urls: imageUrls,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add car");
      }

      // Redirect to dashboard on success
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

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
                <BreadcrumbPage>Add Car</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="mx-auto w-full max-w-6xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">
                  <span className="text-accent2">Add</span> New Car
                </CardTitle>
                <CardDescription>
                  Fill in the details below to add a new car to your inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                      {error}
                    </div>
                  )}

                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">
                      Basic Information
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="stock_number">Stock Number *</Label>
                        <Input
                          id="stock_number"
                          name="stock_number"
                          value={formData.stock_number}
                          onChange={handleInputChange}
                          placeholder="STK-12345"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="brand">Brand *</Label>
                        <Select
                          onValueChange={(value) =>
                            handleSelectChange("brand", value)
                          }
                          value={formData.brand}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Nissan">Nissan</SelectItem>
                            <SelectItem value="Toyota">Toyota</SelectItem>
                            <SelectItem value="Honda">Honda</SelectItem>
                            <SelectItem value="Mazda">Mazda</SelectItem>
                            <SelectItem value="Subaru">Subaru</SelectItem>
                            <SelectItem value="BMW">BMW</SelectItem>
                            <SelectItem value="Mercedes-Benz">
                              Mercedes-Benz
                            </SelectItem>
                            <SelectItem value="Audi">Audi</SelectItem>
                            <SelectItem value="Porsche">Porsche</SelectItem>
                            <SelectItem value="Ferrari">Ferrari</SelectItem>
                            <SelectItem value="Lamborghini">
                              Lamborghini
                            </SelectItem>
                            <SelectItem value="Ford">Ford</SelectItem>
                            <SelectItem value="Chevrolet">Chevrolet</SelectItem>
                            <SelectItem value="Acura">Acura</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="model">Model *</Label>
                        <Input
                          id="model"
                          name="model"
                          value={formData.model}
                          onChange={handleInputChange}
                          placeholder="Skyline GT-R"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vin">VIN</Label>
                        <Input
                          id="vin"
                          name="vin"
                          value={formData.vin}
                          onChange={handleInputChange}
                          placeholder="JN1BCNY34U0000000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Year and Mileage */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">
                      Year & Mileage
                    </h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="year">Year *</Label>
                        <Select
                          onValueChange={(value) =>
                            handleSelectChange("year", value)
                          }
                          value={formData.year.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="month">Month *</Label>
                        <Select
                          onValueChange={(value) =>
                            handleSelectChange("month", value)
                          }
                          value={formData.month.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month, index) => (
                              <SelectItem
                                key={month}
                                value={(index + 1).toString()}
                              >
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mileage">Mileage (km) *</Label>
                        <Input
                          id="mileage"
                          name="mileage"
                          type="number"
                          value={formData.mileage}
                          onChange={handleInputChange}
                          placeholder="50000"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Technical Specifications */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">
                      Technical Specifications
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fuel_type">Fuel Type *</Label>
                        <Select
                          onValueChange={(value) =>
                            handleSelectChange("fuel_type", value)
                          }
                          value={formData.fuel_type}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select fuel type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Gasoline">Gasoline</SelectItem>
                            <SelectItem value="Diesel">Diesel</SelectItem>
                            <SelectItem value="Electric">Electric</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                            <SelectItem value="Plug-in Hybrid">
                              Plug-in Hybrid
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transmission">Transmission *</Label>
                        <Select
                          onValueChange={(value) =>
                            handleSelectChange("transmission", value)
                          }
                          value={formData.transmission}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select transmission" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Manual">Manual</SelectItem>
                            <SelectItem value="Automatic">Automatic</SelectItem>
                            <SelectItem value="CVT">CVT</SelectItem>
                            <SelectItem value="Semi-Automatic">
                              Semi-Automatic
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="engine_size">Engine Size</Label>
                        <Input
                          id="engine_size"
                          name="engine_size"
                          value={formData.engine_size}
                          onChange={handleInputChange}
                          placeholder="2.6L"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="horsepower">Horsepower</Label>
                        <Input
                          id="horsepower"
                          name="horsepower"
                          type="number"
                          value={formData.horsepower}
                          onChange={handleInputChange}
                          placeholder="280"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="drive_type">Drive Type</Label>
                        <Select
                          onValueChange={(value) =>
                            handleSelectChange("drive_type", value)
                          }
                          value={formData.drive_type}
                        >
                          <SelectTrigger>
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
                        <Label htmlFor="condition">Condition *</Label>
                        <Select
                          onValueChange={(value) =>
                            handleSelectChange("condition", value)
                          }
                          value={formData.condition}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Like New">Like New</SelectItem>
                            <SelectItem value="Excellent">Excellent</SelectItem>
                            <SelectItem value="Good">Good</SelectItem>
                            <SelectItem value="Fair">Fair</SelectItem>
                            <SelectItem value="Used">Used</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Appearance */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">
                      Appearance & Interior
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="exterior_color">Exterior Color</Label>
                        <Input
                          id="exterior_color"
                          name="exterior_color"
                          value={formData.exterior_color}
                          onChange={handleInputChange}
                          placeholder="Bayside Blue"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="interior_color">Interior Color</Label>
                        <Input
                          id="interior_color"
                          name="interior_color"
                          value={formData.interior_color}
                          onChange={handleInputChange}
                          placeholder="Black"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="number_of_doors">Number of Doors</Label>
                        <Select
                          onValueChange={(value) =>
                            handleSelectChange("number_of_doors", value)
                          }
                          value={formData.number_of_doors.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select doors" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="seating_capacity">
                          Seating Capacity
                        </Label>
                        <Select
                          onValueChange={(value) =>
                            handleSelectChange("seating_capacity", value)
                          }
                          value={formData.seating_capacity.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select seats" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="7">7</SelectItem>
                            <SelectItem value="8">8</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">
                      Pricing
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (USD) *</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="85000"
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">
                      Description
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="description">Car Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe the car's condition, history, special features, modifications, etc."
                        rows={6}
                      />
                    </div>
                  </div>

                  {/* Images */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">
                      Car Images
                    </h3>
                    <div className="space-y-2">
                      <Label>Upload Images</Label>
                      <FileUpload
                        maxFiles={10}
                        maxSize={5}
                        accept="image/*"
                        onFilesChange={setImageFiles}
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload high-quality images of your car from different
                        angles. The first image will be used as the main photo.
                      </p>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard")}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="shining_button"
                      disabled={isLoading || isUploading}
                    >
                      {isUploading
                        ? "Uploading Images..."
                        : isLoading
                        ? "Adding Car..."
                        : "Add Car"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
