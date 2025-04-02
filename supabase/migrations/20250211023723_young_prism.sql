/*
  # Merge Profile Tables

  1. Changes
    - Safely merge profiles and user_profile tables into a single profiles table
    - Preserve all necessary data
    - Update references and constraints
  
  2. Security
    - Maintain RLS policies
    - Ensure data integrity
*/

-- First, ensure we have all the data in user_profile
DO $$ 
BEGIN
  -- Copy data from profiles to user_profile if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
    INSERT INTO user_profile (id, username, email, name)
    SELECT 
      p.id,
      p.username,
      u.email,
      COALESCE(p.username, split_part(u.email, '@', 1))
    FROM profiles p
    JOIN auth.users u ON p.id = u.id
    WHERE NOT EXISTS (
      SELECT 1 FROM user_profile up WHERE up.id = p.id
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Drop the old profiles table if it exists
DROP TABLE IF EXISTS profiles CASCADE;

-- Rename user_profile to profiles
ALTER TABLE user_profile RENAME TO profiles;

-- Create posts table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'posts') THEN
    CREATE TABLE posts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      content text NOT NULL,
      author_id uuid NOT NULL,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      CONSTRAINT fk_author
        FOREIGN KEY (author_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE
    );
  END IF;
END $$;

-- Create replies table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'replies') THEN
    CREATE TABLE replies (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      content text NOT NULL,
      post_id uuid NOT NULL,
      author_id uuid NOT NULL,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      CONSTRAINT fk_post
        FOREIGN KEY (post_id)
        REFERENCES posts(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_author
        FOREIGN KEY (author_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE
    );
  END IF;
END $$;

-- Create likes table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'likes') THEN
    CREATE TABLE likes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      post_id uuid,
      reply_id uuid,
      created_at timestamptz DEFAULT now(),
      CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_post
        FOREIGN KEY (post_id)
        REFERENCES posts(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_reply
        FOREIGN KEY (reply_id)
        REFERENCES replies(id)
        ON DELETE CASCADE,
      CONSTRAINT like_target_check CHECK (
        (post_id IS NOT NULL AND reply_id IS NULL) OR
        (post_id IS NULL AND reply_id IS NOT NULL)
      ),
      CONSTRAINT unique_post_like UNIQUE (user_id, post_id),
      CONSTRAINT unique_reply_like UNIQUE (user_id, reply_id)
    );
  END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safely create RLS policies
DO $$ 
BEGIN
  -- Profiles policies
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Public profiles are viewable by everyone' AND tablename = 'profiles') THEN
    CREATE POLICY "Public profiles are viewable by everyone"
      ON profiles FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can update own profile"
      ON profiles FOR UPDATE
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can delete own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can delete own profile"
      ON profiles FOR DELETE
      USING (auth.uid() = id);
  END IF;

  -- Posts policies
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Posts are viewable by everyone' AND tablename = 'posts') THEN
    CREATE POLICY "Posts are viewable by everyone"
      ON posts FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Authenticated users can create posts' AND tablename = 'posts') THEN
    CREATE POLICY "Authenticated users can create posts"
      ON posts FOR INSERT
      WITH CHECK (auth.uid() = author_id);
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can update own posts' AND tablename = 'posts') THEN
    CREATE POLICY "Users can update own posts"
      ON posts FOR UPDATE
      USING (auth.uid() = author_id);
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can delete own posts' AND tablename = 'posts') THEN
    CREATE POLICY "Users can delete own posts"
      ON posts FOR DELETE
      USING (auth.uid() = author_id);
  END IF;

  -- Replies policies
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Replies are viewable by everyone' AND tablename = 'replies') THEN
    CREATE POLICY "Replies are viewable by everyone"
      ON replies FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Authenticated users can create replies' AND tablename = 'replies') THEN
    CREATE POLICY "Authenticated users can create replies"
      ON replies FOR INSERT
      WITH CHECK (auth.uid() = author_id);
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can update own replies' AND tablename = 'replies') THEN
    CREATE POLICY "Users can update own replies"
      ON replies FOR UPDATE
      USING (auth.uid() = author_id);
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can delete own replies' AND tablename = 'replies') THEN
    CREATE POLICY "Users can delete own replies"
      ON replies FOR DELETE
      USING (auth.uid() = author_id);
  END IF;

  -- Likes policies
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Likes are viewable by everyone' AND tablename = 'likes') THEN
    CREATE POLICY "Likes are viewable by everyone"
      ON likes FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Authenticated users can create likes' AND tablename = 'likes') THEN
    CREATE POLICY "Authenticated users can create likes"
      ON likes FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can delete own likes' AND tablename = 'likes') THEN
    CREATE POLICY "Users can delete own likes"
      ON likes FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;