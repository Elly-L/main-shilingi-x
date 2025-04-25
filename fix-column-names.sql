-- Check if investments table has investment_name column, if not add it
DO $
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investments' AND column_name = 'investment_name') THEN
        ALTER TABLE public.investments ADD COLUMN investment_name TEXT;
    END IF;
END
$;

-- Update investments table to ensure all records have investment_name
UPDATE public.investments i
SET investment_name = COALESCE(
    i.investment_name, 
    (SELECT o.name FROM public.investment_options o WHERE i.investment_option_id = o.id),
    'Unknown Investment'
)
WHERE i.investment_name IS NULL;

-- Make sure the investment_type column exists
DO $
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investments' AND column_name = 'investment_type') THEN
        ALTER TABLE public.investments ADD COLUMN investment_type TEXT;
    END IF;
END
$;

-- Update investment_type if it's NULL
UPDATE public.investments i
SET investment_type = COALESCE(
    i.investment_type, 
    (SELECT o.type FROM public.investment_options o WHERE i.investment_option_id = o.id),
    'other'
)
WHERE i.investment_type IS NULL;

-- Make sure the source column exists in transactions
DO $
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'source') THEN
        ALTER TABLE public.transactions ADD COLUMN source TEXT;
    END IF;
END
$;

-- Update source if it's NULL
UPDATE public.transactions t
SET source = 
    CASE 
        WHEN t.transaction_type = 'deposit' THEN 'M-Pesa'
        WHEN t.transaction_type = 'withdrawal' THEN 'Bank Transfer'
        WHEN t.transaction_type = 'investment' THEN 
            COALESCE(
                (SELECT i.investment_name FROM public.investments i WHERE i.id = t.investment_id),
                'Investment'
            )
        WHEN t.transaction_type = 'sale' THEN 'Investment Sale'
        ELSE 'System'
    END
WHERE t.source IS NULL;
