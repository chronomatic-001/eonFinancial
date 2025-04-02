/*
  # Update pain points schema

  1. Changes
    - Convert pain_points table to use numeric IDs
    - Update user_pain_points table to reference numeric IDs
    - Re-insert pain points with correct numeric IDs to match frontend

  2. Security
    - Maintains existing RLS policies
*/

-- First, drop existing tables and recreate with numeric IDs
DROP TABLE IF EXISTS user_pain_points;
DROP TABLE IF EXISTS pain_points;

-- Recreate pain_points table with numeric ID
CREATE TABLE pain_points (
  id integer PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Recreate user_pain_points junction table
CREATE TABLE user_pain_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  pain_point_id integer REFERENCES pain_points(id) ON DELETE CASCADE,
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

-- Insert pain points with numeric IDs matching frontend
INSERT INTO pain_points (id, name) VALUES
  (1, 'Zero Fee International Transfers'),
  (2, 'Automated Savings Rules'),
  (3, 'Real-time Investment Tracking'),
  (4, 'Budgeting & Expense Analysis'),
  (5, 'Crypto Integration'),
  (6, 'Bill Splitting & Social Payments'),
  (7, 'Customizable Spending Limits'),
  (8, 'Multi-currency Accounts'),
  (9, 'Cashback Rewards Program'),
  (10, 'High Transaction Fees'),
  (11, 'Complex Account Opening Process'),
  (12, 'Poor Customer Service'),
  (13, 'Limited Mobile Banking Features'),
  (14, 'Long Processing Times'),
  (15, 'Hidden Charges'),
  (16, 'Inflexible Account Options'),
  (17, 'Outdated Technology'),
  (18, 'Limited International Support')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;