-- Drop all the complex triggers and functions we created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS handle_user_update();
DROP FUNCTION IF EXISTS is_admin();

-- Make sure the profiles table has the role column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Reset RLS policies to something simpler
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin access all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;
DROP POLICY IF EXISTS "Users can update own wallet" ON wallets;
DROP POLICY IF EXISTS "Admin access all wallets" ON wallets;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Admin access all transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own investments" ON investments;
DROP POLICY IF EXISTS "Admin access all investments" ON investments;

-- Create simple policies
-- Profiles table
CREATE POLICY "Enable read access for all users" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Enable update for users based on id" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Wallets table
CREATE POLICY "Enable read for users based on user_id" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON wallets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for users based on user_id" ON wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions table
CREATE POLICY "Enable read for users based on user_id" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for users based on user_id" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Investments table
CREATE POLICY "Enable read for users based on user_id" ON investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for users based on user_id" ON investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
