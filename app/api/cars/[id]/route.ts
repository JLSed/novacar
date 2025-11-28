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

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only admins can view car details" },
        { status: 403 }
      );
    }

    // Fetch car
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Database fetch error:", error);
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Car not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ car: data }, { status: 200 });
  } catch (error) {
    console.error("Fetch car error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the car" },
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
        { error: "Only admins can update car details" },
        { status: 403 }
      );
    }

    // Remove fields that shouldn't be updated directly
    const {
      id: _id,
      created_at: _created_at,
      created_by: _created_by,
      ...updateData
    } = body;
    void _id;
    void _created_at;
    void _created_by;

    // Validate status if provided
    if (updateData.status) {
      const validStatuses = ["available", "sold", "pending", "reserved"];
      if (!validStatuses.includes(updateData.status)) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 }
        );
      }
    }

    // Update car
    const { data, error } = await supabase
      .from("cars")
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database update error:", error);
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Car not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Car updated successfully", car: data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update car error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the car" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only admins can delete cars" },
        { status: 403 }
      );
    }

    // Delete car
    const { error } = await supabase.from("cars").delete().eq("id", id);

    if (error) {
      console.error("Database delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Car deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete car error:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the car" },
      { status: 500 }
    );
  }
}
