-- Add column to track when the last email was sent for rate limiting
ALTER TABLE public.wallets 
ADD COLUMN last_email_sent_at timestamp with time zone;

COMMENT ON COLUMN public.wallets.last_email_sent_at IS 'Timestamp of last email sent for rate limiting';