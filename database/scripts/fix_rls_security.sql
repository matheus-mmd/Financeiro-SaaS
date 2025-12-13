-- ============================================
-- SCRIPT URGENTE: CORRIGIR SEGURANÇA RLS
-- Execute este script IMEDIATAMENTE no SQL Editor do Supabase
-- ============================================

-- ============================================
-- 1. HABILITAR RLS EM TODAS AS TABELAS
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. REMOVER POLÍTICAS ANTIGAS (se existirem)
-- ============================================
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Categories visible to all or owner" ON public.categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can view own banks" ON public.banks;
DROP POLICY IF EXISTS "Users can insert own banks" ON public.banks;
DROP POLICY IF EXISTS "Users can update own banks" ON public.banks;
DROP POLICY IF EXISTS "Users can delete own banks" ON public.banks;
DROP POLICY IF EXISTS "Users can view own cards" ON public.cards;
DROP POLICY IF EXISTS "Users can insert own cards" ON public.cards;
DROP POLICY IF EXISTS "Users can update own cards" ON public.cards;
DROP POLICY IF EXISTS "Users can delete own cards" ON public.cards;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can insert own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can update own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can delete own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can view own targets" ON public.targets;
DROP POLICY IF EXISTS "Users can insert own targets" ON public.targets;
DROP POLICY IF EXISTS "Users can update own targets" ON public.targets;
DROP POLICY IF EXISTS "Users can delete own targets" ON public.targets;

-- ============================================
-- 3. CRIAR POLÍTICAS CORRETAS
-- ============================================

-- USERS
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- CATEGORIES
CREATE POLICY "Categories visible to all or owner" ON public.categories
  FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can insert own categories" ON public.categories
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (user_id = auth.uid());

-- BANKS
CREATE POLICY "Users can view own banks" ON public.banks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own banks" ON public.banks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own banks" ON public.banks
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own banks" ON public.banks
  FOR DELETE USING (user_id = auth.uid());

-- CARDS
CREATE POLICY "Users can view own cards" ON public.cards
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own cards" ON public.cards
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cards" ON public.cards
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own cards" ON public.cards
  FOR DELETE USING (user_id = auth.uid());

-- TRANSACTIONS
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (user_id = auth.uid());

-- ASSETS
CREATE POLICY "Users can view own assets" ON public.assets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own assets" ON public.assets
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own assets" ON public.assets
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own assets" ON public.assets
  FOR DELETE USING (user_id = auth.uid());

-- TARGETS
CREATE POLICY "Users can view own targets" ON public.targets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own targets" ON public.targets
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own targets" ON public.targets
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own targets" ON public.targets
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- 4. VERIFICAÇÃO
-- ============================================
-- Execute este SELECT para verificar se RLS está ativo
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'categories', 'banks', 'cards', 'transactions', 'assets', 'targets')
ORDER BY tablename;

-- Se todas as tabelas mostrarem rls_enabled = true, está OK!
