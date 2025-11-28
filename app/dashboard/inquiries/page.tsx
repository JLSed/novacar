"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Label } from "@/components/ui/label";
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconLoader2,
  IconSearch,
} from "@tabler/icons-react";
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
  } | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  contacted: "bg-blue-100 text-blue-800 border-blue-300",
  confirmed: "bg-green-100 text-green-800 border-green-300",
  completed: "bg-gray-100 text-gray-800 border-gray-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

export default function InquiriesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const supabase = createClient();

  useEffect(() => {
    const fetchInquiries = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;

        if (!token) {
          setError("No authentication token found");
          return;
        }

        const response = await fetch("/api/inquiries", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch inquiries");
        }

        const data = await response.json();
        setInquiries(data.inquiries || []);
      } catch (err) {
        console.error("Error fetching inquiries:", err);
        setError("Failed to load inquiries");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchInquiries();
    }
  }, [user, supabase.auth]);

  // Filter inquiries
  const filteredInquiries = inquiries.filter((inquiry) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      inquiry.name.toLowerCase().includes(searchLower) ||
      inquiry.email.toLowerCase().includes(searchLower) ||
      inquiry.city.toLowerCase().includes(searchLower) ||
      inquiry.cars?.brand.toLowerCase().includes(searchLower) ||
      inquiry.cars?.model.toLowerCase().includes(searchLower);

    // Status filter
    const matchesStatus =
      statusFilter === "all" || inquiry.status === statusFilter;

    // Date filter
    const inquiryDate = new Date(inquiry.created_at);
    const matchesDateFrom =
      !dateFrom || inquiryDate >= new Date(dateFrom + "T00:00:00");
    const matchesDateTo =
      !dateTo || inquiryDate <= new Date(dateTo + "T23:59:59");

    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
  const paginatedInquiries = filteredInquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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
        <p className="text-muted-foreground">Please log in to view inquiries</p>
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
                <BreadcrumbPage>Inquiries</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Customer Inquiries</CardTitle>
              <CardDescription>
                Manage and respond to customer inquiries about vehicles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                {/* Search */}
                <div className="flex-1">
                  <Label htmlFor="search" className="text-sm font-medium">
                    Search
                  </Label>
                  <div className="relative mt-1">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name, email, city, or car..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="w-full md:w-40">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status
                  </Label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger id="status" className="mt-1">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date From */}
                <div className="w-full md:w-44">
                  <Label htmlFor="dateFrom" className="text-sm font-medium">
                    From Date
                  </Label>
                  <div className="relative mt-1">
                    <IconCalendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dateFrom"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => {
                        setDateFrom(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Date To */}
                <div className="w-full md:w-44">
                  <Label htmlFor="dateTo" className="text-sm font-medium">
                    To Date
                  </Label>
                  <div className="relative mt-1">
                    <IconCalendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dateTo"
                      type="date"
                      value={dateTo}
                      onChange={(e) => {
                        setDateTo(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setDateFrom("");
                    setDateTo("");
                    setCurrentPage(1);
                  }}
                >
                  Clear
                </Button>
              </div>

              {/* Error State */}
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
                  <p className="text-destructive">{error}</p>
                </div>
              )}

              {/* Table */}
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead className="min-w-[300px]">Inquiry</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedInquiries.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No inquiries found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedInquiries.map((inquiry) => (
                        <TableRow
                          key={inquiry.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() =>
                            router.push(`/dashboard/inquiries/${inquiry.id}`)
                          }
                        >
                          <TableCell>
                            <div>
                              <p className="text-sm line-clamp-2">
                                {inquiry.inquiry.length > 200
                                  ? `${inquiry.inquiry.substring(0, 200)}...`
                                  : inquiry.inquiry}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(inquiry.created_at)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{inquiry.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {inquiry.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {inquiry.cars ? (
                              <div>
                                <p className="font-medium">
                                  {inquiry.cars.brand} {inquiry.cars.model}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {inquiry.cars.year} • #
                                  {inquiry.cars.stock_number}
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                Vehicle not found
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={statusColors[inquiry.status]}
                            >
                              {inquiry.status.charAt(0).toUpperCase() +
                                inquiry.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/dashboard/inquiries/${inquiry.id}`
                                );
                              }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredInquiries.length
                    )}{" "}
                    of {filteredInquiries.length} inquiries
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <IconChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm">
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
                      <IconChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
