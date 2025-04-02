/*
  # Simplify pain points storage
  
  1. Changes
    - Drop existing pain points tables since we'll store selections in user metadata
    - Clean up any existing data
*/

-- Drop existing tables
DROP TABLE IF EXISTS user_pain_points;
DROP TABLE IF EXISTS pain_points;