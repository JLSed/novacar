import { createClient } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const inquiryData = await request.json();

    // Validate required fields
    const requiredFields = [
      "car_id",
      "name",
      "email",
      "city",
      "contact_number",
      "inquiry",
    ];

    for (const field of requiredFields) {
      if (!inquiryData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inquiryData.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Get access token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const supabase = createClient();

    // Get current user from token
    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Insert inquiry into database
    const { data, error } = await supabase
      .from("inquiries")
      .insert({
        car_id: inquiryData.car_id,
        user_id: user.id,
        name: inquiryData.name,
        email: inquiryData.email,
        city: inquiryData.city,
        contact_number: inquiryData.contact_number,
        inquiry: inquiryData.inquiry,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Database insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: "Inquiry submitted successfully",
        inquiry: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add inquiry error:", error);
    return NextResponse.json(
      { error: "An error occurred while submitting the inquiry" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Get access token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const supabase = createClient();

    // Get current user from token
    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from("users")
      .select("access_level")
      .eq("user_id", user.id)
      .single();

    const isAdmin = userData?.access_level === 0;

    // Fetch inquiries based on user role
    let query = supabase
      .from("inquiries")
      .select(
        `
        *,
        cars (
          id,
          brand,
          model,
          year,
          stock_number
        )
      `
      )
      .order("created_at", { ascending: false });

    // If not admin, only show user's own inquiries
    if (!isAdmin) {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ inquiries: data }, { status: 200 });
  } catch (error) {
    console.error("Fetch inquiries error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching inquiries" },
      { status: 500 }
    );
  }
}
