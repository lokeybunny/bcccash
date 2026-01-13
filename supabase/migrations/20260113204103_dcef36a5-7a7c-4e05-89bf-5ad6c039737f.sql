-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can create wallets" ON public.wallets;
DROP POLICY IF EXISTS "Anyone can update wallet confirmation" ON public.wallets;
DROP POLICY IF EXISTS "Anyone can view wallets for verification" ON public.wallets;

-- Create restrictive policies - all operations go through edge functions with service role
-- Public users cannot directly access the wallets table

-- No public SELECT access - verification goes through edge function
CREATE POLICY "No direct public read access"
ON public.wallets
FOR SELECT
TO anon, authenticated
USING (false);

-- No public INSERT access - wallet creation goes through edge function  
CREATE POLICY "No direct public insert access"
ON public.wallets
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

-- No public UPDATE access - updates go through edge function
CREATE POLICY "No direct public update access"
ON public.wallets
FOR UPDATE
TO anon, authenticated
USING (false);

-- No public DELETE access
CREATE POLICY "No direct public delete access"
ON public.wallets
FOR DELETE
TO anon, authenticated
USING (false);