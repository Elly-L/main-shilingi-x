-- First, let's drop the problematic policies
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- Now let's create proper policies that allow users to insert their own profile
-- This is critical for the admin registration process

-- Allow users to insert their own profile
CREATE POLICY "Enable insert for users based on id" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to read all profiles (needed for user listings)
CREATE POLICY "Enable read access for all users" ON profiles
  FOR SELECT USING (true);

-- Allow users to update their own profile
CREATE POLICY "Enable update for users based on id" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Make sure RLS is enabled on the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
