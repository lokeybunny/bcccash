-- Add source column to wallets table to track where the email was publicly sourced from
ALTER TABLE public.wallets 
ADD COLUMN source TEXT;