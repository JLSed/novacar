import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const uploadedUrls: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        // Generate unique filename
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;

        // Convert File to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from("car-images")
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: false,
          });

        if (error) {
          errors.push(`Failed to upload ${file.name}: ${error.message}`);
          continue;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("car-images").getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);
      } catch (err) {
        errors.push(
          `Failed to upload ${file.name}: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        {
          error: "All uploads failed",
          details: errors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Upload successful",
      urls: uploadedUrls,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "An error occurred during upload" },
      { status: 500 }
    );
  }
}
