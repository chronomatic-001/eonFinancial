/*
  # Merge replies tables
  
  1. Changes
    - Merge 'replies' and 'post_replies' tables into a single 'replies' table
    - Update foreign key references
    - Recreate indexes and policies
    
  2. Security
    - Enable RLS on replies table
    - Add policies for CRUD operations
*/

-- First, ensure we have no orphaned data
DELETE FROM post_replies WHERE post_id NOT IN (SELECT id FROM posts);

-- Drop old unused tables
DROP TABLE IF EXISTS replies CASCADE;

-- Rename post_replies to replies
ALTER TABLE post_replies RENAME TO replies;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_replies_post ON replies(post_id);
CREATE INDEX IF NOT EXISTS idx_replies_author ON replies(author_id);

-- Ensure RLS is enabled
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;

-- Recreate policies for replies table
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Replies are viewable by everyone" ON replies;
  DROP POLICY IF EXISTS "Users can create replies" ON replies;
  DROP POLICY IF EXISTS "Users can update own replies" ON replies;
  DROP POLICY IF EXISTS "Users can delete own replies" ON replies;

  CREATE POLICY "Replies are viewable by everyone"
    ON replies FOR SELECT
    USING (true);

  CREATE POLICY "Users can create replies"
    ON replies FOR INSERT
    WITH CHECK (auth.uid() = author_id);

  CREATE POLICY "Users can update own replies"
    ON replies FOR UPDATE
    USING (auth.uid() = author_id);

  CREATE POLICY "Users can delete own replies"
    ON replies FOR DELETE
    USING (auth.uid() = author_id);
END $$;