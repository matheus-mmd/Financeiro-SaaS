-- ============================================
-- MIGRATION 031: ADICIONAR category_id NA TABELA user_fixed_expenses
-- Vincula despesas fixas a categorias reais do sistema
-- ============================================

-- 1. Adicionar coluna category_id (FK para categories)
ALTER TABLE public.user_fixed_expenses
ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL;

-- 2. Preencher category_id para registros existentes
-- Mapeia 'moradia' -> categoria 'Moradia' (transaction_type_id=2)
-- Mapeia 'servicos_basicos' -> categoria 'Serviços' (transaction_type_id=2)
UPDATE public.user_fixed_expenses ufe
SET category_id = c.id
FROM public.categories c
WHERE c.user_id = ufe.user_id
  AND c.transaction_type_id = 2
  AND (
    (ufe.category = 'moradia' AND c.name = 'Moradia')
    OR
    (ufe.category = 'servicos_basicos' AND c.name = 'Serviços')
  )
  AND ufe.category_id IS NULL;

-- 3. Criar indice para category_id
CREATE INDEX IF NOT EXISTS idx_user_fixed_expenses_category_id
ON public.user_fixed_expenses(category_id)
WHERE deleted_at IS NULL AND category_id IS NOT NULL;

COMMENT ON COLUMN public.user_fixed_expenses.category_id IS 'Referência à categoria real do sistema (categories.id)';