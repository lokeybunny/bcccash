-- Add secret_key column to store encrypted key data for email resending
ALTER TABLE public.wallets 
ADD COLUMN secret_key jsonb;

-- Add comment explaining the column
COMMENT ON COLUMN public.wallets.secret_key IS 'Encrypted secret key data for email resending functionality';