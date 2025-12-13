-- ============================================
-- MIGRATION 012: REMOVE AUTO CATEGORIES
-- Remove a criação automática de categorias para novos usuários
-- Os usuários agora começam do zero e criam suas próprias categorias
-- ============================================

-- ============================================
-- 1. REMOVER TRIGGER DE AUTO-ATRIBUIÇÃO
-- ============================================
DROP TRIGGER IF EXISTS assign_categories_on_user_creation ON public.users;

-- ============================================
-- 2. REMOVER FUNÇÃO DE AUTO-ATRIBUIÇÃO
-- ============================================
DROP FUNCTION IF EXISTS public.assign_default_categories_to_user();

-- ============================================
-- 3. LIMPAR CATEGORIAS DUPLICADAS DE USUÁRIOS EXISTENTES (OPCIONAL)
-- Descomente as linhas abaixo se quiser limpar as categorias duplicadas
-- ATENÇÃO: Isso irá deletar TODAS as categorias dos usuários (não do sistema)
-- ============================================

-- PASSO 1: Ver quantas categorias cada usuário tem (para análise)
-- SELECT
--   user_id,
--   COUNT(*) as total_categorias
-- FROM public.categories
-- WHERE user_id IS NOT NULL
-- GROUP BY user_id
-- ORDER BY total_categorias DESC;

-- PASSO 2: Deletar todas as categorias dos usuários (mantém apenas categorias do sistema)
-- CUIDADO: Isso remove TODAS as categorias personalizadas dos usuários
-- DELETE FROM public.categories
-- WHERE user_id IS NOT NULL;

-- PASSO 3: Verificar que sobraram apenas categorias do sistema
-- SELECT
--   COUNT(*) as total_categorias_sistema
-- FROM public.categories
-- WHERE user_id IS NULL;

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON TABLE public.categories IS
'Categorias do sistema (user_id = NULL) e categorias personalizadas dos usuários (user_id = UUID). Categorias não são mais criadas automaticamente.';
