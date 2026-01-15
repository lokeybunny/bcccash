-- Create bcc_accounts table for storing @bcc.cash email accounts
CREATE TABLE public.bcc_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  bcc_username TEXT NOT NULL UNIQUE, -- username part of username@bcc.cash
  forward_to_email TEXT NOT NULL, -- original email to forward messages to
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT bcc_username_format CHECK (bcc_username ~ '^[a-z0-9]{8}$')
);

-- Create bcc_emails table for storing received emails
CREATE TABLE public.bcc_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bcc_account_id UUID NOT NULL REFERENCES public.bcc_accounts(id) ON DELETE CASCADE,
  from_email TEXT NOT NULL,
  from_name TEXT,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_forwarded BOOLEAN NOT NULL DEFAULT false,
  forwarded_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on both tables
ALTER TABLE public.bcc_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bcc_emails ENABLE ROW LEVEL SECURITY;

-- RLS policies for bcc_accounts - deny public access (only edge functions can access)
CREATE POLICY "Deny all public access to bcc_accounts" 
ON public.bcc_accounts 
FOR ALL 
USING (false)
WITH CHECK (false);

-- RLS policies for bcc_emails - deny public access (only edge functions can access)
CREATE POLICY "Deny all public access to bcc_emails" 
ON public.bcc_emails 
FOR ALL 
USING (false)
WITH CHECK (false);

-- Create indexes for better query performance
CREATE INDEX idx_bcc_accounts_wallet_id ON public.bcc_accounts(wallet_id);
CREATE INDEX idx_bcc_accounts_username ON public.bcc_accounts(bcc_username);
CREATE INDEX idx_bcc_emails_account_id ON public.bcc_emails(bcc_account_id);
CREATE INDEX idx_bcc_emails_received_at ON public.bcc_emails(received_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_bcc_accounts_updated_at
BEFORE UPDATE ON public.bcc_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();