/*
  # Add Post Replies Support

  1. New Tables
    - `post_replies`
      - `id` (uuid, primary key)
      - `content` (text)
      - `post_id` (uuid, references community_posts)
      - `author_id` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `reply_likes`
      - `id` (uuid, primary key)
      - `reply_id` (uuid, references post_replies)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create post_replies table
CREATE TABLE post_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reply_likes table
CREATE TABLE reply_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reply_id uuid REFERENCES post_replies(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(reply_id, user_id)
);

-- Enable RLS
ALTER TABLE post_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reply_likes ENABLE ROW LEVEL SECURITY;

-- Policies for post_replies
CREATE POLICY "Replies are viewable by everyone"
  ON post_replies FOR SELECT
  USING (true);

CREATE POLICY "Users can create replies"
  ON post_replies FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own replies"
  ON post_replies FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own replies"
  ON post_replies FOR DELETE
  USING (auth.uid() = author_id);

-- Policies for reply_likes
CREATE POLICY "Reply likes are viewable by everyone"
  ON reply_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like replies"
  ON reply_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike replies"
  ON reply_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger for post_replies
CREATE OR REPLACE FUNCTION update_post_replies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_replies_updated_at
  BEFORE UPDATE ON post_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_post_replies_updated_at();