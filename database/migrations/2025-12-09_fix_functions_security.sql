-- =====================================================
-- Migration: Corrigir search_path nas funções
-- Data: 2025-12-09
-- Versão: 1.1.2
-- Descrição: Adiciona search_path nas funções de categorias
-- =====================================================

-- 1. CORRIGIR restore_default_categories
CREATE OR REPLACE FUNCTION restore_default_categories(p_user_id UUID)
RETURNS TABLE(restored_count INTEGER) AS $$
BEGIN
  -- Remover todas as categorias escondidas do usuário
  DELETE FROM user_hidden_categories
  WHERE user_id = p_user_id;

  -- Retornar quantidade de categorias restauradas
  RETURN QUERY
  SELECT COUNT(*)::INTEGER as restored_count
  FROM categories
  WHERE user_id IS NULL AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- 2. CORRIGIR hide_default_category
CREATE OR REPLACE FUNCTION hide_default_category(
  p_user_id UUID,
  p_category_id INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_category_user_id UUID;
BEGIN
  -- Verificar se categoria é padrão
  SELECT user_id INTO v_category_user_id
  FROM categories
  WHERE id = p_category_id;

  IF v_category_user_id IS NOT NULL THEN
    RAISE EXCEPTION 'Apenas categorias padrão podem ser escondidas';
  END IF;

  -- Esconder categoria
  INSERT INTO user_hidden_categories (user_id, category_id)
  VALUES (p_user_id, p_category_id)
  ON CONFLICT (user_id, category_id) DO NOTHING;

  RETURN true;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- 3. VERIFICAR
SELECT
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'restore_default_categories',
    'hide_default_category',
    'update_updated_at_column'
  )
ORDER BY routine_name;

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================
-- Todas as 3 funções devem ter security_type = 'DEFINER'
-- e search_path configurado
