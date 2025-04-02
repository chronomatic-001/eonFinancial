/*
  # Clear All Data

  1. Changes
    - Delete all data from likes table
    - Delete all data from replies table
    - Delete all data from posts table
    - Delete all data from profiles table
    - Preserve table structures and relationships

  Note: Order of deletion is important due to foreign key constraints
*/

-- Delete data in order of dependencies
DELETE FROM likes;
DELETE FROM replies;
DELETE FROM posts;
DELETE FROM profiles;