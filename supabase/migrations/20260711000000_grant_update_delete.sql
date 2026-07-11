-- Add missing UPDATE and DELETE privileges for authenticated users (required for admin soft-deletes)
GRANT UPDATE, DELETE ON public.registrations TO authenticated;
