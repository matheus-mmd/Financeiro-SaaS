-- ============================================
-- MIGRATION 034: REMOVER PAYMENT_STATUS
-- Remove coluna payment_status_id de transactions,
-- atualiza a view transactions_enriched e
-- remove a tabela payment_statuses
-- ============================================

-- 1. Dropar a view existente (CREATE OR REPLACE nao permite remover colunas)
DROP VIEW IF EXISTS public.transactions_enriched;

-- 2. Recriar a view transactions_enriched SEM campos de payment_status
CREATE VIEW public.transactions_enriched
WITH (security_invoker = true) AS
SELECT
  t.id,
  t.user_id,
  t.description,
  t.amount,
  t.notes,
  t.transaction_date,
  t.payment_date,
  t.installment_number,
  t.installment_total,
  t.installment_group_id,
  t.is_recurring,
  t.recurrence_end_date,
  t.recurrence_parent_id,
  t.created_at,
  t.updated_at,

  -- Category
  t.category_id,
  c.name AS category_name,
  c.color AS category_color,
  ci.name AS category_icon,

  -- Transaction Type
  t.transaction_type_id,
  tt.name AS transaction_type_name,
  tt.internal_name AS transaction_type_internal_name,
  tt.color AS transaction_type_color,

  -- Payment Method
  t.payment_method_id,
  pm.name AS payment_method_name,

  -- Bank
  t.bank_id,
  b.name AS bank_name,
  b.color AS bank_color,

  -- Card
  t.card_id,
  cr.name AS card_name,
  cr.color AS card_color,
  ct.name AS card_type_name,
  cb.name AS card_brand_name,

  -- Recurrence Frequency
  t.recurrence_frequency_id,
  rf.name AS recurrence_frequency_name,

  -- Category Emoji
  c.emoji AS category_emoji

FROM public.transactions t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.icons ci ON c.icon_id = ci.id
LEFT JOIN public.transaction_types tt ON t.transaction_type_id = tt.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.banks b ON t.bank_id = b.id
LEFT JOIN public.cards cr ON t.card_id = cr.id
LEFT JOIN public.card_types ct ON cr.card_type_id = ct.id
LEFT JOIN public.card_brands cb ON cr.card_brand_id = cb.id
LEFT JOIN public.recurrence_frequencies rf ON t.recurrence_frequency_id = rf.id
WHERE t.deleted_at IS NULL;

COMMENT ON VIEW public.transactions_enriched IS 'Transações com todos os dados relacionados (categorias, ícones, emojis, tipos, etc) para performance - SECURITY INVOKER para respeitar RLS';

-- 3. Remover coluna payment_status_id da tabela transactions
ALTER TABLE public.transactions DROP COLUMN IF EXISTS payment_status_id;

-- 4. Remover políticas RLS da tabela payment_statuses
DROP POLICY IF EXISTS "Payment statuses are viewable by everyone" ON public.payment_statuses;

-- 5. Remover tabela payment_statuses
DROP TABLE IF EXISTS public.payment_statuses;
