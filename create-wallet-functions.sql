-- Create a function to handle wallet transactions
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

-- Create a function to get wallet balance
CREATE OR REPLACE FUNCTION get_wallet_balance(p_user_id UUID)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance DECIMAL;
BEGIN
  -- Get wallet balance or return 0 if wallet doesn't exist
  SELECT balance INTO v_balance
  FROM wallets
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(v_balance, 0);
END;
$$;
