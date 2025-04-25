-- Drop existing policies on profiles table to avoid conflicts
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin access all profiles" ON profiles;

-- Create new policies without circular references
CREATE POLICY "Enable read access for all users"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Create a separate admin table to avoid circular references
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS to admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow admins to read the admin_users table
CREATE POLICY "Allow admins to read admin_users"
ON admin_users FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Allow admins to insert into admin_users table
CREATE POLICY "Allow admins to insert into admin_users"
ON admin_users FOR INSERT
WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users) OR 
           (SELECT COUNT(*) FROM admin_users) = 0);

-- Allow admins to update admin_users table
CREATE POLICY "Allow admins to update admin_users"
ON admin_users FOR UPDATE
USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Allow admins to delete from admin_users table
CREATE POLICY "Allow admins to delete from admin_users"
ON admin_users FOR DELETE
USING (auth.uid() IN (SELECT user_id FROM admin_users));
