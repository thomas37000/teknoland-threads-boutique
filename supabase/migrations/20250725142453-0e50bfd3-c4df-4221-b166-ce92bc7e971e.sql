-- Add brand_name column to profiles table for sellers
ALTER TABLE public.profiles 
ADD COLUMN brand_name text;