/*
  # Handle empty selections

  1. Changes
    - Modify user_selections table to ensure empty arrays are handled correctly
    - Add constraint to ensure selections is never null
    - Set default value to empty array

  2. Security
    - Maintain existing RLS policies
*/

-- Ensure selections column has proper constraints
ALTER TABLE user_selections 
ALTER COLUMN selections SET DEFAULT '{}',
ALTER COLUMN selections SET NOT NULL;

-- Add check constraint to ensure selections is at least an empty array
ALTER TABLE user_selections
ADD CONSTRAINT selections_not_null CHECK (selections IS NOT NULL);

-- Update any existing null values to empty arrays
UPDATE user_selections 
SET selections = '{}'
WHERE selections IS NULL;