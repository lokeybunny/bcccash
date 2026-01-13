-- Create table for email verification codes
CREATE TABLE public.email_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_email_verifications_email ON public.email_verifications(email);
CREATE INDEX idx_email_verifications_expires_at ON public.email_verifications(expires_at);

-- Enable RLS
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- No direct public access - all operations go through edge functions
CREATE POLICY "No direct public access"
  ON public.email_verifications
  FOR ALL
  USING (false);

-- Clean up expired codes automatically (runs on each query - lightweight cleanup)
CREATE OR REPLACE FUNCTION public.cleanup_expired_verifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.email_verifications 
  WHERE expires_at < now() - interval '1 hour';
  RETURN NEW;
END;
$$;

CREATE TRIGGER cleanup_expired_verifications_trigger
  AFTER INSERT ON public.email_verifications
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.cleanup_expired_verifications();