-- Comprehensive Database Setup Script for Shillingi X
-- This script checks for existence before creating and fixes all known issues

-- 1. Fix profiles table structure
DO $$
BEGIN
    -- Check if profiles table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        -- Check if user_id column exists
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'user_id') THEN
            -- Add user_id column
            ALTER TABLE profiles ADD COLUMN user_id UUID REFERENCES auth.users(id);
            
            -- Update existing records to set user_id = id where possible
            UPDATE profiles SET user_id = id WHERE id IS NOT NULL;
        END IF;
        
        -- Fix the id column to be a UUID with default if it's causing issues
        ALTER TABLE profiles ALTER COLUMN id SET DEFAULT uuid_generate_v4();
        
        -- Ensure id is not null and has proper constraints
        ALTER TABLE profiles ALTER COLUMN id SET NOT NULL;
        
        -- Make user_id NOT NULL where possible
        UPDATE profiles SET user_id = id WHERE user_id IS NULL AND id IS NOT NULL;
        
        -- Add unique constraint on user_id if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_key') THEN
            ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
        END IF;
    ELSE
        -- Create profiles table if it doesn't exist
        CREATE TABLE profiles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
            full_name TEXT,
            email TEXT,
            phone_number TEXT,
            bio TEXT,
            avatar_url TEXT,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- 2. Fix wallets table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'wallets') THEN
        CREATE TABLE wallets (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
            balance DECIMAL DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    ELSE
        -- Ensure user_id column exists and is properly constrained
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'wallets' AND column_name = 'user_id') THEN
            ALTER TABLE wallets ADD COLUMN user_id UUID REFERENCES auth.users(id);
            ALTER TABLE wallets ADD CONSTRAINT wallets_user_id_key UNIQUE (user_id);
        END IF;
        
        -- Ensure balance column exists
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'wallets' AND column_name = 'balance') THEN
            ALTER TABLE wallets ADD COLUMN balance DECIMAL DEFAULT 0;
        END IF;
    END IF;
END $$;

-- 3. Fix transactions table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'transactions') THEN
        CREATE TABLE transactions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) NOT NULL,
            amount DECIMAL NOT NULL,
            transaction_type TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'completed',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    ELSE
        -- Ensure user_id column exists and is properly constrained
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'user_id') THEN
            ALTER TABLE transactions ADD COLUMN user_id UUID REFERENCES auth.users(id);
        END IF;
    END IF;
END $$;

-- 4. Fix investment_options table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'investment_options') THEN
        CREATE TABLE investment_options (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            description TEXT,
            type TEXT NOT NULL,
            interest_rate DECIMAL NOT NULL,
            term_days INTEGER NOT NULL,
            min_investment DECIMAL NOT NULL,
            available_amount DECIMAL NOT NULL,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    ELSE
        -- Ensure all required columns exist
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'investment_options' AND column_name = 'interest_rate') THEN
            ALTER TABLE investment_options ADD COLUMN interest_rate DECIMAL DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'investment_options' AND column_name = 'term_days') THEN
            ALTER TABLE investment_options ADD COLUMN term_days INTEGER DEFAULT 365;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'investment_options' AND column_name = 'min_investment') THEN
            ALTER TABLE investment_options ADD COLUMN min_investment DECIMAL DEFAULT 1000;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'investment_options' AND column_name = 'available_amount') THEN
            ALTER TABLE investment_options ADD COLUMN available_amount DECIMAL DEFAULT 1000000;
        END IF;
    END IF;
END $$;

