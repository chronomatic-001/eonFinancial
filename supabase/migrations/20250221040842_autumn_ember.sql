/*
  # Create user selections table
  
  1. Table Structure
    - `user_selections` table for storing user feature preferences
    - Columns:
      - id (uuid, primary key)
      - user_id (uuid, foreign key to profiles)
      - selections (integer array)
      - created_at (timestamp)
      - updated_at (timestamp)
  
  2. Security
    - Enable RLS
    - Add policies for user access control
  
  3. Automation
    - Add trigger for updated_at timestamp
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS user_selections;

-- Create user_selections table
CREATE TABLE user_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  selections integer[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_selections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own selections"
  ON user_selections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own selections"
  ON user_selections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own selections"
  ON user_selections FOR UPDATE
  USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER handle_user_selections_updated_at
  BEFORE UPDATE ON user_selections
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();