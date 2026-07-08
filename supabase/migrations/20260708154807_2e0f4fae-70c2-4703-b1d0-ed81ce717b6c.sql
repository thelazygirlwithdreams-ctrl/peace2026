
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- App settings (registration open/closed)
CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can update settings" ON public.app_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.app_settings(key, value) VALUES ('registration_open', 'true'::jsonb);

-- Registration sequence
CREATE SEQUENCE public.registration_seq START 1;

-- Registrations
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id TEXT UNIQUE NOT NULL DEFAULT ('PEACE2026' || LPAD(nextval('public.registration_seq')::text, 4, '0')),
  full_name TEXT NOT NULL,
  father_name TEXT,
  gender TEXT,
  date_of_birth DATE NOT NULL,
  age INTEGER NOT NULL,
  category TEXT NOT NULL,
  mobile TEXT NOT NULL UNIQUE,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  district TEXT,
  state TEXT,
  pincode TEXT,
  church_name TEXT NOT NULL,
  pastor_name TEXT,
  church_location TEXT,
  competitions TEXT[] NOT NULL,
  bible_test_language TEXT,
  ppt_language TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.registrations TO anon, authenticated;
GRANT ALL ON public.registrations TO service_role;
GRANT USAGE ON SEQUENCE public.registration_seq TO anon, authenticated, service_role;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Public can insert (registration is open to the public)
CREATE POLICY "Anyone can register" ON public.registrations FOR INSERT TO anon, authenticated
  WITH CHECK (
    (SELECT (value)::text::boolean FROM public.app_settings WHERE key = 'registration_open') = true
  );

-- Only admins can view/update; NO public read (protects PII)
CREATE POLICY "Admins can view all registrations" ON public.registrations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update registrations" ON public.registrations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete registrations" ON public.registrations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_registrations_mobile ON public.registrations(mobile);
CREATE INDEX idx_registrations_created_at ON public.registrations(created_at DESC);

-- Bootstrap: first authenticated user to call this becomes admin (only if no admins exist)
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  SELECT COUNT(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
  IF admin_count > 0 THEN RETURN false; END IF;
  INSERT INTO public.user_roles(user_id, role) VALUES (auth.uid(), 'admin');
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;
