/*
  # Fix Authentication Setup

  1. Changes
    - Update profiles table structure
    - Update handle_new_user function
    - Refresh RLS policies
    - Add performance indexes

  2. Security
    - Maintain RLS on profiles table
    - Update policies for profile access and management
*/

-- First, update the profiles table structure without dropping
ALTER TABLE profiles
  ALTER COLUMN nickname SET NOT NULL,
  ALTER COLUMN email SET NOT NULL;

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create updated function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger for user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles can be created during signup" ON profiles;

-- Create fresh RLS policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Profiles can be created during signup"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create or update indexes for better performance
DROP INDEX IF EXISTS idx_profiles_nickname;
DROP INDEX IF EXISTS idx_profiles_email;
CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON profiles(nickname);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);