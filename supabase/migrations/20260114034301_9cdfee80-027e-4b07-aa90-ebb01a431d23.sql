-- Remove secret_key column from wallets table for security
-- Private keys should never be stored - only sent once via email
ALTER TABLE public.wallets DROP COLUMN IF EXISTS secret_key;