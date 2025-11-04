# Project Burger Shop Storage Uploads - 4

🍔 **Resumable File Uploads with TUS Protocol** - Advanced file upload system with drag-and-drop interface

This project demonstrates **Supabase Storage** capabilities with resumable uploads using the TUS protocol, featuring a modern drag-and-drop interface powered by Uppy, showcasing production-ready file management patterns.

## 🚀 Features

### Supabase Storage Integration
This project showcases the following **Supabase features**:

- **📁 Storage Buckets**: Organized file storage with access control
- **🔄 TUS Protocol**: Resumable uploads that survive interruptions
- **🔐 Row Level Security**: Fine-grained access control policies
- **🔑 Public & Signed URLs**: Flexible access patterns
- **⚡ Dynamic Configuration**: Runtime Supabase configuration via UI
- **👥 Guest Uploads**: Anonymous file upload support

### Application Features
- **📤 Drag & Drop Upload**: Modern file selection interface
- **📊 Progress Tracking**: Real-time upload progress visualization
- **🎯 Error Handling**: Robust retry mechanisms and error recovery
- **🖼️ File Validation**: Size and type restrictions (2MB, images only)
- **📱 Responsive Design**: Works seamlessly on all devices
- **🔗 Smart URLs**: Automatic public/signed URL generation

## 🛠️ Quick Start

### Prerequisites
- **Node.js 18+** - Required for development
- **Supabase Project** - For storage backend
- **Basic React/Next.js knowledge** - Helpful for understanding

### 1. Installation

```bash
cd apps/project-burger-shop-storage-uploads-4
npm install
npm run dev
```

### 2. Environment Setup (Optional)

Create `.env.local` file or configure via UI:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# Optional: server-side signing fallback
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Storage Bucket Setup

**⚠️ IMPORTANT**: Create the `avatars` bucket before uploading.

#### Via Supabase Dashboard (Recommended)

1. Go to **Supabase Dashboard** → **Storage** → **Create bucket**
2. Configure bucket settings:
   ```
   Name: avatars
   Public bucket: ✅ (checked)
   File size limit: 2 MB
   Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
   ```

#### Using Setup Script

```bash
# Configure .env.local first, then run:
node scripts/setup-storage.js
```

### 4. Test Uploads

Visit `http://localhost:3000/profile` to test file uploads.

## 🎯 How It Works

### TUS Protocol Flow

1. **File Selection** - User selects files via drag-and-drop
2. **Session Creation** - TUS creates resumable upload session
3. **Chunked Upload** - File uploads in pieces, allowing interruption
4. **Progress Tracking** - Real-time updates via Uppy dashboard
5. **URL Generation** - Automatic public or signed URL creation

### File Organization

Default structure (RLS-compatible):
```
avatars/
└── public/
    └── avatar-<timestamp>-<uuid>.jpg
```

### Smart URL Generation

The application automatically:
1. **Tries Public URL** first for truly public buckets
2. **Falls back to Signed URL** (1 hour TTL) for private buckets
3. **Verifies accessibility** before returning URLs

## 📁 Project Structure

### Core Components
- **`app/components/UppyUpload.tsx`** - Main upload component with TUS integration
- **`app/profile/page.tsx`** - Profile page with upload interface
- **`app/api/storage/sign/route.ts`** - Server-side URL signing fallback
- **`lib/supabase/`** - Supabase client configuration

### Setup Scripts
- **`scripts/setup-storage.js`** - Automated bucket creation
- **`STORAGE_SETUP.md`** - Detailed setup instructions

## 🔧 Configuration Options

### Upload Restrictions
- **File Size**: Maximum 2MB per file
- **File Types**: PNG, JPG, GIF, WEBP only
- **Concurrent Uploads**: Up to 3 files simultaneously
- **Retry Logic**: Automatic retry on network failures

