-- ============================================
-- MIGRATION 006: ROW LEVEL SECURITY (RLS)
-- Políticas de segurança para multi-tenancy
-- ============================================

-- ============================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS - USERS
-- ============================================
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- POLÍTICAS RLS - CATEGORIES
-- Categorias do sistema (user_id NULL) são visíveis para todos
-- Categorias customizadas só para o dono
-- ============================================
CREATE POLICY "Categories visible to all or owner" ON public.categories
  FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can insert own categories" ON public.categories
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- POLÍTICAS RLS - BANKS
-- ============================================
CREATE POLICY "Users can view own banks" ON public.banks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own banks" ON public.banks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own banks" ON public.banks
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own banks" ON public.banks
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- POLÍTICAS RLS - CARDS
-- ============================================
CREATE POLICY "Users can view own cards" ON public.cards
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own cards" ON public.cards
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cards" ON public.cards
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own cards" ON public.cards
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- POLÍTICAS RLS - TRANSACTIONS
-- ============================================
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- POLÍTICAS RLS - ASSETS
-- ============================================
CREATE POLICY "Users can view own assets" ON public.assets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own assets" ON public.assets
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own assets" ON public.assets
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own assets" ON public.assets
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- POLÍTICAS RLS - TARGETS
-- ============================================
CREATE POLICY "Users can view own targets" ON public.targets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own targets" ON public.targets
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own targets" ON public.targets
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own targets" ON public.targets
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- POLÍTICAS PARA TABELAS DE REFERÊNCIA
-- Estas tabelas são de leitura pública (icons, types, statuses, methods, etc.)
-- ============================================

-- Icons
ALTER TABLE public.icons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Icons are viewable by everyone" ON public.icons
  FOR SELECT USING (true);

-- Transaction Types
ALTER TABLE public.transaction_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Transaction types are viewable by everyone" ON public.transaction_types
  FOR SELECT USING (true);

-- Payment Statuses
ALTER TABLE public.payment_statuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Payment statuses are viewable by everyone" ON public.payment_statuses
  FOR SELECT USING (true);

-- Payment Methods
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Payment methods are viewable by everyone" ON public.payment_methods
  FOR SELECT USING (true);

-- Recurrence Frequencies
ALTER TABLE public.recurrence_frequencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recurrence frequencies are viewable by everyone" ON public.recurrence_frequencies
  FOR SELECT USING (true);

-- Account Types
ALTER TABLE public.account_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Account types are viewable by everyone" ON public.account_types
  FOR SELECT USING (true);

-- Card Types
ALTER TABLE public.card_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Card types are viewable by everyone" ON public.card_types
  FOR SELECT USING (true);

-- Card Brands
ALTER TABLE public.card_brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Card brands are viewable by everyone" ON public.card_brands
  FOR SELECT USING (true);
