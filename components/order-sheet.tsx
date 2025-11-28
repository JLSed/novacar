"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  IconSend,
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconMessage,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  stock_number: string;
}

interface OrderSheetProps {
  car: Car;
  user: User | null;
}

export function OrderSheet({ car, user }: OrderSheetProps) {
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    city: "",
    contact_number: "",
    inquiry: "",
  });

  // Auto-fill user data from users table and auth metadata
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        // First set email from auth user
        setFormData((prev) => ({
          ...prev,
          email: user.email || "",
        }));

        // Fetch profile data from users table
        try {
          const { data: profile, error } = await supabase
            .from("users")
            .select("first_name, middle_name, last_name, contact_number, email")
            .eq("user_id", user.id)
            .single();

          if (!error && profile) {
            // Build full name from first, middle, and last name
            const nameParts = [
              profile.first_name,
              profile.middle_name,
              profile.last_name,
            ].filter(Boolean);
            const fullName = nameParts.join(" ");

            setFormData((prev) => ({
              ...prev,
              name: fullName || prev.name,
              email: profile.email || prev.email,
              contact_number: profile.contact_number || prev.contact_number,
            }));
          }
        } catch (error) {
          console.log("Could not fetch user profile:", error);
        }
      }
    };

    fetchUserProfile();
  }, [user, supabase]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please log in to submit an inquiry");
      return;
    }

    // Validate form
    if (
      !formData.name ||
      !formData.email ||
      !formData.city ||
      !formData.contact_number ||
      !formData.inquiry
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the session token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        toast.error("Session expired. Please log in again.");
        return;
      }

      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          car_id: car.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit inquiry");
      }

      toast.success(
        "Inquiry submitted successfully! We will contact you soon."
      );

      // Reset inquiry field but keep user data
      setFormData((prev) => ({ ...prev, inquiry: "" }));
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit inquiry"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconMessage className="h-5 w-5 text-accent2" />
          Order Sheet
        </CardTitle>
        <CardDescription>
          Interested in the {car.year} {car.brand} {car.model}? Fill out the
          form below to submit your inquiry.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <IconUser className="h-4 w-4" />
              Full Name *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <IconMail className="h-4 w-4" />
              Email Address *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* City Field */}
          <div className="space-y-2">
            <Label htmlFor="city" className="flex items-center gap-2">
              <IconMapPin className="h-4 w-4" />
              City *
            </Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Enter your city"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Contact Number Field */}
          <div className="space-y-2">
            <Label htmlFor="contact_number" className="flex items-center gap-2">
              <IconPhone className="h-4 w-4" />
              Contact Number *
            </Label>
            <Input
              id="contact_number"
              name="contact_number"
              type="tel"
              value={formData.contact_number}
              onChange={handleInputChange}
              placeholder="Enter your contact number"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Inquiry Field */}
          <div className="space-y-2">
            <Label htmlFor="inquiry" className="flex items-center gap-2">
              <IconMessage className="h-4 w-4" />
              Your Inquiry *
            </Label>
            <Textarea
              id="inquiry"
              name="inquiry"
              value={formData.inquiry}
              onChange={handleInputChange}
              placeholder="Tell us about your interest in this vehicle. Any questions or specific requirements?"
              rows={4}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full shining_button"
            disabled={isSubmitting || !user}
          >
            {isSubmitting ? (
              <>Submitting...</>
            ) : (
              <>
                <IconSend className="mr-2 h-4 w-4" />
                Submit Inquiry
              </>
            )}
          </Button>

          {!user && (
            <p className="text-sm text-muted-foreground text-center">
              Please log in to submit an inquiry.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
