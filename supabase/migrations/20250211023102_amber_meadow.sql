/*
  # Add Profile Creation Trigger

  1. New Function
    - `handle_new_user`: Creates a profile when a new user signs up

  2. Changes
    - Add trigger on auth.users to automatically create profile
    - Add policy to allow profile creation during signup

  3. Security
    - Function is security definer to allow profile creation
*/

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profile (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add policy to allow profile creation during signup
CREATE POLICY "Profiles can be created during signup"
  ON public.user_profile
  FOR INSERT
  WITH CHECK (auth.uid() = id);