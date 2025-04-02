/*
  # Add Profile Relationships

  1. Changes
    - Add foreign key constraints from posts to profiles
    - Add foreign key constraints from replies to profiles
    - Add foreign key constraints from likes to profiles
    - Update existing tables to reference profiles.id

  2. Security
    - Maintain existing RLS policies
    - Ensure referential integrity
*/

-- Add foreign key constraints to posts table
ALTER TABLE posts
DROP CONSTRAINT IF EXISTS fk_author,
ADD CONSTRAINT fk_author
  FOREIGN KEY (author_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Add foreign key constraints to replies table
ALTER TABLE replies
DROP CONSTRAINT IF EXISTS fk_author,
ADD CONSTRAINT fk_author
  FOREIGN KEY (author_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Add foreign key constraints to likes table
ALTER TABLE likes
DROP CONSTRAINT IF EXISTS fk_user,
ADD CONSTRAINT fk_user
  FOREIGN KEY (user_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_replies_author ON replies(author_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);