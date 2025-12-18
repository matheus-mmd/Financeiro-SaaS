-- ============================================
-- MIGRATION 017: ENFORCE CATEGORIES user_id NOT NULL
-- Remove categorias "do sistema" e força que toda categoria
-- DEVE ter um user_id associado
-- ============================================

-- ============================================
-- PASSO 1: VERIFICAR SITUAÇÃO ATUAL
-- ============================================
DO $$
DECLARE
  null_categories_count INT;
  total_categories_count INT;
BEGIN
  -- Contar categorias sem user_id
  SELECT COUNT(*) INTO null_categories_count
  FROM public.categories
  WHERE user_id IS NULL AND deleted_at IS NULL;

  -- Contar total de categorias
  SELECT COUNT(*) INTO total_categories_count
  FROM public.categories
  WHERE deleted_at IS NULL;

  RAISE NOTICE '================================';
  RAISE NOTICE 'ANTES DA CORREÇÃO:';
  RAISE NOTICE '================================';
  RAISE NOTICE 'Categorias SEM user_id: %', null_categories_count;
  RAISE NOTICE 'Categorias COM user_id: %', total_categories_count - null_categories_count;
  RAISE NOTICE 'Total de categorias: %', total_categories_count;
  RAISE NOTICE '================================';
END $$;

-- ============================================
-- PASSO 2: DELETAR CATEGORIAS SEM user_id
-- ============================================
-- ATENÇÃO: Isso remove PERMANENTEMENTE as categorias "do sistema"
-- As categorias serão recriadas individualmente para cada usuário
-- pelo trigger on_user_created_add_categories (migration 013)

DELETE FROM public.categories
WHERE user_id IS NULL;

DO $$
BEGIN
  RAISE NOTICE '✅ Categorias sem user_id foram deletadas!';
END $$;

-- ============================================
-- PASSO 3: ADICIONAR CONSTRAINT NOT NULL
-- ============================================
-- Remove constraint antiga se existir
ALTER TABLE public.categories
  DROP CONSTRAINT IF EXISTS categories_user_id_not_null;

-- Adiciona constraint NOT NULL
ALTER TABLE public.categories
  ALTER COLUMN user_id SET NOT NULL;

DO $$
BEGIN
  RAISE NOTICE '✅ Constraint NOT NULL adicionada à coluna user_id!';
END $$;

-- ============================================
-- PASSO 4: ATUALIZAR POLÍTICA RLS
-- ============================================
-- Remove política antiga
DROP POLICY IF EXISTS "Categories visible to all or owner" ON public.categories;

-- NOVA POLÍTICA: Apenas categorias do próprio usuário são visíveis
CREATE POLICY "Users can view own categories" ON public.categories
  FOR SELECT USING (user_id = auth.uid());

-- Políticas de INSERT, UPDATE e DELETE já existem (criadas na migration 006)
-- Apenas precisamos garantir que estão corretas:

DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
CREATE POLICY "Users can insert own categories" ON public.categories
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;
CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (user_id = auth.uid());

DO $$
BEGIN
  RAISE NOTICE '✅ Políticas RLS atualizadas!';
END $$;

-- ============================================
-- PASSO 5: VERIFICAR TRIGGERS ATIVOS
-- ============================================
DO $$
DECLARE
  trigger_count INT;
  rec RECORD;
BEGIN
  -- Verificar se apenas o trigger correto está ativo
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE event_object_table = 'users'
    AND trigger_name LIKE '%categories%';

  RAISE NOTICE '================================';
  RAISE NOTICE 'TRIGGERS RELACIONADOS A CATEGORIAS:';
  RAISE NOTICE '================================';

  -- Mostrar triggers ativos
  FOR rec IN (
    SELECT trigger_name, action_statement
    FROM information_schema.triggers
    WHERE event_object_table = 'users'
      AND trigger_name LIKE '%categories%'
  ) LOOP
    RAISE NOTICE 'Trigger: %', rec.trigger_name;
  END LOOP;

  RAISE NOTICE '================================';
