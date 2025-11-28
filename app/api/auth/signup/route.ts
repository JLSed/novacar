import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { firstName, middleName, lastName, email, contactNumber, password } =
      await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !contactNumber || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Sign up the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${
          process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
        }/verify`,
      },
    });

    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 400 }
      );
    }

    // Insert user profile into the users table
    const { error: profileError } = await supabase.from("users").insert({
      user_id: authData.user.id,
      first_name: firstName,
      middle_name: middleName || null,
      last_name: lastName,
      email: email,
      contact_number: contactNumber,
      access_level: 1, // Regular user (0 = admin)
    });

    if (profileError) {
      console.error("Profile error:", profileError);
      // Note: The auth user was created, so we should inform the user
      return NextResponse.json(
        {
          error:
            "Account created but profile setup failed. Please contact support.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Account created successfully",
      user: authData.user,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
