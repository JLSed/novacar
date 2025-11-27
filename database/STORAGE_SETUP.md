# Supabase Storage Setup for Car Images

This guide will help you set up the storage bucket for car images in Supabase.

## Setup Instructions

### Option 1: Using SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Create a new query
4. Copy and paste the contents of `create_car_images_bucket.sql`
5. Click **Run** to execute the SQL

### Option 2: Using Supabase Dashboard UI

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Configure the bucket:
   - **Name**: `car-images`
   - **Public bucket**: ✅ Enable (checked)
   - **File size limit**: 5 MB (or your preferred limit)
   - **Allowed MIME types**: Leave empty or specify: `image/jpeg, image/png, image/webp, image/gif`
5. Click **Create bucket**

### Setting Up Storage Policies (Option 2 continued)

After creating the bucket via UI, you need to set up the policies:

1. In the Storage section, click on the `car-images` bucket
2. Go to the **Policies** tab
3. Click **New Policy**
4. Create the following policies:

#### Policy 1: Allow authenticated users to upload

- **Policy name**: Authenticated users can upload car images
- **Target roles**: authenticated
- **Policy command**: INSERT
- **USING expression**: `bucket_id = 'car-images'`

#### Policy 2: Allow public to view

- **Policy name**: Public can view car images
- **Target roles**: public
- **Policy command**: SELECT
- **USING expression**: `bucket_id = 'car-images'`

#### Policy 3: Allow users to delete their own images

- **Policy name**: Users can delete their own car images
- **Target roles**: authenticated
- **Policy command**: DELETE
- **USING expression**:

```sql
bucket_id = 'car-images' AND (storage.foldername(name))[1] = auth.uid()::text
```

#### Policy 4: Allow users to update their own images

- **Policy name**: Users can update their own car images
- **Target roles**: authenticated
- **Policy command**: UPDATE
- **USING expression**:

```sql
bucket_id = 'car-images' AND (storage.foldername(name))[1] = auth.uid()::text
```

## Verification

After setup, verify that:

1. The `car-images` bucket appears in your Storage section
2. The bucket is marked as **Public**
3. All four policies are active and enabled

## File Organization

Images are automatically organized by user ID:

```
car-images/
  └── {user_id}/
      ├── {timestamp}-{random}.jpg
      ├── {timestamp}-{random}.jpg
      └── ...
```

This structure:

- Keeps images organized by uploader
- Prevents naming conflicts
- Enables user-specific permissions
- Makes cleanup easier if needed

## Usage in Application

The application automatically:

- Uploads images to `car-images/{user_id}/{timestamp}-{random}.{ext}`
- Generates public URLs for each uploaded image
- Stores URLs in the `cars.image_urls` array field
- Uses the first image as the primary/featured image

## Limits

Default limits (can be adjusted in `components/ui/file-upload.tsx`):

- **Max files per upload**: 10 images
- **Max file size**: 5 MB per image
- **Accepted formats**: All image types (JPEG, PNG, WebP, GIF, etc.)

## Troubleshooting

### "Failed to upload images"

- Verify the `car-images` bucket exists
- Check that the bucket is set to **Public**
- Ensure storage policies are properly configured
- Verify user is authenticated

### "Unauthorized" error

- Check that the user is logged in
- Verify the authentication token is valid
- Ensure Supabase client is properly configured

### Images not displaying

- Verify the bucket is set to **Public**
- Check that the "Public can view car images" policy is enabled
- Ensure the image URLs are correctly stored in the database
