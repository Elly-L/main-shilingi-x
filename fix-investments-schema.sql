-- Check if investment_name column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'investments' 
        AND column_name = 'investment_name'
    ) THEN
        ALTER TABLE investments ADD COLUMN investment_name TEXT;
        
        -- Update existing records with a default name based on investment_type
        UPDATE investments 
        SET investment_name = CASE 
            WHEN investment_type = 'government' THEN 'Government Bond'
            WHEN investment_type = 'corporate' THEN 'Corporate Bond'
            WHEN investment_type = 'infrastructure' THEN 'Infrastructure Bond'
            WHEN investment_type = 'equity' THEN 'Equity Investment'
            ELSE 'Investment'
        END || ' #' || id::text;
    END IF;
END
$$;

-- Check if name column exists in investment_options, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'investment_options' 
        AND column_name = 'name'
    ) THEN
        ALTER TABLE investment_options ADD COLUMN name TEXT;
        
        -- Update existing records with a default name based on type
        UPDATE investment_options 
        SET name = CASE 
            WHEN type = 'government' THEN 'Government Bond'
            WHEN type = 'corporate' THEN 'Corporate Bond'
            WHEN type = 'infrastructure' THEN 'Infrastructure Bond'
            WHEN type = 'equity' THEN 'Equity Investment'
            ELSE 'Investment Option'
        END || ' #' || id::text;
    END IF;
END
$$;

-- Ensure the status column exists in transactions table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE transactions ADD COLUMN status TEXT DEFAULT 'completed';
    END IF;
END
$$;

-- Ensure the description column exists in transactions table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE transactions ADD COLUMN description TEXT;
    END IF;
END
$$;

-- Add corporate type to investment_options if it doesn't exist
INSERT INTO investment_options (type, name, description, interest_rate, term_days, min_investment, available_amount, status)
SELECT 'corporate', 'Safaricom Corporate Bond', '5-year corporate bond issued by Safaricom PLC with fixed interest rate.', 13.5, 1825, 100, 500000, 'active'
WHERE NOT EXISTS (
    SELECT 1 FROM investment_options WHERE type = 'corporate'
);

-- Add more corporate bonds if none exist
INSERT INTO investment_options (type, name, description, interest_rate, term_days, min_investment, available_amount, status)
SELECT 'corporate', 'KCB Group Bond', '3-year corporate bond issued by KCB Group with fixed interest rate.', 12.8, 1095, 100, 750000, 'active'
WHERE (SELECT COUNT(*) FROM investment_options WHERE type = 'corporate') < 2;

INSERT INTO investment_options (type, name, description, interest_rate, term_days, min_investment, available_amount, status)
SELECT 'corporate', 'Equity Bank Bond', '7-year corporate bond issued by Equity Bank with fixed interest rate.', 14.2, 2555, 100, 600000, 'active'
WHERE (SELECT COUNT(*) FROM investment_options WHERE type = 'corporate') < 3;
