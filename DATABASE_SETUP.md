# Database Setup Guide

This guide will help you set up the Supabase database for MyGallery.

## 🗄️ Database Schema

### Required Tables

#### 1. Gallery Items Table

```sql
-- Create gallery_items table
CREATE TABLE gallery_items (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  folder_id TEXT,
  is_deleted_locally BOOLEAN DEFAULT FALSE NOT NULL,
  is_permanently_deleted BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only access their own items" ON gallery_items
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_gallery_items_user_id ON gallery_items(user_id);
CREATE INDEX idx_gallery_items_folder_id ON gallery_items(folder_id);
CREATE INDEX idx_gallery_items_created_at ON gallery_items(created_at DESC);
```

#### 2. Storage Bucket Setup

```sql
-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery-images', 'gallery-images', false);

-- Create storage policies
CREATE POLICY "Users can upload their own images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'gallery-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own images" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'gallery-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images" ON storage.objects
  FOR DELETE USING (bucket_id = 'gallery-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 🛠️ Setup Instructions

1. **Open Supabase Dashboard**

   - Go to [app.supabase.com](https://app.supabase.com)
   - Create a new project or select existing one

2. **Run SQL Commands**

   - Navigate to "SQL Editor" in the left sidebar
   - Copy and paste the SQL commands above
   - Click "Run" to execute

3. **Configure Storage**

   - Go to "Storage" in the left sidebar
   - Verify that "gallery-images" bucket is created
   - Check that policies are applied

4. **Test Connection**
   - Use the test queries below to verify setup

## 🧪 Test Queries

```sql
-- Test table creation
SELECT * FROM gallery_items LIMIT 1;

-- Test storage bucket
SELECT * FROM storage.buckets WHERE id = 'gallery-images';

-- Test policies
SELECT * FROM pg_policies WHERE tablename = 'gallery_items';
```

## 🔒 Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Storage Policies**: Secure file upload/download permissions
- **User Authentication**: Built-in Supabase Auth integration
- **Data Encryption**: Automatic encryption at rest and in transit

## 📊 Performance Optimizations

- **Database Indexes**: Optimized queries for large datasets
- **Efficient Queries**: Minimized data transfer
- **Connection Pooling**: Automatic connection management
- **CDN Integration**: Fast image delivery via Supabase CDN

## 🐛 Troubleshooting

### Common Issues

1. **RLS Policy Errors**

   ```
   Solution: Ensure user is authenticated before making queries
   ```

2. **Storage Upload Fails**

   ```
   Solution: Check storage policies and bucket permissions
   ```

3. **Connection Timeout**
   ```
   Solution: Verify network connection and Supabase project status
   ```

### Debug Queries

```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'gallery_items';

-- View current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'gallery_items';

-- Check storage bucket configuration
SELECT * FROM storage.buckets;
```

## 📈 Monitoring

Monitor your database performance in Supabase Dashboard:

- **Database Usage**: Monitor storage and query performance
- **API Analytics**: Track request volume and response times
- **Error Logs**: Monitor and debug issues

---

Your database is now ready for MyGallery! 🎉
