-- Check if profiles table has user_id column, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE profiles ADD COLUMN user_id UUID REFERENCES auth.users(id);
        
        -- Update existing records to set user_id = id
        UPDATE profiles SET user_id = id;
        
        -- Make user_id NOT NULL
        ALTER TABLE profiles ALTER COLUMN user_id SET NOT NULL;
        
        -- Add unique constraint
        ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
    END IF;
END
$$;

-- Ensure foreign key relationships are properly set up
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_user_id_fkey,
ADD CONSTRAINT transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE investments 
DROP CONSTRAINT IF EXISTS investments_user_id_fkey,
ADD CONSTRAINT investments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE wallets 
DROP CONSTRAINT IF EXISTS wallets_user_id_fkey,
ADD CONSTRAINT wallets_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
