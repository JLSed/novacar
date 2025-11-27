# Car Image Upload Feature

## Overview

The add car page now includes a comprehensive image upload feature that allows users to upload multiple car images to Supabase Storage. The feature uses a custom `FileUpload` component built with shadcn/ui design principles.

## Features

### 1. **Multiple File Upload**

- Upload up to 10 images per car
- Drag & drop support
- Click to select files
- Visual file counter showing progress (e.g., "3/10 files uploaded")

### 2. **File Validation**

- **Size limit**: 5 MB per image
- **File types**: All image formats (JPEG, PNG, WebP, GIF, etc.)
- Automatic validation with user-friendly error messages

### 3. **Image Preview**

- Real-time preview grid for uploaded images
- Responsive grid layout (2 columns mobile, 3 tablet, 4 desktop)
- Hover effects with delete button
- Displays filename at bottom of each preview

### 4. **User Experience**

- Drag & drop zone with visual feedback (changes color when dragging)
- Progress indicator during upload
- Loading states: "Uploading Images..." → "Adding Car..."
- Error handling with detailed messages

## Components

### FileUpload Component

Location: `components/ui/file-upload.tsx`

**Props:**

```typescript
{
  onFilesChange?: (files: File[]) => void;  // Callback when files change
  maxFiles?: number;                         // Default: 10
  maxSize?: number;                          // In MB, Default: 5
  accept?: string;                           // Default: "image/*"
  preview?: boolean;                         // Show previews, Default: true
}
```

**Features:**

- File drag & drop with visual feedback
- File size validation
- Max file count enforcement
- Image preview generation using FileReader API
- Individual file removal
- Responsive grid layout for previews

## API Routes

### Upload Endpoint

Location: `app/api/upload/route.ts`

**Endpoint:** `POST /api/upload`

**Request:**

- Content-Type: `multipart/form-data`
- Body: FormData with files under "files" key

**Response:**

```json
{
  "message": "Upload successful",
  "urls": ["https://...url1", "https://...url2"],
  "errors": ["error1", "error2"] // Optional, only if some uploads failed
}
```

**Process:**

1. Validates user authentication
2. Processes each file individually
3. Generates unique filename: `{user_id}/{timestamp}-{random}.{ext}`
4. Uploads to Supabase Storage `car-images` bucket
5. Returns public URLs for uploaded images

### Cars Endpoint Update

Location: `app/api/cars/route.ts`

Now accepts `image_urls` array field in the request body and stores it in the database.

## Database Schema

The `cars` table includes an `image_urls` field:

```sql
image_urls TEXT[], -- Array of image URLs from Supabase Storage
```

This stores all uploaded image URLs. The first URL in the array is typically used as the primary/featured image.

## Supabase Storage Setup

### Bucket Configuration

- **Name**: `car-images`
- **Public**: Yes (allows public viewing of images)
- **Organization**: Files stored as `{user_id}/{timestamp}-{random}.{ext}`

### Storage Policies

1. **Upload**: Authenticated users can upload images
2. **View**: Public can view images (enables displaying on website)
3. **Delete**: Users can only delete their own images
4. **Update**: Users can only update their own images

See `database/STORAGE_SETUP.md` for detailed setup instructions.

## Usage Flow

### 1. User Interaction

```
User selects/drags images
  → FileUpload validates files
  → Previews generated
  → Files stored in component state
```

### 2. Form Submission

```
User clicks "Add Car"
  → Images uploaded to /api/upload
  → Upload returns public URLs
  → Car data + image URLs sent to /api/cars
  → Car record created in database
  → Redirect to dashboard
```

### 3. Error Handling

```
File too large → Alert shown, file rejected
Max files exceeded → Alert shown, additional files rejected
Upload fails → Error displayed, form not submitted
API error → Error message shown to user
```

## Code Examples

### Using FileUpload in a Form

```tsx
const [imageFiles, setImageFiles] = useState<File[]>([]);

<FileUpload
  maxFiles={10}
  maxSize={5}
  accept="image/*"
  onFilesChange={setImageFiles}
/>;
```

### Uploading Files

```tsx
const uploadFormData = new FormData();
imageFiles.forEach((file) => {
  uploadFormData.append("files", file);
});

const response = await fetch("/api/upload", {
  method: "POST",
  body: uploadFormData,
});

const { urls } = await response.json();
```

### Storing URLs in Database

```tsx
await fetch("/api/cars", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    ...carData,
    image_urls: urls,
  }),
});
```

## Styling

The FileUpload component uses:

- **Tailwind CSS**: For responsive layouts and styling
- **shadcn/ui**: For consistent Button component styling
- **Tabler Icons**: For upload, photo, and delete icons
- **Custom animations**: Hover effects and transitions

### Key CSS Classes

- `border-dashed`: Dashed border for drop zone
- `group-hover:opacity-100`: Hover effect for delete button
- `aspect-square`: Maintains square aspect ratio for previews
- `object-cover`: Proper image scaling in previews

## Accessibility

- File input properly hidden but keyboard accessible
- Labels and descriptions for screen readers
- Visual feedback for drag & drop states
- Clear error messages
- Button disabled states when appropriate

## Performance Considerations

1. **Client-side validation**: Prevents unnecessary API calls
2. **Individual file processing**: One file error doesn't fail entire upload
3. **Unique filenames**: Prevents overwrites and caching issues
4. **Public URLs**: Direct access without additional API calls
5. **Lazy loading**: Preview images loaded as needed

## Future Enhancements

Potential improvements:

- Image compression before upload
- Image cropping/editing
- Drag to reorder images (set primary image)
- Bulk delete option
- Progress bar for individual files
- Support for video uploads
- Image optimization (WebP conversion)
- CDN integration for faster loading

## Troubleshooting

### Images not uploading

1. Check Supabase storage bucket exists and is public
2. Verify storage policies are configured correctly
3. Ensure user is authenticated
4. Check file size doesn't exceed limits
5. Verify Supabase credentials in environment variables

### Previews not showing

1. Ensure `preview={true}` prop is set
2. Check browser console for FileReader errors
3. Verify file is a valid image type

### Storage errors

1. Run `database/create_car_images_bucket.sql` in Supabase SQL Editor
2. Verify bucket name matches exactly: `car-images`
3. Check storage policies are enabled
4. Ensure sufficient storage quota

## Files Modified/Created

- ✅ `components/ui/file-upload.tsx` - New file upload component
- ✅ `app/api/upload/route.ts` - New API endpoint for uploads
- ✅ `app/dashboard/add-car/page.tsx` - Updated with image upload
- ✅ `database/create_car_images_bucket.sql` - Storage setup SQL
- ✅ `database/STORAGE_SETUP.md` - Storage setup guide
- ✅ `database/IMAGE_UPLOAD_FEATURE.md` - This documentation
