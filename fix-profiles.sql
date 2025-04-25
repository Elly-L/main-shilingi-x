-- First, let's check if there are any users without profiles
SELECT auth.users.id, auth.users.email, profiles.id as profile_id
FROM auth.users
LEFT JOIN profiles ON auth.users.id = profiles.id
WHERE profiles.id IS NULL;

-- Create profiles for any users that don't have them
INSERT INTO profiles (id, full_name, phone_number, created_at, updated_at)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
    raw_user_meta_data->>'phone_number' as phone_number,
    created_at,
    created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);

-- Create wallets for any users that don't have them
INSERT INTO wallets (user_id, balance, created_at, updated_at)
SELECT 
    id, 
    1000, -- Give them a starting balance of 1000 KES for demo purposes
    now(),
    now()
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM wallets);

-- Update the handle_new_user function to ensure it always creates profiles and wallets
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a profile for the new user
    INSERT INTO public.profiles (id, full_name, phone_number, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'phone_number',
        NEW.created_at,
        NEW.created_at
    );
    
    -- Create a wallet for the new user with a starting balance of 1000 KES for demo purposes
    INSERT INTO public.wallets (user_id, balance, created_at, updated_at)
    VALUES (NEW.id, 1000, NEW.created_at, NEW.created_at);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update the handle_user_update function to ensure it properly updates profiles
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the profile when user metadata is updated
    UPDATE public.profiles
    SET 
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', profiles.full_name),
        phone_number = COALESCE(NEW.raw_user_meta_data->>'phone_number', profiles.phone_number),
        bio = COALESCE(NEW.raw_user_meta_data->>'bio', profiles.bio),
        country = COALESCE(NEW.raw_user_meta_data->>'country', profiles.country),
        updated_at = now()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the update trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
AFTER UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Create a function to simulate bond purchases for demo purposes
CREATE OR REPLACE FUNCTION public.simulate_investment(
    user_id UUID,
    investment_type TEXT,
    investment_name TEXT,
    amount DECIMAL,
    interest_rate DECIMAL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    maturity_date DATE;
BEGIN
    -- Set maturity date based on investment type
    IF investment_type = 'government' THEN
        maturity_date := CURRENT_DATE + INTERVAL '10 years';
    ELSIF investment_type = 'infrastructure' THEN
        maturity_date := CURRENT_DATE + INTERVAL '5 years';
    ELSE
        maturity_date := NULL; -- For equity investments
    END IF;
    
    -- Insert the investment record
    INSERT INTO investments (
        user_id,
        investment_type,
        investment_name,
        amount,
        interest_rate,
        maturity_date,
        status
    ) VALUES (
        user_id,
        investment_type,
        investment_name,
        amount,
        interest_rate,
        maturity_date,
        'active'
    );
    
    -- Record the transaction
    INSERT INTO transactions (
        user_id,
        transaction_type,
        amount,
        source,
        description
    ) VALUES (
        user_id,
        'investment',
        -amount,
        investment_name,
        'Investment in ' || investment_name
    );
    
    -- Update wallet balance
    UPDATE wallets
    SET balance = balance - amount
    WHERE user_id = user_id;
    
    RETURN TRUE;
END;
$$;

-- Create a function to simulate deposits for demo purposes
CREATE OR REPLACE FUNCTION public.simulate_deposit(
    user_id UUID,
    amount DECIMAL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update wallet balance
    UPDATE wallets
    SET balance = balance + amount
    WHERE user_id = user_id;
    
    -- Record the transaction
    INSERT INTO transactions (
        user_id,
        transaction_type,
        amount,
        source,
        description
    ) VALUES (
        user_id,
        'deposit',
        amount,
        'M-Pesa',
        'Deposit via M-Pesa'
    );
    
    RETURN TRUE;
END;
$$;

-- Create a function to simulate withdrawals for demo purposes
CREATE OR REPLACE FUNCTION public.simulate_withdrawal(
    user_id UUID,
    amount DECIMAL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if there's enough balance
    IF (SELECT balance FROM wallets WHERE user_id = user_id) < amount THEN
        RETURN FALSE;
    END IF;
    
    -- Update wallet balance
    UPDATE wallets
    SET balance = balance - amount
    WHERE user_id = user_id;
    
    -- Record the transaction
    INSERT INTO transactions (
        user_id,
        transaction_type,
        amount,
        source,
        description
    ) VALUES (
        user_id,
        'withdrawal',
        -amount,
        'M-Pesa',
        'Withdrawal to M-Pesa'
    );
    
    RETURN TRUE;
END;
$$;
