-- Drop existing policies to start fresh
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

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Create a function to check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$;

-- Profiles table policies
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin access all profiles"
ON profiles FOR ALL
USING (
  auth.uid() = id OR 
  is_admin()
);

-- Wallets table policies
CREATE POLICY "Users can view own wallet"
ON wallets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet"
ON wallets FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin access all wallets"
ON wallets FOR SELECT
USING (is_admin());

-- Transactions table policies
CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
ON transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin access all transactions"
ON transactions FOR ALL
USING (is_admin());

-- Investments table policies
CREATE POLICY "Users can view own investments"
ON investments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investments"
ON investments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin access all investments"
ON investments FOR ALL
USING (is_admin());

-- Update the handle_new_user function to not create wallets for admins
-- and to only use id and role in the profiles table
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $
DECLARE
  new_role VARCHAR;
BEGIN
  -- Check if the user has a role in metadata
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    new_role := NEW.raw_user_meta_data->>'role';
  ELSE
    new_role := 'user';
  END IF;

  -- Create a profile for the new user with the appropriate role
  -- Only using id and role as per the updated schema
  INSERT INTO public.profiles (id, role)
  VALUES (
    NEW.id,
    new_role
  );
  
  -- Only create a wallet for regular users, not for admins
  IF new_role = 'user' THEN
    INSERT INTO public.wallets (user_id, balance, created_at, updated_at)
    VALUES (
      NEW.id, 
      1000,
      NEW.created_at, 
      NEW.created_at
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update the handle_user_update function to only update the role
CREATE OR REPLACE FUNCTION handle_user_update()
RETURNS TRIGGER AS $
BEGIN
  -- Update the profile when user metadata is updated
  -- Only updating the role field as per the updated schema
  UPDATE public.profiles
  SET 
    role = COALESCE(NEW.raw_user_meta_data->>'role', profiles.role)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the update trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
AFTER UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_user_update();
