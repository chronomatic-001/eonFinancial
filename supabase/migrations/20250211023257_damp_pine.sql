/*
  # Add name field to user profile

  1. Changes
    - Add name column to user_profile table
    - Update handle_new_user function to store name
    - Add name to existing profiles with email prefix as default

  2. Security
    - Maintain existing RLS policies
*/

-- Add name column to user_profile
ALTER TABLE user_profile
ADD COLUMN IF NOT EXISTS name text;

-- Update existing profiles with default name
UPDATE user_profile
SET name = username
WHERE name IS NULL;

-- Make name required for future entries
ALTER TABLE user_profile
ALTER COLUMN name SET NOT NULL;

-- Update handle_new_user function to include name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profile (id, username, email, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;