-- ============================================
-- MIGRATION 013: CRIAR CATEGORIAS PADRÃO PARA NOVOS USUÁRIOS
-- Quando um novo usuário é criado, automaticamente cria categorias essenciais
-- ============================================

-- ============================================
-- 1. FUNÇÃO: CRIAR CATEGORIAS PADRÃO
-- ============================================
CREATE OR REPLACE FUNCTION public.create_default_categories_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se o usuário já tem categorias
  -- (evita duplicação se a função for executada múltiplas vezes)
  IF EXISTS (SELECT 1 FROM public.categories WHERE user_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- ============================================
  -- RECEITAS (transaction_type_id = 1)
  -- ============================================
  INSERT INTO public.categories (user_id, name, color, icon_id, transaction_type_id)
  VALUES
    (NEW.id, 'Salário', '#10b981', 1, 1),           -- Wallet
    (NEW.id, 'Freelance', '#3b82f6', 41, 1),        -- Briefcase
    (NEW.id, 'Outros Ganhos', '#8b5cf6', 54, 1);    -- Gift

  -- ============================================
  -- DESPESAS (transaction_type_id = 2)
  -- ============================================
  INSERT INTO public.categories (user_id, name, color, icon_id, transaction_type_id)
  VALUES
    -- Essenciais
    (NEW.id, 'Alimentação', '#10b981', 25, 2),      -- Utensils
    (NEW.id, 'Moradia', '#3b82f6', 11, 2),          -- Home
    (NEW.id, 'Transporte', '#ef4444', 17, 2),       -- Car
    (NEW.id, 'Saúde', '#f59e0b', 32, 2),            -- Heart

    -- Pessoais
    (NEW.id, 'Educação', '#8b5cf6', 39, 2),         -- GraduationCap
    (NEW.id, 'Lazer', '#ec4899', 48, 2),            -- Gamepad2
    (NEW.id, 'Vestuário', '#06b6d4', 56, 2),        -- Shirt

    -- Recorrentes
    (NEW.id, 'Assinaturas', '#6366f1', 67, 2),      -- Smartphone
    (NEW.id, 'Contas', '#84cc16', 63, 2),           -- Zap

    -- Outros
    (NEW.id, 'Outros Gastos', '#64748b', 84, 2);    -- Tag

  -- ============================================
  -- INVESTIMENTOS/APORTES (transaction_type_id = 3)
  -- ============================================
  INSERT INTO public.categories (user_id, name, color, icon_id, transaction_type_id)
  VALUES
    (NEW.id, 'Poupança', '#22c55e', 6, 3),          -- PiggyBank
    (NEW.id, 'Ações', '#ef4444', 77, 3),            -- LineChart
    (NEW.id, 'Renda Fixa', '#3b82f6', 76, 3),       -- BadgeDollarSign
    (NEW.id, 'Outros Investimentos', '#8b5cf6', 78, 3); -- BarChart3

  RETURN NEW;
END;
$$;

-- ============================================
-- 2. TRIGGER: EXECUTAR APÓS CRIAR USUÁRIO
-- ============================================
-- Dropar trigger antigo se existir
DROP TRIGGER IF EXISTS on_user_created_add_categories ON public.users;

-- Criar trigger novo
CREATE TRIGGER on_user_created_add_categories
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_categories_for_user();

-- ============================================
-- 3. APLICAR PARA USUÁRIOS EXISTENTES (OPCIONAL)
-- ============================================
-- Se você quiser criar categorias para usuários que já existem e não têm categorias:

-- Descomentar as linhas abaixo para executar:

-- DO $$
-- DECLARE
--   user_record RECORD;
-- BEGIN
--   FOR user_record IN
--     SELECT id FROM public.users
--     WHERE NOT EXISTS (
--       SELECT 1 FROM public.categories WHERE user_id = users.id
--     )
--   LOOP
--     -- Criar categorias para cada usuário sem categorias
--     PERFORM public.create_default_categories_for_user_manual(user_record.id);
--   END LOOP;
-- END $$;

-- ============================================
-- 4. FUNÇÃO AUXILIAR: CRIAR CATEGORIAS MANUALMENTE
-- ============================================
-- Use esta função se precisar criar categorias para um usuário específico
CREATE OR REPLACE FUNCTION public.create_default_categories_for_user_manual(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se o usuário já tem categorias
  IF EXISTS (SELECT 1 FROM public.categories WHERE user_id = p_user_id) THEN
    RAISE NOTICE 'Usuário % já possui categorias', p_user_id;
    RETURN;
  END IF;

  -- RECEITAS
  INSERT INTO public.categories (user_id, name, color, icon_id, transaction_type_id)
  VALUES
    (p_user_id, 'Salário', '#10b981', 1, 1),
    (p_user_id, 'Freelance', '#3b82f6', 41, 1),
    (p_user_id, 'Outros Ganhos', '#8b5cf6', 54, 1);

  -- DESPESAS
  INSERT INTO public.categories (user_id, name, color, icon_id, transaction_type_id)
  VALUES
    (p_user_id, 'Alimentação', '#10b981', 25, 2),
    (p_user_id, 'Moradia', '#3b82f6', 11, 2),
    (p_user_id, 'Transporte', '#ef4444', 17, 2),
    (p_user_id, 'Saúde', '#f59e0b', 32, 2),
    (p_user_id, 'Educação', '#8b5cf6', 39, 2),
    (p_user_id, 'Lazer', '#ec4899', 48, 2),
    (p_user_id, 'Vestuário', '#06b6d4', 56, 2),
    (p_user_id, 'Assinaturas', '#6366f1', 67, 2),
    (p_user_id, 'Contas', '#84cc16', 63, 2),
    (p_user_id, 'Outros Gastos', '#64748b', 84, 2);

  -- INVESTIMENTOS
  INSERT INTO public.categories (user_id, name, color, icon_id, transaction_type_id)
  VALUES
    (p_user_id, 'Poupança', '#22c55e', 6, 3),
    (p_user_id, 'Ações', '#ef4444', 77, 3),
    (p_user_id, 'Renda Fixa', '#3b82f6', 76, 3),
    (p_user_id, 'Outros Investimentos', '#8b5cf6', 78, 3);

  RAISE NOTICE 'Categorias criadas com sucesso para o usuário %', p_user_id;
END;
$$;

-- ============================================
-- 5. VERIFICAÇÃO
-- ============================================
-- Verificar se o trigger foi criado
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_user_created_add_categories';

-- ============================================
-- RESUMO DAS CATEGORIAS CRIADAS:
-- ============================================
--
-- RECEITAS (3):
-- - Salário (verde, Wallet)
-- - Freelance (azul, Briefcase)
-- - Outros Ganhos (roxo, Gift)
--
-- DESPESAS (10):
-- - Alimentação (verde, Utensils)
-- - Moradia (azul, Home)
-- - Transporte (vermelho, Car)
-- - Saúde (laranja, Heart)
-- - Educação (roxo, GraduationCap)
-- - Lazer (pink, Gamepad2)
-- - Vestuário (cyan, Shirt)
-- - Assinaturas (indigo, Smartphone)
-- - Contas (lime, Zap)
-- - Outros Gastos (cinza, Tag)
--
-- INVESTIMENTOS (4):
-- - Poupança (verde, PiggyBank)
-- - Ações (vermelho, LineChart)
-- - Renda Fixa (azul, BadgeDollarSign)
-- - Outros Investimentos (roxo, BarChart3)
--
-- TOTAL: 17 categorias essenciais
-- ============================================