END $$;

-- ============================================
-- PASSO 6: GARANTIR QUE TRIGGER CORRETO EXISTE
-- ============================================
-- Verificar se o trigger da migration 013 existe
-- Se não existir, recriar

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'on_user_created_add_categories'
      AND event_object_table = 'users'
  ) THEN
    RAISE WARNING '⚠️ Trigger on_user_created_add_categories NÃO encontrado!';
    RAISE WARNING '⚠️ Execute a migration 013 para criar o trigger correto.';
  ELSE
    RAISE NOTICE '✅ Trigger on_user_created_add_categories está ativo!';
  END IF;
END $$;

-- ============================================
-- PASSO 7: GARANTIR QUE TRIGGERS ANTIGOS FORAM REMOVIDOS
-- ============================================
-- Remove trigger antigo da migration 009 (se ainda existir)
DROP TRIGGER IF EXISTS assign_categories_on_user_creation ON public.users;

-- Remove função antiga da migration 009 (se ainda existir)
DROP FUNCTION IF EXISTS public.assign_default_categories_to_user();

DO $$
BEGIN
  RAISE NOTICE '✅ Triggers e funções antigas removidas!';
END $$;

-- ============================================
-- PASSO 8: VERIFICAÇÃO FINAL
-- ============================================
DO $$
DECLARE
  null_categories_count INT;
  total_categories_count INT;
  user_categories_count INT;
BEGIN
  -- Contar categorias sem user_id (deve ser 0)
  SELECT COUNT(*) INTO null_categories_count
  FROM public.categories
  WHERE user_id IS NULL AND deleted_at IS NULL;

  -- Contar total de categorias
  SELECT COUNT(*) INTO total_categories_count
  FROM public.categories
  WHERE deleted_at IS NULL;

  -- Contar usuários com categorias
  SELECT COUNT(DISTINCT user_id) INTO user_categories_count
  FROM public.categories
  WHERE deleted_at IS NULL;

  RAISE NOTICE '================================';
  RAISE NOTICE 'DEPOIS DA CORREÇÃO:';
  RAISE NOTICE '================================';
  RAISE NOTICE 'Categorias SEM user_id: % (deve ser 0)', null_categories_count;
  RAISE NOTICE 'Total de categorias: %', total_categories_count;
  RAISE NOTICE 'Usuários com categorias: %', user_categories_count;
  RAISE NOTICE '================================';

  IF null_categories_count > 0 THEN
    RAISE EXCEPTION '❌ ERRO: Ainda existem % categorias sem user_id!', null_categories_count;
  END IF;

  RAISE NOTICE '✅ SUCESSO! Todas as categorias agora têm user_id obrigatório!';
END $$;

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON COLUMN public.categories.user_id IS 'ID do usuário dono da categoria (NOT NULL - todas categorias devem ter dono)';

COMMENT ON TABLE public.categories IS 'Categorias de transações. Cada categoria DEVE pertencer a um usuário (user_id NOT NULL). Novas categorias são criadas automaticamente para novos usuários via trigger on_user_created_add_categories.';

-- ============================================
-- RESUMO DA MIGRATION
-- ============================================
--
-- O QUE FOI FEITO:
-- ✅ Deletadas todas as categorias "do sistema" (user_id = NULL)
-- ✅ Adicionado constraint NOT NULL na coluna user_id
-- ✅ Atualizada política RLS para não permitir user_id = NULL
-- ✅ Removidos triggers antigos que criavam categorias NULL
-- ✅ Verificado que trigger correto (on_user_created_add_categories) está ativo
--
-- COMPORTAMENTO APÓS ESTA MIGRATION:
-- ✅ Toda categoria DEVE ter um user_id
-- ✅ Tentativas de criar categorias sem user_id serão BLOQUEADAS
-- ✅ Novos usuários recebem 17 categorias automaticamente (migration 013)
-- ✅ Usuários só veem suas próprias categorias (RLS)
--
-- ============================================