import { createClient } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Fetch inquiry with car details
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
          stock_number,
          price
        )
      `
      )
      .eq("id", id)
      .single();

    // If not admin, only allow viewing own inquiries
    if (!isAdmin) {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database fetch error:", error);
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Inquiry not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ inquiry: data }, { status: 200 });
  } catch (error) {
    console.error("Fetch inquiry error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the inquiry" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = [
      "pending",
      "contacted",
      "confirmed",
      "completed",
      "cancelled",
    ];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
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

    // Check if user is admin
    const { data: userData } = await supabase
      .from("users")
      .select("access_level")
      .eq("user_id", user.id)
      .single();

    const isAdmin = userData?.access_level === 0;

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only admins can update inquiry status" },
        { status: 403 }
      );
    }

    // Update inquiry status
    const { data, error } = await supabase
      .from("inquiries")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database update error:", error);
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Inquiry not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Status updated successfully", inquiry: data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update inquiry error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the inquiry" },
      { status: 500 }
    );
  }
}