-- 5. Fix investments table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'investments') THEN
        CREATE TABLE investments (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) NOT NULL,
            investment_option_id UUID REFERENCES investment_options(id),
            amount DECIMAL NOT NULL,
            interest_rate DECIMAL NOT NULL,
            term_days INTEGER NOT NULL,
            start_date TIMESTAMPTZ DEFAULT NOW(),
            end_date TIMESTAMPTZ,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    ELSE
        -- Ensure user_id column exists and is properly constrained
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'investments' AND column_name = 'user_id') THEN
            ALTER TABLE investments ADD COLUMN user_id UUID REFERENCES auth.users(id);
        END IF;
        
        -- Ensure investment_option_id column exists
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'investments' AND column_name = 'investment_option_id') THEN
            ALTER TABLE investments ADD COLUMN investment_option_id UUID REFERENCES investment_options(id);
        END IF;
        
        -- Ensure interest_rate column exists
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'investments' AND column_name = 'interest_rate') THEN
            ALTER TABLE investments ADD COLUMN interest_rate DECIMAL DEFAULT 0;
        END IF;
        
        -- Ensure term_days column exists
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'investments' AND column_name = 'term_days') THEN
            ALTER TABLE investments ADD COLUMN term_days INTEGER DEFAULT 365;
        END IF;
    END IF;
END $$;

-- 6. Create admin table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admins') THEN
        CREATE TABLE admins (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
            role TEXT DEFAULT 'admin',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- 7. Create or replace functions for wallet management
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

-- 8. Create or replace function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
  );
END;
$$;

-- 9. Create or replace function to ensure wallet exists
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

-- 10. Create or replace function to ensure profile exists
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

-- 11. Fix RLS policies for all tables
-- First, enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for users based on id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Admin access all profiles" ON profiles;

DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;
DROP POLICY IF EXISTS "Users can update own wallet" ON wallets;
DROP POLICY IF EXISTS "Users can insert own wallet" ON wallets;
DROP POLICY IF EXISTS "Admin can view all wallets" ON wallets;

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Admin can view all transactions" ON transactions;

DROP POLICY IF EXISTS "Users can view own investments" ON investments;
DROP POLICY IF EXISTS "Users can insert own investments" ON investments;
DROP POLICY IF EXISTS "Admin can view all investments" ON investments;

DROP POLICY IF EXISTS "Anyone can view investment options" ON investment_options;
DROP POLICY IF EXISTS "Admin can manage investment options" ON investment_options;

-- Create new policies for profiles
CREATE POLICY "Anyone can read profiles"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Create new policies for wallets
CREATE POLICY "Users can view own wallet"
ON wallets FOR SELECT
USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can update own wallet"
ON wallets FOR UPDATE
USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can insert own wallet"
ON wallets FOR INSERT
WITH CHECK (auth.uid() = user_id OR is_admin());

-- Create new policies for transactions
CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can insert own transactions"
ON transactions FOR INSERT
WITH CHECK (auth.uid() = user_id OR is_admin());

-- Create new policies for investments
CREATE POLICY "Users can view own investments"
ON investments FOR SELECT
USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can insert own investments"
ON investments FOR INSERT
WITH CHECK (auth.uid() = user_id OR is_admin());

-- Create new policies for investment_options
CREATE POLICY "Anyone can view investment options"
ON investment_options FOR SELECT
USING (true);

CREATE POLICY "Admin can manage investment options"
ON investment_options FOR ALL
USING (is_admin());

-- Create new policies for admins
CREATE POLICY "Admin can view admin table"
ON admins FOR SELECT
USING (is_admin());

CREATE POLICY "Admin can manage admin table"
ON admins FOR ALL
USING (is_admin());

-- 12. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

-- 13. Add sample data for testing if tables are empty
DO $$
BEGIN
    -- Add sample investment options if none exist
    IF NOT EXISTS (SELECT 1 FROM investment_options LIMIT 1) THEN
        INSERT INTO investment_options (name, description, type, interest_rate, term_days, min_investment, available_amount, status)
        VALUES 
        ('Treasury Bond 2023', 'Government bond with fixed interest rate', 'government', 10.5, 365, 5000, 10000000, 'active'),
        ('Corporate Bond XYZ', 'Corporate bond with high yield', 'corporate', 12.0, 180, 10000, 5000000, 'active'),
        ('Infrastructure Project A', 'Investment in national infrastructure', 'infrastructure', 9.5, 730, 1000, 20000000, 'active'),
        ('Green Energy Bond', 'Investment in renewable energy projects', 'green', 8.5, 365, 2000, 15000000, 'active');
    END IF;
END $$;
