-- Run this once in the Supabase SQL editor to make the deal-images bucket public.
-- This allows getPublicUrl() to return accessible URLs instead of 403s.
UPDATE storage.buckets SET public = true WHERE id = 'deal-images';
