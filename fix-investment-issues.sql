-- Check if investment_options table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'investment_options') THEN
        CREATE TABLE public.investment_options (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            description TEXT,
            type TEXT NOT NULL,
            interest_rate NUMERIC NOT NULL DEFAULT 0,
            term_days INTEGER,
            min_investment NUMERIC NOT NULL DEFAULT 0,
            available_amount NUMERIC NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        -- Add RLS policies
        ALTER TABLE public.investment_options ENABLE ROW LEVEL SECURITY;
        
        -- Allow anyone to read investment options
        CREATE POLICY "Anyone can read investment options" 
        ON public.investment_options FOR SELECT USING (true);
        
        -- Only admins can insert/update/delete
        CREATE POLICY "Admins can insert investment options" 
        ON public.investment_options FOR INSERT 
        WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));
        
        CREATE POLICY "Admins can update investment options" 
        ON public.investment_options FOR UPDATE 
        USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));
        
        CREATE POLICY "Admins can delete investment options" 
        ON public.investment_options FOR DELETE 
        USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

        -- Add sample investment options
        INSERT INTO public.investment_options (name, description, type, interest_rate, term_days, min_investment, available_amount, status)
        VALUES
            ('Treasury Bond - 10 Year', '10-year government bond with fixed interest rate', 'government', 12.5, 3650, 50, 1000000, 'active'),
            ('Treasury Bill - 91 Day', 'Short-term government security with 91-day maturity', 'government', 9.8, 91, 50, 1000000, 'active'),
            ('Infrastructure Bond - Energy', 'Bond for financing renewable energy projects', 'infrastructure', 14.2, 1825, 100, 1000000, 'active'),
            ('Infrastructure Bond - Transport', 'Bond for financing transport infrastructure', 'infrastructure', 13.5, 2555, 100, 1000000, 'active'),
            ('Safaricom Shares', 'Fractional shares in East Africa''s leading telecom', 'equity', 8.7, NULL, 50, 1000000, 'active'),
            ('KCB Group Shares', 'Fractional shares in Kenya''s largest bank', 'equity', 7.9, NULL, 50, 1000000, 'active');
    END IF;
END
$$;

-- Check if investments table has all required columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investments' AND column_name = 'investment_name') THEN
        ALTER TABLE public.investments ADD COLUMN investment_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investments' AND column_name = 'investment_type') THEN
        ALTER TABLE public.investments ADD COLUMN investment_type TEXT;
    END IF;
END
$$;

-- Update investments table to ensure all records have investment_name and investment_type
UPDATE public.investments i
SET 
    investment_name = COALESCE(i.investment_name, o.name),
    investment_type = COALESCE(i.investment_type, o.type)
FROM public.investment_options o
WHERE i.investment_option_id = o.id AND (i.investment_name IS NULL OR i.investment_type IS NULL);

-- Check if transactions table has source column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'source') THEN
        ALTER TABLE public.transactions ADD COLUMN source TEXT;
    END IF;
END
$$;

-- Fix any transactions that don't have a source
UPDATE public.transactions t
SET source = 
    CASE 
        WHEN t.transaction_type = 'deposit' THEN 'M-Pesa'
        WHEN t.transaction_type = 'withdrawal' THEN 'Bank Transfer'
        WHEN t.transaction_type = 'investment' THEN 
            (SELECT i.investment_name FROM public.investments i WHERE i.user_id = t.user_id ORDER BY i.created_at DESC LIMIT 1)
        WHEN t.transaction_type = 'sale' THEN 'Investment Sale'
        ELSE 'System'
    END
WHERE t.source IS NULL;

-- Fix any transactions that don't have a description
UPDATE public.transactions t
SET description = 
    CASE 
        WHEN t.transaction_type = 'deposit' THEN 'Deposit via M-Pesa'
        WHEN t.transaction_type = 'withdrawal' THEN 'Withdrawal to Bank Account'
        WHEN t.transaction_type = 'investment' THEN 'Investment Purchase'
        WHEN t.transaction_type = 'sale' THEN 'Investment Sale'
        ELSE 'Transaction'
    END
WHERE t.description IS NULL;

-- Ensure all RLS policies are properly set
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own investments" ON public.investments;
    DROP POLICY IF EXISTS "Users can insert their own investments" ON public.investments;
    DROP POLICY IF EXISTS "Users can update their own investments" ON public.investments;
    DROP POLICY IF EXISTS "Admins can view all investments" ON public.investments;
    
    -- Create proper policies
    CREATE POLICY "Users can view their own investments" 
    ON public.investments FOR SELECT 
    USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert their own investments" 
    ON public.investments FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own investments" 
    ON public.investments FOR UPDATE 
    USING (auth.uid() = user_id);
    
    CREATE POLICY "Admins can view all investments" 
    ON public.investments FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));
END
$$;

-- Ensure wallets table has proper RLS policies
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own wallet" ON public.wallets;
    DROP POLICY IF EXISTS "Users can insert their own wallet" ON public.wallets;
    DROP POLICY IF EXISTS "Users can update their own wallet" ON public.wallets;
    DROP POLICY IF EXISTS "Admins can view all wallets" ON public.wallets;
    
    -- Create proper policies
    CREATE POLICY "Users can view their own wallet" 
    ON public.wallets FOR SELECT 
    USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert their own wallet" 
    ON public.wallets FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own wallet" 
    ON public.wallets FOR UPDATE 
    USING (auth.uid() = user_id);
    
    CREATE POLICY "Admins can view all wallets" 
    ON public.wallets FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));
END
$$;

-- Ensure transactions table has proper RLS policies
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
    DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
    DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
    
    -- Create proper policies
    CREATE POLICY "Users can view their own transactions" 
    ON public.transactions FOR SELECT 
    USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert their own transactions" 
    ON public.transactions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Admins can view all transactions" 
    ON public.transactions FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));
END
$$;
