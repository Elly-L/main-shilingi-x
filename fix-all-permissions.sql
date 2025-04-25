-- Reset all RLS policies to ensure data can be accessed properly
-- This is a comprehensive fix for all tables

-- 1. Fix profiles table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Admin access all profiles" ON profiles;

-- Create simpler, more permissive policies for profiles
CREATE POLICY "Users can read any profile"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);

-- 2. Fix wallets table policies
DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;
DROP POLICY IF EXISTS "Users can update own wallet" ON wallets;
DROP POLICY IF EXISTS "Admin can view all wallets" ON wallets;

CREATE POLICY "Users can view own wallet"
ON wallets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet"
ON wallets FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet"
ON wallets FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Fix transactions table policies
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Admin can view all transactions" ON transactions;

CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
ON transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. Fix investments table policies
DROP POLICY IF EXISTS "Users can view own investments" ON investments;
DROP POLICY IF EXISTS "Users can insert own investments" ON investments;
DROP POLICY IF EXISTS "Admin can view all investments" ON investments;

CREATE POLICY "Users can view own investments"
ON investments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investments"
ON investments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. Fix investment_options table policies
DROP POLICY IF EXISTS "Anyone can view investment options" ON investment_options;
DROP POLICY IF EXISTS "Admin can manage investment options" ON investment_options;

CREATE POLICY "Anyone can view investment options"
ON investment_options FOR SELECT
USING (true);

-- 6. Create admin role function that doesn't cause recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'is_admin' = 'true'
  );
END;
$$;

-- 7. Create or replace the function to ensure wallet exists
CREATE OR REPLACE FUNCTION ensure_wallet_exists()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO wallets (user_id, balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger to ensure wallet exists when user is created
DROP TRIGGER IF EXISTS ensure_wallet_exists_trigger ON auth.users;
CREATE TRIGGER ensure_wallet_exists_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION ensure_wallet_exists();

-- 8. Create or replace function to ensure profile exists
CREATE OR REPLACE FUNCTION ensure_profile_exists()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, email, phone_number)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone_number', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger to ensure profile exists when user is created
DROP TRIGGER IF EXISTS ensure_profile_exists_trigger ON auth.users;
CREATE TRIGGER ensure_profile_exists_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION ensure_profile_exists();

-- 9. Create a function to handle wallet transactions safely
CREATE OR REPLACE FUNCTION handle_wallet_transaction(
  p_user_id UUID,
  p_amount DECIMAL,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'completed'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id UUID;
  v_current_balance DECIMAL;
  v_new_balance DECIMAL;
  v_transaction_id UUID;
  v_result JSONB;
BEGIN
  -- Get wallet or create if it doesn't exist
  SELECT id, balance INTO v_wallet_id, v_current_balance
  FROM wallets
  WHERE user_id = p_user_id;
  
  IF v_wallet_id IS NULL THEN
    INSERT INTO wallets (user_id, balance)
    VALUES (p_user_id, 0)
    RETURNING id, balance INTO v_wallet_id, v_current_balance;
  END IF;
  
  -- Calculate new balance
  v_new_balance := v_current_balance + p_amount;
  
  -- Check if withdrawal would result in negative balance
  IF v_new_balance < 0 AND p_amount < 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Insufficient funds',
      'current_balance', v_current_balance
    );
  END IF;
  
  -- Update wallet balance
  UPDATE wallets
  SET balance = v_new_balance
  WHERE id = v_wallet_id;
  
  -- Create transaction record
  INSERT INTO transactions (
    user_id,
    amount,
    transaction_type,
    description,
    status
  )
  VALUES (
    p_user_id,
    p_amount,
    p_transaction_type,
    COALESCE(p_description, p_transaction_type),
    p_status
  )
  RETURNING id INTO v_transaction_id;
  
  -- Return success result
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'previous_balance', v_current_balance,
    'new_balance', v_new_balance,
    'amount', p_amount
  );
END;
$$;
