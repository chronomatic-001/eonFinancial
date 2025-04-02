/*
  # Add User Profile Table

  1. New Tables
    - `user_profile`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `email` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_profile` table
    - Add policies for authenticated users to:
      - Read their own profile
      - Update their own profile
      - Delete their own profile
*/

CREATE TABLE IF NOT EXISTS user_profile (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- Policies for user_profile table
CREATE POLICY "Users can view own profile"
  ON user_profile
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profile
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON user_profile
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profile_updated_at
  BEFORE UPDATE
  ON user_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();