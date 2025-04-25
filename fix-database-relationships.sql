-- Fix the missing relationships between tables

-- First, check if the foreign key already exists on transactions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'transactions_user_id_fkey' 
    AND table_name = 'transactions'
  ) THEN
    -- Add foreign key to transactions table
    ALTER TABLE transactions 
    ADD CONSTRAINT transactions_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Fix investments table relationship if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'investments_user_id_fkey' 
    AND table_name = 'investments'
  ) THEN
    -- Add foreign key to investments table
    ALTER TABLE investments 
    ADD CONSTRAINT investments_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Fix wallets table relationship if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'wallets_user_id_fkey' 
    AND table_name = 'wallets'
  ) THEN
    -- Add foreign key to wallets table
    ALTER TABLE wallets 
    ADD CONSTRAINT wallets_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create a view to join transactions with user data
CREATE OR REPLACE VIEW transaction_details AS
SELECT 
  t.*,
  u.email,
  p.role
FROM 
  transactions t
LEFT JOIN 
  auth.users u ON t.user_id = u.id
LEFT JOIN 
  profiles p ON t.user_id = p.id;

-- Create a view to join investments with user data
CREATE OR REPLACE VIEW investment_details AS
SELECT 
  i.*,
  u.email,
  p.role
FROM 
  investments i
LEFT JOIN 
  auth.users u ON i.user_id = u.id
LEFT JOIN 
  profiles p ON i.user_id = p.id;

-- Update RLS policies to allow admin to view these views
DROP POLICY IF EXISTS "Admin access transaction_details" ON transaction_details;
DROP POLICY IF EXISTS "Admin access investment_details" ON investment_details;

ALTER TABLE transaction_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access transaction_details"
ON transaction_details FOR SELECT
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin access investment_details"
ON investment_details FOR SELECT
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