### Storage Settings
- **Bucket Name**: Configurable (default: `avatars`)
- **Path Prefix**: Configurable (default: `public/`)
- **Access Control**: Public bucket with RLS policies

## 🔒 Security Features

### Row Level Security (RLS)

Default RLS policies for anonymous uploads:

```sql
-- Read access for signing URLs
CREATE POLICY "avatars select for signing" ON storage.objects
FOR SELECT TO public
USING (
  bucket_id = 'avatars' AND
  split_part(name, '/', 1) = 'public' AND
  lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'webp')
);

-- Anonymous insert permissions
CREATE POLICY "avatars anon insert" ON storage.objects
FOR INSERT TO ANON
WITH CHECK (bucket_id = 'avatars' AND split_part(name, '/', 1) = 'public');

-- Anonymous update permissions (for TUS resume)
CREATE POLICY "avatars anon update" ON storage.objects
FOR UPDATE TO ANON
USING (bucket_id = 'avatars' AND split_part(name, '/', 1) = 'public');
```

### Best Practices
- **Path-based Isolation**: Users can only access specific folders
- **File Type Validation**: Restricted to image formats only
- **Size Limits**: Configurable upload size restrictions
- **Guest Upload Support**: Isolated anonymous upload areas

## ⚠️ Troubleshooting

### Common Issues

**"Bucket not found" Error**
- **Solution**: Create `avatars` bucket in Supabase Dashboard
- **Check**: Bucket name matches exactly in code

**403 Row Level Security Violation**
- **Cause**: RLS policies don't allow current path/role
- **Solution**: Adjust policies to match your bucket/path configuration
- **Default**: Uses `avatars/public/*.jpg` pattern for anonymous access

**Upload Fails Immediately**
- **Check**: Supabase URL and API key configuration
- **Verify**: Bucket is public and accessible
- **Ensure**: File size under 2MB and valid image type

**Public URL Returns 404**
- **Cause**: Bucket is private but trying to use public URL
- **Solution**: App automatically falls back to signed URLs
- **Manual**: Set bucket to public or adjust RLS policies

### TUS Resume Cache

**Important**: This demo disables TUS resume cache to prevent confusion:
- **Why**: Re-selecting the same file might "resume" a completed upload
- **Setting**: `resume: false` + `removeFingerprintOnSuccess: true`
- **Result**: Every file selection creates a fresh upload

### Debug Mode

Enable detailed logging:
```typescript
// In UppyUpload.tsx
uppy.setOptions({ debug: true });
```

## 🎨 Customization

### Changing Bucket Configuration

To use a different bucket or path:

1. **Update Supabase Dashboard**: Create/rename bucket
2. **Update Code**: Search and replace bucket name and path:
   ```typescript
   // In UppyUpload.tsx
   file.meta = {
     bucketName: 'your-bucket',
     objectName: 'your-prefix/file.ext'
   }
   ```
3. **Update RLS Policies**: Match new bucket and path patterns
4. **Test**: Verify uploads work with new configuration

### Custom File Validation

```typescript
// In UppyUpload.tsx
uppy.use(Uppy, {
  restrictions: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFileTypes: ['image/*', '.pdf'],
    maxNumberOfFiles: 5
  }
});
```

## 🧪 Testing

### Manual Testing

1. **Visit** `/profile` page
2. **Configure** Supabase settings (if not set via env)
3. **Upload** test images using drag-and-drop
4. **Verify** generated URLs are accessible
5. **Test** error handling with invalid files

### API Testing

Test server-side signing fallback:
```bash
curl -X POST http://localhost:3000/api/storage/sign \
  -H "Content-Type: application/json" \
  -d '{"path": "public/test.jpg", "expiresIn": 3600}'
```

## 📚 Further Learning

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [TUS Protocol Specification](https://tus.io/protocols/resumable-upload.html)
- [Uppy Documentation](https://uppy.io/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**🎉 Advanced Storage Demo - showcasing production-ready file upload capabilities!**
