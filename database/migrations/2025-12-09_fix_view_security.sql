-- =====================================================
-- Migration: Corrigir Segurança da View de Categorias
-- Data: 2025-12-09
-- Versão: 1.1.1
-- Descrição: Remove view SECURITY DEFINER, usa queries diretas
-- =====================================================

-- 1. REMOVER VIEW
DROP VIEW IF EXISTS v_user_categories;

-- 2. A view não é mais necessária
-- O código da aplicação já faz a query corretamente
-- usando fetchData('/api/categories') que:
-- - Filtra por user_id (RLS)
-- - Remove categorias escondidas (user_hidden_categories)
-- - Enriquece com dados de ícones

-- 3. VERIFICAR POLÍTICAS RLS
-- As políticas já estão corretas:
SELECT
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename IN ('categories', 'user_hidden_categories')
ORDER BY tablename, policyname;

-- =====================================================
-- INSTRUÇÕES
-- =====================================================

-- A aplicação agora usa queries diretas via supabaseApi.js
-- que já implementa toda a lógica de filtro corretamente.

-- Para buscar categorias disponíveis:
-- SELECT * FROM categories
-- WHERE deleted_at IS NULL
--   AND (user_id IS NULL OR user_id = auth.uid())
--   AND id NOT IN (
--     SELECT category_id FROM user_hidden_categories
--     WHERE user_id = auth.uid()
--   );
