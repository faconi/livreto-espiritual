-- ========================================
-- 1. ENUM TYPES
-- ========================================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.loan_status AS ENUM ('pending', 'active', 'returned', 'overdue', 'renewal_pending', 'return_pending');
CREATE TYPE public.sale_status AS ENUM ('pending', 'confirmed', 'cancelled');
CREATE TYPE public.activity_type AS ENUM (
  'loan_request', 'loan_confirmed', 'loan_rejected',
  'return_request', 'return_confirmed', 'return_rejected',
  'renewal_request', 'renewal_confirmed', 'renewal_rejected',
  'purchase', 'purchase_confirmed', 'purchase_cancelled',
  'review', 'wishlist_add', 'wishlist_remove', 'message'
);

-- ========================================
-- 2. PROFILES TABLE
-- ========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  social_name TEXT,
  phone TEXT,
  cpf TEXT,
  address JSONB,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 3. USER ROLES TABLE (SEPARATE FOR SECURITY)
-- ========================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. SECURITY DEFINER FUNCTIONS
-- ========================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- ========================================
-- 5. BOOKS TABLE
-- ========================================
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  spirit_author TEXT,
  publisher TEXT,
  publication_year INTEGER,
  edition TEXT,
  pages INTEGER,
  isbn TEXT,
  barcode TEXT,
  cover_url TEXT,
  summary TEXT,
  category TEXT,
  tags TEXT[],
  available_for_loan INTEGER NOT NULL DEFAULT 0,
  available_for_sale INTEGER NOT NULL DEFAULT 0,
  sale_price DECIMAL(10,2),
  discount INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 6. LOANS TABLE
-- ========================================
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  status loan_status NOT NULL DEFAULT 'pending',
  loan_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  return_date TIMESTAMPTZ,
  renewals_count INTEGER DEFAULT 0,
  user_notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 7. SALES TABLE
-- ========================================
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  discount INTEGER DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  status sale_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 8. REVIEWS TABLE
-- ========================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 9. WISHLISTS TABLE
-- ========================================
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_id)
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 10. CART ITEMS TABLE
-- ========================================
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  type TEXT NOT NULL CHECK (type IN ('loan', 'purchase')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_id, type)
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 11. ACTIVITIES TABLE
-- ========================================
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type activity_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  item_id UUID,
  item_title TEXT,
  metadata JSONB,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 12. SYSTEM SETTINGS TABLE
-- ========================================
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 13. RLS POLICIES - PROFILES
-- ========================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ========================================
-- 14. RLS POLICIES - USER ROLES
-- ========================================
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin());

-- ========================================
-- 15. RLS POLICIES - BOOKS
-- ========================================
CREATE POLICY "Anyone can view books"
  ON public.books FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage books"
  ON public.books FOR ALL
  USING (public.is_admin());

-- ========================================
-- 16. RLS POLICIES - LOANS
-- ========================================
CREATE POLICY "Users can view own loans"
  ON public.loans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all loans"
  ON public.loans FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Users can create own loans"
  ON public.loans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loans"
  ON public.loans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all loans"
  ON public.loans FOR ALL
  USING (public.is_admin());

-- ========================================
-- 17. RLS POLICIES - SALES
-- ========================================
CREATE POLICY "Users can view own sales"
  ON public.sales FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sales"
  ON public.sales FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Users can create own sales"
  ON public.sales FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all sales"
  ON public.sales FOR ALL
  USING (public.is_admin());

-- ========================================
-- 18. RLS POLICIES - REVIEWS
-- ========================================
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- 19. RLS POLICIES - WISHLISTS
-- ========================================
CREATE POLICY "Users can view own wishlist"
  ON public.wishlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own wishlist"
  ON public.wishlists FOR ALL
  USING (auth.uid() = user_id);

-- ========================================
-- 20. RLS POLICIES - CART ITEMS
-- ========================================
CREATE POLICY "Users can view own cart"
  ON public.cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart"
  ON public.cart_items FOR ALL
  USING (auth.uid() = user_id);

-- ========================================
-- 21. RLS POLICIES - ACTIVITIES
-- ========================================
CREATE POLICY "Users can view own activities"
  ON public.activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activities"
  ON public.activities FOR SELECT
  USING (public.is_admin());

CREATE POLICY "System can create activities"
  ON public.activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 22. RLS POLICIES - SYSTEM SETTINGS
-- ========================================
CREATE POLICY "Anyone can view settings"
  ON public.system_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON public.system_settings FOR ALL
  USING (public.is_admin());

-- ========================================
-- 23. TRIGGERS - AUTO CREATE PROFILE
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 24. TRIGGERS - UPDATE TIMESTAMPS
-- ========================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ========================================
-- 25. INSERT DEFAULT SETTINGS
-- ========================================
INSERT INTO public.system_settings (key, value, description) VALUES
  ('app_identity', '{"appName": "Livraria Espírita", "logoUrl": null, "faviconUrl": null}', 'Identidade visual do sistema'),
  ('theme_colors', '{"primary": "262 83% 58%", "secondary": "220 14.3% 95.9%", "accent": "262 83% 58%"}', 'Cores do tema'),
  ('business_rules', '{"maxLoanDays": 15, "maxSimultaneousLoans": 3, "maxRenewals": 2, "daysBeforeDueWarning": 3}', 'Regras de negócio para empréstimos'),
  ('payment', '{"pixKey": "Pix@EvangelhoDeCristoOP.com.br"}', 'Configurações de pagamento'),
  ('api_endpoints', '{"backendUrl": null, "isbnSearchUrl": null, "requestTimeout": 30000}', 'Endpoints de API externa');