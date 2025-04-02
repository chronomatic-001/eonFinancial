/*
  # Add Pain Points Tables

  1. New Tables
    - `pain_points`: Stores available pain points
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `created_at` (timestamp)
    - `user_pain_points`: Junction table for user selections
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `pain_point_id` (uuid, references pain_points)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
    - Add policies for public access to pain_points table

  3. Initial Data
    - Insert predefined pain points from the application
*/

-- Create pain_points table
CREATE TABLE pain_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create user_pain_points junction table
CREATE TABLE user_pain_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  pain_point_id uuid REFERENCES pain_points(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, pain_point_id)
);

-- Enable RLS
ALTER TABLE pain_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pain_points ENABLE ROW LEVEL SECURITY;

-- Pain points policies
CREATE POLICY "Pain points are viewable by everyone"
  ON pain_points FOR SELECT
  USING (true);

-- User pain points policies
CREATE POLICY "Users can view their own pain point selections"
  ON user_pain_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pain point selections"
  ON user_pain_points FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pain point selections"
  ON user_pain_points FOR DELETE
  USING (auth.uid() = user_id);

-- Insert initial pain points
INSERT INTO pain_points (name) VALUES
  ('Zero Fee International Transfers'),
  ('Automated Savings Rules'),
  ('Real-time Investment Tracking'),
  ('Budgeting & Expense Analysis'),
  ('Crypto Integration'),
  ('Bill Splitting & Social Payments'),
  ('Customizable Spending Limits'),
  ('Multi-currency Accounts'),
  ('Cashback Rewards Program'),
  ('High Transaction Fees'),
  ('Complex Account Opening Process'),
  ('Poor Customer Service'),
  ('Limited Mobile Banking Features'),
  ('Long Processing Times'),
  ('Hidden Charges'),
  ('Inflexible Account Options'),
  ('Outdated Technology'),
  ('Limited International Support')
ON CONFLICT (name) DO NOTHING;