-- This script fixes the foreign key constraint issue with profiles table

-- First, check the current structure of the profiles table
DO $$
DECLARE
  profile_id_exists BOOLEAN;
  profile_user_id_exists BOOLEAN;
  profile_id_fk_exists BOOLEAN;
BEGIN
  -- Check if id column exists
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'id'
  ) INTO profile_id_exists;
  
  -- Check if user_id column exists
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'user_id'
  ) INTO profile_user_id_exists;
  
  -- Check if foreign key constraint exists
  SELECT EXISTS (
    SELECT FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_id_fkey'
    AND table_schema = 'public'
  ) INTO profile_id_fk_exists;
  
  -- Output diagnostic information
  RAISE NOTICE 'Profile table diagnostics:';
  RAISE NOTICE 'id column exists: %', profile_id_exists;
  RAISE NOTICE 'user_id column exists: %', profile_user_id_exists;
  RAISE NOTICE 'id foreign key exists: %', profile_id_fk_exists;
  
  -- Fix the profiles table structure if needed
  IF profile_id_exists AND profile_user_id_exists THEN
    -- Both columns exist, make sure they're properly set up
    
    -- 1. Update any profiles where user_id is NULL but id matches a user
    EXECUTE 'UPDATE profiles SET user_id = id WHERE user_id IS NULL';
    
    -- 2. Make sure user_id is NOT NULL
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'user_id'
      AND is_nullable = 'NO'
    ) THEN
      EXECUTE 'ALTER TABLE profiles ALTER COLUMN user_id SET NOT NULL';
    END IF;
    
    -- 3. Add index on user_id if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM pg_indexes
      WHERE tablename = 'profiles'
      AND indexname = 'profiles_user_id_idx'
    ) THEN
      EXECUTE 'CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id)';
    END IF;
    
    RAISE NOTICE 'Profiles table structure updated successfully.';
  ELSIF profile_id_exists AND NOT profile_user_id_exists THEN
    -- Only id exists, add user_id column
    EXECUTE 'ALTER TABLE profiles ADD COLUMN user_id UUID REFERENCES auth.users(id)';
    EXECUTE 'UPDATE profiles SET user_id = id';
    EXECUTE 'ALTER TABLE profiles ALTER COLUMN user_id SET NOT NULL';
    EXECUTE 'CREATE INDEX profiles_user_id_idx ON profiles(user_id)';
    
    RAISE NOTICE 'Added user_id column to profiles table.';
  ELSE
    RAISE NOTICE 'Unexpected profiles table structure. Manual intervention required.';
  END IF;
  
  -- Fix RLS policies
  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
  DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
  DROP POLICY IF EXISTS "Admin can update all profiles" ON profiles;
  
  -- Create new policies that use both id and user_id
  CREATE POLICY "Users can view their own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = id OR auth.uid() = user_id);
    
  CREATE POLICY "Users can update their own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id OR auth.uid() = user_id);
    
  CREATE POLICY "Admin can view all profiles" 
    ON profiles FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.user_id = auth.uid()
      )
    );
    
  CREATE POLICY "Admin can update all profiles" 
    ON profiles FOR UPDATE 
    USING (
      EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.user_id = auth.uid()
      )
    );
    
  RAISE NOTICE 'RLS policies updated successfully.';
END $$;

-- Fix investment_options table if it doesn't exist
CREATE TABLE IF NOT EXISTS investment_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  interest_rate NUMERIC(5,2) NOT NULL,
  term_days INTEGER NOT NULL,
  min_amount NUMERIC(10,2) NOT NULL,
  max_amount NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add investment_type column to investments table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'investments' 
    AND column_name = 'investment_type'
  ) THEN
    ALTER TABLE investments ADD COLUMN investment_type TEXT;
  END IF;
END $$;

-- Add interest_rate column to investments table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'investments' 
    AND column_name = 'interest_rate'
  ) THEN
    ALTER TABLE investments ADD COLUMN interest_rate NUMERIC(5,2) DEFAULT 10.0;
  END IF;
END $$;

-- Add investment_option_id column to investments table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'investments' 
    AND column_name = 'investment_option_id'
  ) THEN
    ALTER TABLE investments ADD COLUMN investment_option_id UUID REFERENCES investment_options(id);
  END IF;
END $$;

-- Make sure transactions table exists
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  transaction_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS to transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Admin can view all transactions" ON transactions;

CREATE POLICY "Users can view their own transactions" 
  ON transactions FOR SELECT 
  USING (auth.uid() = user_id);
  
CREATE POLICY "Admin can view all transactions" 
  ON transactions FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid()
    )
  );

-- Insert some sample investment options if none exist
INSERT INTO investment_options (name, type, description, interest_rate, term_days, min_amount, max_amount)
SELECT 'Government Bond', 'Government Bonds', 'Low-risk government bonds with stable returns', 8.5, 365, 1000, 1000000
WHERE NOT EXISTS (SELECT 1 FROM investment_options WHERE type = 'Government Bonds');

INSERT INTO investment_options (name, type, description, interest_rate, term_days, min_amount, max_amount)
SELECT 'Infrastructure Bond', 'Infrastructure', 'Medium-risk infrastructure bonds with good returns', 10.5, 730, 5000, 5000000
WHERE NOT EXISTS (SELECT 1 FROM investment_options WHERE type = 'Infrastructure');

INSERT INTO investment_options (name, type, description, interest_rate, term_days, min_amount, max_amount)
SELECT 'Equity Fund', 'Equities', 'Higher-risk equity investments with potential for high returns', 12.0, 365, 10000, NULL
WHERE NOT EXISTS (SELECT 1 FROM investment_options WHERE type = 'Equities');
