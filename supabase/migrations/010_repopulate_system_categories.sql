-- ============================================
-- MIGRATION 010: REPOPULAR CATEGORIAS PADRÃO DO SISTEMA
-- Insere/atualiza as categorias padrão que o trigger usa
-- ============================================

-- ============================================
-- LIMPAR CATEGORIAS ANTIGAS (se houver duplicatas)
-- ============================================
-- Remove categorias do sistema que possam estar duplicadas
DELETE FROM public.categories WHERE user_id IS NULL;

-- ============================================
-- INSERIR CATEGORIAS PADRÃO DO SISTEMA
-- user_id = NULL significa categoria do sistema (visível para todos)
-- ============================================
INSERT INTO public.categories (id, name, color, icon_id, transaction_type_id, user_id) VALUES
-- RECEITAS (transaction_type_id = 1)
(1, 'Salário', '#10b981', 1, 1, NULL),
(2, 'Freelance', '#3b82f6', 41, 1, NULL),
(3, 'Investimentos', '#8b5cf6', 8, 1, NULL),
(4, 'Reembolsos', '#f59e0b', 10, 1, NULL),

-- DESPESAS (transaction_type_id = 2)
(5, 'Moradia', '#3b82f6', 11, 2, NULL),
(6, 'Transporte', '#ef4444', 17, 2, NULL),
(7, 'Alimentação', '#10b981', 25, 2, NULL),
(8, 'Saúde', '#f59e0b', 32, 2, NULL),
(9, 'Educação', '#8b5cf6', 39, 2, NULL),
(10, 'Lazer', '#ec4899', 48, 2, NULL),
(11, 'Assinaturas', '#06b6d4', 67, 2, NULL),
(12, 'Família', '#f97316', 68, 2, NULL),
(13, 'Crédito', '#6366f1', 4, 2, NULL),
(14, 'Utilities', '#84cc16', 63, 2, NULL),
(15, 'Compras', '#ec4899', 53, 2, NULL),
(16, 'Serviços', '#06b6d4', 60, 2, NULL),
(17, 'Impostos', '#f97316', 73, 2, NULL),
(22, 'Outros', '#64748b', 84, 2, NULL),

-- APORTES/INVESTIMENTOS (transaction_type_id = 3)
(18, 'Poupança', '#22c55e', 6, 3, NULL),
(19, 'Ações', '#ef4444', 77, 3, NULL),
(20, 'Fundos', '#8b5cf6', 78, 3, NULL),
(21, 'Criptomoedas', '#ec4899', 7, 3, NULL),
(23, 'CDB', '#3b82f6', 76, 3, NULL),
(24, 'Tesouro Direto', '#f59e0b', 75, 3, NULL),
(25, 'FGTS', '#10b981', 83, 3, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  color = EXCLUDED.color,
  icon_id = EXCLUDED.icon_id,
  transaction_type_id = EXCLUDED.transaction_type_id,
  user_id = EXCLUDED.user_id,
  updated_at = NOW();

-- ============================================
-- RESETAR SEQUÊNCIA DA TABELA CATEGORIES
-- ============================================
SELECT setval('public.categories_id_seq', 25, true);

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Mostrar quantas categorias do sistema foram criadas
DO $$
DECLARE
  category_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO category_count
  FROM public.categories
  WHERE user_id IS NULL;

  RAISE NOTICE '✅ % categorias padrão do sistema criadas!', category_count;
END $$;