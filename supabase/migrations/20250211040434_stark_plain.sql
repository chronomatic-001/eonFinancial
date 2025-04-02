/*
  # Database Schema Update
  
  This migration safely handles table creation and updates by:
  1. Checking for existing tables
  2. Using IF NOT EXISTS clauses
  3. Safely dropping and recreating policies
*/

-- Safely create or update tables
DO $$ 
BEGIN
  -- Create tables if they don't exist
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
    CREATE TABLE profiles (
      id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
      nickname text NOT NULL,
      email text NOT NULL,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  END IF;

  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'posts') THEN
    CREATE TABLE posts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      content text NOT NULL,
      author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
  END IF;

  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'replies') THEN
    CREATE TABLE replies (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      content text NOT NULL,
      post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
  END IF;

  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'likes') THEN
    CREATE TABLE likes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
      reply_id uuid REFERENCES replies(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      CONSTRAINT like_target_check CHECK (
        (post_id IS NOT NULL AND reply_id IS NULL) OR
        (post_id IS NULL AND reply_id IS NOT NULL)
      ),
      CONSTRAINT unique_post_like UNIQUE (user_id, post_id),
      CONSTRAINT unique_reply_like UNIQUE (user_id, reply_id)
    );

    ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Safely create or replace the user signup handler
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safely create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Safely recreate all policies
DO $$ 
BEGIN
  -- Profiles policies
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Profiles can be created during signup" ON profiles;

  CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

  CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

  CREATE POLICY "Profiles can be created during signup"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

  -- Posts policies
  DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
  DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
  DROP POLICY IF EXISTS "Users can update own posts" ON posts;
  DROP POLICY IF EXISTS "Users can delete own posts" ON posts;

  CREATE POLICY "Posts are viewable by everyone"
    ON posts FOR SELECT
    USING (true);

  CREATE POLICY "Authenticated users can create posts"
    ON posts FOR INSERT
    WITH CHECK (auth.uid() = author_id);

  CREATE POLICY "Users can update own posts"
    ON posts FOR UPDATE
    USING (auth.uid() = author_id);

  CREATE POLICY "Users can delete own posts"
    ON posts FOR DELETE
    USING (auth.uid() = author_id);

  -- Replies policies
  DROP POLICY IF EXISTS "Replies are viewable by everyone" ON replies;
  DROP POLICY IF EXISTS "Authenticated users can create replies" ON replies;
  DROP POLICY IF EXISTS "Users can update own replies" ON replies;
  DROP POLICY IF EXISTS "Users can delete own replies" ON replies;

  CREATE POLICY "Replies are viewable by everyone"
    ON replies FOR SELECT
    USING (true);

  CREATE POLICY "Authenticated users can create replies"
    ON replies FOR INSERT
    WITH CHECK (auth.uid() = author_id);

  CREATE POLICY "Users can update own replies"
    ON replies FOR UPDATE
    USING (auth.uid() = author_id);

  CREATE POLICY "Users can delete own replies"
    ON replies FOR DELETE
    USING (auth.uid() = author_id);

  -- Likes policies
  DROP POLICY IF EXISTS "Likes are viewable by everyone" ON likes;
  DROP POLICY IF EXISTS "Authenticated users can create likes" ON likes;
  DROP POLICY IF EXISTS "Users can delete own likes" ON likes;

  CREATE POLICY "Likes are viewable by everyone"
    ON likes FOR SELECT
    USING (true);

  CREATE POLICY "Authenticated users can create likes"
    ON likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can delete own likes"
    ON likes FOR DELETE
    USING (auth.uid() = user_id);
END $$;

-- Create indexes if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_author') THEN
    CREATE INDEX idx_posts_author ON posts(author_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_replies_author') THEN
    CREATE INDEX idx_replies_author ON replies(author_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_likes_user') THEN
    CREATE INDEX idx_likes_user ON likes(user_id);
  END IF;
END $$;