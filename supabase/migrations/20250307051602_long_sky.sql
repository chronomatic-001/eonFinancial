/*
  # Add nested replies support

  1. Changes
    - Add parent_reply_id to replies table to support nested replies
    - Add foreign key constraint to ensure parent_reply_id references valid replies
    - Add check constraint to ensure a reply can't be its own parent
    - Add index on parent_reply_id for better query performance

  2. Security
    - Maintain existing RLS policies
*/

-- Add parent_reply_id column to replies table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'replies' AND column_name = 'parent_reply_id'
  ) THEN
    ALTER TABLE replies 
    ADD COLUMN parent_reply_id uuid REFERENCES replies(id) ON DELETE CASCADE;

    -- Add index for better query performance
    CREATE INDEX idx_replies_parent ON replies(parent_reply_id);

    -- Add check constraint to prevent self-referencing
    ALTER TABLE replies 
    ADD CONSTRAINT replies_no_self_parent 
    CHECK (id != parent_reply_id);
  END IF;
END $$;