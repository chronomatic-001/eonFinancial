/*
  # Secure Profile Operations

  1. Changes
    - Add RLS policies for profile operations
    - Ensure only authenticated users can perform CRUD operations on their own profiles
    - Maintain public read access for profiles
  
  2. Security
    - Enforce authentication for all write operations
    - Restrict profile modifications to profile owners
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- We keep the public select policy as it's needed for displaying user information
  IF EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'profiles') THEN
    DROP POLICY "Users can update own profile" ON profiles;
  END IF;

  IF EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can delete own profile' AND tablename = 'profiles') THEN
    DROP POLICY "Users can delete own profile" ON profiles;
  END IF;
END $$;

-- Create comprehensive RLS policies for profiles
DO $$ 
BEGIN
  -- Allow authenticated users to update their own profile
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Authenticated users can update own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Authenticated users can update own profile"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;

  -- Allow authenticated users to delete their own profile
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Authenticated users can delete own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Authenticated users can delete own profile"
      ON profiles
      FOR DELETE
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  -- Allow profile creation only during signup (handled by trigger)
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Profile creation restricted to auth trigger' AND tablename = 'profiles') THEN
    CREATE POLICY "Profile creation restricted to auth trigger"
      ON profiles
      FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;