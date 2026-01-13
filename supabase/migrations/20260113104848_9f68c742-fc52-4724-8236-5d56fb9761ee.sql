-- Create table to store generated wallets
CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  public_key TEXT NOT NULL,
  confirmed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on email to prevent duplicates
CREATE UNIQUE INDEX idx_wallets_email ON public.wallets(email);

-- Create index on public_key for lookups
CREATE INDEX idx_wallets_public_key ON public.wallets(public_key);

-- Enable Row Level Security
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read wallets (for verification purposes)
CREATE POLICY "Anyone can view wallets for verification" 
ON public.wallets 
FOR SELECT 
USING (true);

-- Allow anyone to insert wallets (no auth required for this use case)
CREATE POLICY "Anyone can create wallets" 
ON public.wallets 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to update wallet confirmation status
CREATE POLICY "Anyone can update wallet confirmation" 
ON public.wallets 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_wallets_updated_at
BEFORE UPDATE ON public.wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();