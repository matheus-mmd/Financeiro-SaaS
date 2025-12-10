-- =====================================================
-- Migration: Sistema de Gestão de Categorias
-- Data: 2025-12-09
-- Versão: 1.1.0
-- Descrição: Sistema de categorias padrão com soft delete
-- =====================================================

-- 1. CRIAR TABELA DE CATEGORIAS ESCONDIDAS
-- Permite usuário "esconder" categorias padrão sem deletá-las
CREATE TABLE IF NOT EXISTS user_hidden_categories (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  hidden_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

-- Habilitar RLS
ALTER TABLE user_hidden_categories ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários só veem suas próprias categorias escondidas
CREATE POLICY "Users can view own hidden categories" ON user_hidden_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can hide own categories" ON user_hidden_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unhide own categories" ON user_hidden_categories
  FOR DELETE USING (auth.uid() = user_id);

-- 2. CRIAR VIEW DE CATEGORIAS DISPONÍVEIS
-- Mostra categorias padrão + categorias do usuário - categorias escondidas
CREATE OR REPLACE VIEW v_user_categories AS
SELECT
  c.*,
  CASE
    WHEN c.user_id IS NULL THEN true
    ELSE false
  END as is_default,
  CASE
    WHEN uhc.id IS NOT NULL THEN true
    ELSE false
  END as is_hidden
FROM categories c
LEFT JOIN user_hidden_categories uhc
  ON c.id = uhc.category_id
  AND uhc.user_id = auth.uid()
WHERE
  c.deleted_at IS NULL
  AND (
    c.user_id IS NULL  -- Categorias padrão
    OR c.user_id = auth.uid()  -- Categorias do usuário
  )
  AND uhc.id IS NULL;  -- Não escondidas

-- 3. CRIAR FUNÇÃO PARA RECUPERAR CATEGORIAS PADRÃO
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CRIAR FUNÇÃO PARA ESCONDER CATEGORIA PADRÃO
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. ATUALIZAR POLÍTICAS RLS DAS CATEGORIAS
-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view all categories" ON categories;
DROP POLICY IF EXISTS "Users can create own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;

-- Criar novas políticas
-- Ver: categorias padrão (não deletadas, não escondidas) + categorias próprias
CREATE POLICY "Users can view available categories" ON categories
  FOR SELECT USING (
    deleted_at IS NULL
    AND (
      user_id IS NULL  -- Padrão do sistema
      OR user_id = auth.uid()  -- Próprias
    )
  );

-- Criar: apenas categorias próprias
CREATE POLICY "Users can create own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Atualizar: apenas categorias próprias (não pode atualizar padrão)
CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (
    auth.uid() = user_id
    AND user_id IS NOT NULL
  );

-- Deletar: apenas categorias próprias com soft delete
CREATE POLICY "Users can soft delete own categories" ON categories
  FOR UPDATE USING (
    auth.uid() = user_id
    AND user_id IS NOT NULL
  )
  WITH CHECK (
    deleted_at IS NOT NULL
  );

-- 6. GARANTIR QUE CATEGORIAS PADRÃO EXISTAM
-- Se não existirem, criar novamente
INSERT INTO categories (id, name, internal_name, icon_id, user_id) VALUES
  (1, 'Salário', 'salary', 1, NULL),
  (2, 'Freelance', 'freelance', 19, NULL),
  (3, 'Vendas', 'sales', 20, NULL),
  (4, 'Investimentos', 'investments', 23, NULL),
  (5, 'Moradia', 'housing', 2, NULL),
  (6, 'Transporte', 'transport', 3, NULL),
  (7, 'Alimentação', 'food', 6, NULL),
  (8, 'Saúde', 'health', 9, NULL),
  (9, 'Educação', 'education', 10, NULL),
  (10, 'Lazer', 'entertainment', 13, NULL),
  (11, 'Roupas', 'clothing', 7, NULL),
  (12, 'Tecnologia', 'technology', 8, NULL),
  (13, 'Outros', 'other', 26, NULL)
ON CONFLICT (id) DO UPDATE SET
  deleted_at = NULL;  -- Se foi deletada, restaurar

-- 7. VERIFICAÇÃO FINAL
-- Ver categorias disponíveis para teste
SELECT
  c.id,
  c.name,
  c.internal_name,
  CASE WHEN c.user_id IS NULL THEN 'Padrão' ELSE 'Usuário' END as tipo,
  c.deleted_at,
  COUNT(uhc.id) as usuarios_esconderam
FROM categories c
LEFT JOIN user_hidden_categories uhc ON c.id = uhc.category_id
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.name, c.internal_name, c.user_id, c.deleted_at
ORDER BY c.user_id NULLS FIRST, c.name;

-- =====================================================
-- COMO USAR NO CÓDIGO
-- =====================================================

-- Listar categorias disponíveis (padrão + usuário - escondidas):
-- SELECT * FROM categories
-- WHERE deleted_at IS NULL
--   AND (user_id IS NULL OR user_id = auth.uid())
--   AND id NOT IN (
--     SELECT category_id FROM user_hidden_categories WHERE user_id = auth.uid()
--   );

-- Esconder categoria padrão:
-- SELECT hide_default_category(auth.uid(), 5); -- Esconde "Moradia"

-- Restaurar todas as categorias padrão:
-- SELECT restore_default_categories(auth.uid());

-- Deletar (soft delete) categoria própria:
-- UPDATE categories SET deleted_at = NOW() WHERE id = X AND user_id = auth.uid();

-- =====================================================
