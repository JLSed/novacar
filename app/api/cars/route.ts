import { createClient } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const carData = await request.json();

    // Validate required fields
    const requiredFields = [
      "stock_number",
      "brand",
      "model",
      "year",
      "month",
      "mileage",
      "fuel_type",
      "transmission",
      "price",
      "condition",
    ];

    for (const field of requiredFields) {
      if (!carData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
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

    // Insert car into database
    const { data, error } = await supabase
      .from("cars")
      .insert({
        ...carData,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Database insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: "Car added successfully",
        car: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add car error:", error);
    return NextResponse.json(
      { error: "An error occurred while adding the car" },
      { status: 500 }
    );
  }
}
