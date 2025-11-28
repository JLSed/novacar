import { createClient } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

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

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only admins can view all cars" },
        { status: 403 }
      );
    }

    // Fetch all cars
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ cars: data }, { status: 200 });
  } catch (error) {
    console.error("Fetch cars error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching cars" },
      { status: 500 }
    );
  }
}
