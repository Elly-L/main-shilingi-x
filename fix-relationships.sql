-- Fix the relationship between transactions and profiles
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id);

-- Update existing transactions to link to profiles
UPDATE public.transactions 
SET profile_id = profiles.id
FROM public.profiles
WHERE transactions.user_id = profiles.user_id AND transactions.profile_id IS NULL;

-- Create a view to join transactions with profiles for easier querying
CREATE OR REPLACE VIEW public.transactions_with_profiles AS
SELECT 
    t.*,
    p.full_name,
    p.email,
    p.avatar_url
FROM 
    public.transactions t
LEFT JOIN 
    public.profiles p ON t.user_id = p.user_id;

-- Grant access to the view
GRANT SELECT ON public.transactions_with_profiles TO authenticated;

-- Fix the investment_options table if it has issues
ALTER TABLE public.investment_options 
ADD COLUMN IF NOT EXISTS term_days INTEGER,
ADD COLUMN IF NOT EXISTS available_amount DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Update any NULL values
UPDATE public.investment_options
SET 
    term_days = COALESCE(term_days, duration_days),
    available_amount = COALESCE(available_amount, 1000000),
    status = COALESCE(status, 'active');

-- Ensure wallet table exists and has proper structure
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for wallets
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wallet" ON public.wallets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wallets" ON public.wallets
    FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can update their own wallet" ON public.wallets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any wallet" ON public.wallets
    FOR UPDATE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Create a function to record transactions and update wallet balance
CREATE OR REPLACE FUNCTION public.record_transaction(
    p_user_id UUID,
    p_amount DECIMAL,
    p_type TEXT,
    p_description TEXT DEFAULT NULL,
    p_status TEXT DEFAULT 'completed'
) RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_wallet_exists BOOLEAN;
BEGIN
    -- Check if wallet exists
    SELECT EXISTS(SELECT 1 FROM public.wallets WHERE user_id = p_user_id) INTO v_wallet_exists;
    
    -- Create wallet if it doesn't exist
    IF NOT v_wallet_exists THEN
        INSERT INTO public.wallets (user_id, balance) VALUES (p_user_id, 0);
    END IF;
    
    -- Update wallet balance
    UPDATE public.wallets 
    SET 
        balance = balance + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Record transaction
    INSERT INTO public.transactions (
        user_id, 
        type, 
        amount, 
        description, 
        status,
        profile_id
    ) VALUES (
        p_user_id, 
        p_type, 
        p_amount, 
        p_description, 
        p_status,
        (SELECT id FROM public.profiles WHERE user_id = p_user_id)
    ) RETURNING id INTO v_transaction_id;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.record_transaction TO authenticated;
