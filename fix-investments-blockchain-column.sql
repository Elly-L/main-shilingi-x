-- Add blockchain_tx_hash column to investments table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'investments' 
        AND column_name = 'blockchain_tx_hash'
    ) THEN
        ALTER TABLE investments ADD COLUMN blockchain_tx_hash TEXT;
    END IF;
END
$$;

-- Add blockchain_tx_hash column to transactions table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'blockchain_tx_hash'
    ) THEN
        ALTER TABLE transactions ADD COLUMN blockchain_tx_hash TEXT;
    END IF;
END
$$;

-- Create index on blockchain_tx_hash for better performance
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'investments'
        AND indexname = 'investments_blockchain_tx_hash_idx'
    ) THEN
        CREATE INDEX investments_blockchain_tx_hash_idx ON investments(blockchain_tx_hash);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'transactions'
        AND indexname = 'transactions_blockchain_tx_hash_idx'
    ) THEN
        CREATE INDEX transactions_blockchain_tx_hash_idx ON transactions(blockchain_tx_hash);
    END IF;
END
$$;
