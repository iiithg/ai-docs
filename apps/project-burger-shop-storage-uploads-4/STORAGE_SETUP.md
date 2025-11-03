# Supabase Storage Setup Guide

## Problem Description
The current upload failure is caused by the missing `avatars` bucket in your Supabase project. Error message:
```
Bucket not found
```

## Solution

### Method 1: Manual Creation via Supabase Dashboard (Recommended)

1. **Login to Supabase Dashboard**
   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Create Storage Bucket**
   - Click "Storage" in the left sidebar
   - Click "Create a new bucket"
   - Fill in the following information:
     ```
     Name: avatars
     Public bucket: ✅ (checked)
     File size limit: 2 MB
     Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
     ```
   - Click "Create bucket"

3. **Configure Access Policies (Optional)**
   - In the Storage page, click the "Policies" tab
   - Add the following policies for the `avatars` bucket:
     
     **Upload Policy (Allow users to upload):**
     ```sql
     CREATE POLICY "Users can upload avatars" ON storage.objects
     FOR INSERT WITH CHECK (bucket_id = 'avatars');
     ```
     
     **Read Policy (Public access):**
     ```sql
     CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
     FOR SELECT USING (bucket_id = 'avatars');
     ```

### Method 2: Using Automated Script

If you have already configured your `.env.local` file, you can run:

```bash
# Ensure dependencies are installed
npm install

# Run the setup script
node scripts/setup-storage.js
```

## Verify Setup

After setup is complete, you should see:

1. **In Supabase Dashboard**:
   - `avatars` bucket in Storage > Buckets
   - Bucket shows as "Public"

2. **In the Application**:
   - Upload functionality works normally
   - No more "Bucket not found" errors

## Bucket Configuration Details

- **Name**: `avatars`
- **Type**: Public bucket
- **Max file size**: 2MB
- **Supported file types**: PNG, JPG, GIF, WEBP
- **TUS Protocol**: Supports resumable uploads

## Frequently Asked Questions

**Q: Why do we need a public bucket?**
A: Avatar images need to be publicly displayed in the application. Setting it as a public bucket allows direct access via URL.

**Q: Can I modify the file size limit?**
A: Yes, you can modify it in the bucket settings, but it's recommended not to exceed 5MB to ensure upload performance.

**Q: How do I delete a bucket?**
A: In the Supabase Dashboard Storage page, click the delete button next to the bucket. Note: Deleting a bucket will delete all files within it.