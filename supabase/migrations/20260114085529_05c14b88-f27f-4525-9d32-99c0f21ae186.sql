-- Fix email_verifications table RLS
-- Drop existing restrictive policy
DROP POLICY IF EXISTS "No direct public access" ON public.email_verifications;

-- Create permissive policy that denies all public access (returns false for everyone)
-- Edge functions use SERVICE_ROLE_KEY which bypasses RLS entirely
CREATE POLICY "Deny all public access"
ON public.email_verifications
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- Fix wallets table RLS
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "No direct public delete access" ON public.wallets;
DROP POLICY IF EXISTS "No direct public insert access" ON public.wallets;
DROP POLICY IF EXISTS "No direct public read access" ON public.wallets;
DROP POLICY IF EXISTS "No direct public update access" ON public.wallets;

-- Create single permissive policy that denies all public access
-- Edge functions use SERVICE_ROLE_KEY which bypasses RLS entirely
CREATE POLICY "Deny all public access"
ON public.wallets
FOR ALL
TO public
USING (false)
WITH CHECK (false);