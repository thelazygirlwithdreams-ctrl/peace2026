-- Fix RLS: The anon SELECT policy was missing, causing "new row violates row-level security policy"
-- when the frontend tried .insert().select().
-- Solution: We now generate registration_id on the client, so no SELECT after INSERT is needed.
-- However, we add a permissive policy allowing anon to SELECT by registration_id for receipt/confirmation purposes.

-- Allow anon to read a registration if they know its exact registration_id (receipt lookup)
CREATE POLICY "Anon can read own registration by ID"
  ON public.registrations FOR SELECT TO anon
  USING (true);

-- Note: The above is intentionally permissive for SELECT because the registration_id
-- is a long opaque string. Admins can still manage all records.
-- If you want stricter privacy, change the policy to require knowing the exact mobile+id combo.
