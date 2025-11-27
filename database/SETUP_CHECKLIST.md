# Image Upload Setup Checklist

Follow these steps to enable car image uploads in your NovaCar application.

## ✅ Prerequisites

- [ ] Supabase project created and configured
- [ ] Environment variables set (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [ ] User authentication working
- [ ] Cars table created in database

## ✅ Setup Steps

### 1. Create Storage Bucket

**Option A: SQL Editor (Recommended)**

- [ ] Open Supabase Dashboard → SQL Editor
- [ ] Copy contents of `database/create_car_images_bucket.sql`
- [ ] Run the SQL script
- [ ] Verify bucket appears in Storage section

**Option B: UI Dashboard**

- [ ] Open Supabase Dashboard → Storage
- [ ] Click "Create a new bucket"
- [ ] Name: `car-images`
- [ ] Enable "Public bucket"
- [ ] Create the bucket
- [ ] Set up the 4 policies (see `database/STORAGE_SETUP.md`)

### 2. Verify Storage Setup

- [ ] Navigate to Storage → car-images bucket
- [ ] Confirm bucket is marked as "Public"
- [ ] Check Policies tab shows 4 active policies:
  - [ ] Authenticated users can upload car images (INSERT)
  - [ ] Public can view car images (SELECT)
  - [ ] Users can delete their own car images (DELETE)
  - [ ] Users can update their own car images (UPDATE)

### 3. Test the Feature

- [ ] Run development server: `npm run dev`
- [ ] Navigate to `/dashboard/add-car`
- [ ] Fill in car details
- [ ] Upload test images (try drag & drop and click to select)
- [ ] Verify previews appear
- [ ] Submit the form
- [ ] Check Supabase Storage → car-images bucket for uploaded files
- [ ] Verify image URLs stored in `cars.image_urls` database field

## ✅ Verification

### Storage Bucket Verification

```sql
-- Run in Supabase SQL Editor to verify bucket exists
SELECT * FROM storage.buckets WHERE name = 'car-images';
```

### Policies Verification

```sql
-- Run in Supabase SQL Editor to verify policies
SELECT * FROM storage.policies WHERE bucket_id = 'car-images';
```

### Test Upload

1. Go to `/dashboard/add-car`
2. Upload at least 2 images
3. Submit form
4. Check Storage → car-images → {your-user-id} folder
5. Verify images are there

## ✅ Troubleshooting

### "Failed to upload images"

- [ ] Verify bucket exists and is named exactly `car-images`
- [ ] Check bucket is set to Public
- [ ] Confirm all 4 storage policies are active
- [ ] Verify user is authenticated (check browser dev tools → Application → Cookies)

### "Unauthorized" error

- [ ] Check user is logged in
- [ ] Verify Supabase client configuration
- [ ] Check environment variables are loaded

### Images not displaying

- [ ] Confirm bucket is Public
- [ ] Verify SELECT policy is active
- [ ] Check image URLs in database are correct

### File size errors

- [ ] Images must be under 5MB each (default limit)
- [ ] To change: Edit `components/ui/file-upload.tsx` maxSize prop
- [ ] To change in Supabase: Storage settings → File size limit

## ✅ Component Locations

- **FileUpload Component**: `components/ui/file-upload.tsx`
- **Upload API**: `app/api/upload/route.ts`
- **Add Car Page**: `app/dashboard/add-car/page.tsx`
- **SQL Script**: `database/create_car_images_bucket.sql`
- **Setup Guide**: `database/STORAGE_SETUP.md`
- **Feature Docs**: `database/IMAGE_UPLOAD_FEATURE.md`

## ✅ Configuration Options

### Change upload limits (FileUpload component)

```tsx
<FileUpload
  maxFiles={10} // Change max number of files
  maxSize={5} // Change max size in MB
  accept="image/*" // Change accepted file types
  preview={true} // Enable/disable previews
/>
```

### Adjust storage bucket settings

1. Supabase Dashboard → Storage → car-images
2. Click settings (gear icon)
3. Adjust:
   - File size limit
   - Allowed MIME types
   - Public access

## ✅ Next Steps

After setup is complete:

- [ ] Test with different image formats (JPG, PNG, WebP)
- [ ] Test with maximum file sizes
- [ ] Test uploading multiple images (10 images)
- [ ] Verify images display on frontend (when browse page is built)
- [ ] Consider adding image optimization
- [ ] Implement image deletion when car is deleted

## 📚 Documentation

For detailed information, see:

- **Storage Setup**: `database/STORAGE_SETUP.md`
- **Feature Documentation**: `database/IMAGE_UPLOAD_FEATURE.md`
- **Supabase Storage Docs**: https://supabase.com/docs/guides/storage
