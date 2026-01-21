-- ============================================
-- MIGRATION 023: DESABILITAR CRIAÇÃO AUTOMÁTICA DE CATEGORIAS
-- Remove o trigger que cria categorias automaticamente para novos usuários
-- Agora as "Categorias Personalizadas" começam vazias e os usuários criam as suas
-- ============================================

-- ============================================
-- 1. REMOVER TRIGGER
-- ============================================
DROP TRIGGER IF EXISTS on_user_created_add_categories ON public.users;

-- ============================================
-- 2. REMOVER FUNÇÕES (opcional - mantidas comentadas caso queira usar manualmente)
-- ============================================
DROP FUNCTION IF EXISTS public.create_default_categories_for_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_default_categories_for_user_manual(UUID) CASCADE;

-- ============================================
-- 3. VERIFICAÇÃO
-- ============================================
-- Verificar se o trigger foi removido
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'on_user_created_add_categories'
  ) THEN
    RAISE NOTICE 'Trigger on_user_created_add_categories removido com sucesso!';
  END IF;
END $$;

-- ============================================
-- NOTA:
-- Após esta migration, novos usuários NÃO terão categorias criadas automaticamente.
-- As "Categorias Padrão" exibidas na tela são apenas visuais/referência.
-- Os usuários devem criar suas próprias categorias em "Categorias Personalizadas".
-- ============================================