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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  IconArrowLeft,
  IconCar,
  IconCheck,
  IconCopy,
  IconLoader2,
  IconMail,
  IconMapPin,
  IconPhone,
  IconUser,
} from "@tabler/icons-react";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

interface Inquiry {
  id: string;
  car_id: string;
  user_id: string;
  name: string;
  email: string;
  city: string;
  contact_number: string;
  inquiry: string;
  status: "pending" | "contacted" | "confirmed" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  cars: {
    id: string;
    brand: string;
    model: string;
    year: number;
    stock_number: string;
    price: number;
  } | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  contacted: "bg-blue-100 text-blue-800 border-blue-300",
  confirmed: "bg-green-100 text-green-800 border-green-300",
  completed: "bg-gray-100 text-gray-800 border-gray-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

export default function InquiryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const inquiryId = params.id as string;

  const { user, loading: authLoading } = useAuth();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchInquiry = async () => {
      if (!user || !inquiryId) return;

      try {
        setLoading(true);
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;

        if (!token) {
          setError("No authentication token found");
          return;
        }

        const response = await fetch(`/api/inquiries/${inquiryId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch inquiry");
        }

        const data = await response.json();
        setInquiry(data.inquiry);
        setSelectedStatus(data.inquiry.status);
      } catch (err) {
        console.error("Error fetching inquiry:", err);
        setError("Failed to load inquiry details");
      } finally {
        setLoading(false);
      }
    };

    if (user && inquiryId) {
      fetchInquiry();
    }
  }, [user, inquiryId, supabase.auth]);

  const handleStatusChange = async (newStatus: string) => {
    if (!inquiry || !user) return;

    try {
      setSaving(true);
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setInquiry({ ...inquiry, status: newStatus as Inquiry["status"] });
      setSelectedStatus(newStatus);
      toast.success("Status updated successfully");
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, templateName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(templateName);
    toast.success("Email template copied to clipboard");
    setTimeout(() => setCopiedTemplate(null), 2000);
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Email templates
  const getAcceptedTemplate = () => {
    if (!inquiry) return "";
    const carInfo = inquiry.cars
      ? `${inquiry.cars.year} ${inquiry.cars.brand} ${inquiry.cars.model}`
      : "the vehicle";
    const price = inquiry.cars?.price
      ? formatPrice(inquiry.cars.price)
      : "the listed price";

    return `Subject: Your Inquiry Has Been Accepted - NovaCar

Dear ${inquiry.name},

Thank you for your interest in ${carInfo}!

We are pleased to inform you that your inquiry has been accepted. We would love to proceed with your request and help you get behind the wheel of your dream car.

Vehicle Details:
- Vehicle: ${carInfo}
${
  inquiry.cars?.stock_number
    ? `- Stock Number: #${inquiry.cars.stock_number}`
    : ""
}
- Price: ${price}

Next Steps:
1. Our team will contact you within 24-48 hours to discuss the details.
2. We can arrange a test drive at your convenience.
3. We'll guide you through the financing options available.

If you have any immediate questions, feel free to reach out to us.

Best regards,
The NovaCar Team

---
This email was sent regarding your inquiry submitted on ${formatDate(
      inquiry.created_at
    )}
Contact: ${inquiry.contact_number}
City: ${inquiry.city}`;
  };

  const getRejectedTemplate = () => {
    if (!inquiry) return "";
    const carInfo = inquiry.cars
      ? `${inquiry.cars.year} ${inquiry.cars.brand} ${inquiry.cars.model}`
      : "the vehicle";

    return `Subject: Update on Your Inquiry - NovaCar

Dear ${inquiry.name},

Thank you for your interest in ${carInfo} and for reaching out to NovaCar.

After careful review of your inquiry, we regret to inform you that we are unable to proceed with your request at this time. This decision may be due to one of the following reasons:

- The vehicle is no longer available
- Current inventory constraints
- Other circumstances beyond our control

We sincerely apologize for any inconvenience this may cause. We encourage you to:
- Browse our current inventory for similar vehicles
- Sign up for notifications when similar cars become available
- Contact us for personalized recommendations

We value your interest in NovaCar and hope to assist you in finding your perfect vehicle in the future.

Best regards,
The NovaCar Team

---
This email was sent regarding your inquiry submitted on ${formatDate(
      inquiry.created_at
    )}
Inquiry: "${inquiry.inquiry}"`;
  };

  const getContactedTemplate = () => {
    if (!inquiry) return "";
    const carInfo = inquiry.cars
      ? `${inquiry.cars.year} ${inquiry.cars.brand} ${inquiry.cars.model}`
      : "the vehicle";

    return `Subject: Following Up on Your Inquiry - NovaCar

Dear ${inquiry.name},

Thank you for your interest in ${carInfo}!

We wanted to reach out to discuss your inquiry and answer any questions you may have about this vehicle.

Your Inquiry:
"${inquiry.inquiry}"

We have reviewed your request and would like to schedule a call or meeting at your earliest convenience to discuss:
- Vehicle specifications and condition
- Pricing and payment options
- Test drive scheduling
- Any other questions you may have

Please let us know your preferred time for a call, or feel free to reach out to us directly.

Looking forward to hearing from you!

Best regards,
The NovaCar Team

---
Contact Number on File: ${inquiry.contact_number}
City: ${inquiry.city}`;
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
        <p className="text-muted-foreground">
          Please log in to view this inquiry
        </p>
      </div>
    );
  }

  if (error || !inquiry) {
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
                  <BreadcrumbLink href="/dashboard/inquiries">
                    Inquiries
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
                <p className="text-destructive">
                  {error || "Inquiry not found"}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push("/dashboard/inquiries")}
                >
                  <IconArrowLeft className="mr-2 h-4 w-4" />
                  Back to Inquiries
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
                <BreadcrumbLink href="/dashboard/inquiries">
                  Inquiries
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Inquiry Details</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="w-fit"
            onClick={() => router.push("/dashboard/inquiries")}
          >
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to Inquiries
          </Button>

          <div className="grid gap-4 lg:grid-cols-3">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-4">
              {/* Customer Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <IconUser className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-sm">
                      Name
                    </Label>
                    <p className="font-medium">{inquiry.name}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-sm flex items-center gap-1">
                      <IconMail className="h-3 w-3" /> Email
                    </Label>
                    <p className="font-medium">{inquiry.email}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-sm flex items-center gap-1">
                      <IconPhone className="h-3 w-3" /> Contact Number
                    </Label>
                    <p className="font-medium">{inquiry.contact_number}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-sm flex items-center gap-1">
                      <IconMapPin className="h-3 w-3" /> City
                    </Label>
                    <p className="font-medium">{inquiry.city}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <IconCar className="h-5 w-5" />
                    Vehicle Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {inquiry.cars ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-sm">
                          Vehicle
                        </Label>
                        <p className="font-medium">
                          {inquiry.cars.year} {inquiry.cars.brand}{" "}
                          {inquiry.cars.model}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-sm">
                          Stock Number
                        </Label>
                        <p className="font-medium">
                          #{inquiry.cars.stock_number}
                        </p>
                      </div>
                      {inquiry.cars.price && (
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-sm">
                            Price
                          </Label>
                          <p className="font-medium text-primary">
                            {formatPrice(inquiry.cars.price)}
                          </p>
                        </div>
                      )}
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-sm">
                          View Listing
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/car/${inquiry.cars?.id}`)
                          }
                        >
                          View Car Details
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Vehicle information not available
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Inquiry Message */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">
                    Customer Inquiry
                  </CardTitle>
                  <CardDescription>
                    Submitted on {formatDate(inquiry.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="whitespace-pre-wrap">{inquiry.inquiry}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Inquiry Status</CardTitle>
                  <CardDescription>
                    Update the status of this inquiry
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Current Status:
                    </span>
                    <Badge
                      variant="outline"
                      className={statusColors[inquiry.status]}
                    >
                      {inquiry.status.charAt(0).toUpperCase() +
                        inquiry.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status-select">Change Status</Label>
                    <Select
                      value={selectedStatus}
                      onValueChange={handleStatusChange}
                      disabled={saving}
                    >
                      <SelectTrigger id="status-select">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {saving && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <IconLoader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </div>
                  )}

                  <Separator />

                  <div className="text-sm text-muted-foreground">
                    <p>
                      <strong>Last Updated:</strong>{" "}
                      {formatDate(inquiry.updated_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Email Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <IconMail className="h-5 w-5" />
                    Email Templates
                  </CardTitle>
                  <CardDescription>
                    Click to copy and send to the customer
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() =>
                      copyToClipboard(getContactedTemplate(), "contacted")
                    }
                  >
                    {copiedTemplate === "contacted" ? (
                      <IconCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <IconCopy className="h-4 w-4" />
                    )}
                    Follow-up Template
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 border-green-300 text-green-700 hover:bg-green-50"
                    onClick={() =>
                      copyToClipboard(getAcceptedTemplate(), "accepted")
                    }
                  >
                    {copiedTemplate === "accepted" ? (
                      <IconCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <IconCopy className="h-4 w-4" />
                    )}
                    Acceptance Template
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() =>
                      copyToClipboard(getRejectedTemplate(), "rejected")
                    }
                  >
                    {copiedTemplate === "rejected" ? (
                      <IconCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <IconCopy className="h-4 w-4" />
                    )}
                    Rejection Template
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
