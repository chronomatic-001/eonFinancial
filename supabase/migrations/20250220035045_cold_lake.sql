/*
  # Consolidate Posts and Likes Tables

  1. Changes
    - Drop redundant tables (posts, likes)
    - Rename community_posts to posts for better naming
    - Consolidate likes tables into a single table
    
  2. Security
    - Maintain existing RLS policies
    - Transfer existing policies to new consolidated tables
*/

-- First, ensure we have no orphaned likes
DELETE FROM post_likes WHERE post_id NOT IN (SELECT id FROM community_posts);
DELETE FROM reply_likes WHERE reply_id NOT IN (SELECT id FROM post_replies);

-- Drop old unused tables
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS posts CASCADE;

-- Create temporary table for storing likes data
CREATE TEMP TABLE temp_likes AS
SELECT id, post_id, user_id, created_at, NULL::uuid as reply_id
FROM post_likes
UNION ALL
SELECT id, NULL::uuid as post_id, user_id, created_at, reply_id
FROM reply_likes;

-- Drop old likes tables
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS reply_likes CASCADE;

-- Rename community_posts to posts
ALTER TABLE community_posts RENAME TO posts;

-- Create new consolidated likes table
CREATE TABLE likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  reply_id uuid REFERENCES post_replies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT like_target_check CHECK (
    (post_id IS NOT NULL AND reply_id IS NULL) OR 
    (post_id IS NULL AND reply_id IS NOT NULL)
  ),
  CONSTRAINT unique_post_like UNIQUE (user_id, post_id),
  CONSTRAINT unique_reply_like UNIQUE (user_id, reply_id)
);

-- Insert data from temporary table
INSERT INTO likes (id, post_id, reply_id, user_id, created_at)
SELECT id, post_id, reply_id, user_id, created_at
FROM temp_likes;

-- Drop temporary table
DROP TABLE temp_likes;

-- Create indexes for better performance
CREATE INDEX idx_likes_post ON likes(post_id);
CREATE INDEX idx_likes_reply ON likes(reply_id);
CREATE INDEX idx_likes_user ON likes(user_id);

-- Ensure RLS is enabled
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Recreate policies for posts table
DO $$ 
BEGIN
  -- Posts policies
  DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
  DROP POLICY IF EXISTS "Users can create posts" ON posts;
  DROP POLICY IF EXISTS "Users can update own posts" ON posts;
  DROP POLICY IF EXISTS "Users can delete own posts" ON posts;

  CREATE POLICY "Posts are viewable by everyone"
    ON posts FOR SELECT
    USING (true);

  CREATE POLICY "Users can create posts"
    ON posts FOR INSERT
    WITH CHECK (auth.uid() = author_id);

  CREATE POLICY "Users can update own posts"
    ON posts FOR UPDATE
    USING (auth.uid() = author_id);

  CREATE POLICY "Users can delete own posts"
    ON posts FOR DELETE
    USING (auth.uid() = author_id);

  -- Likes policies
  CREATE POLICY "Likes are viewable by everyone"
    ON likes FOR SELECT
    USING (true);

  CREATE POLICY "Users can create likes"
    ON likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can delete own likes"
    ON likes FOR DELETE
    USING (auth.uid() = user_id);
END $$;