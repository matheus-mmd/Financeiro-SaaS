-- ============================================
-- MIGRATION 005: VIEWS
-- Views para enriquecimento de dados com performance
-- ============================================

-- ============================================
-- VIEW: transactions_enriched
-- Transações com todos os dados enriquecidos (categorias, tipos, bancos, cartões)
-- ============================================
CREATE OR REPLACE VIEW public.transactions_enriched
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

  -- Payment Status
  t.payment_status_id,
  ps.name AS payment_status_name,
  ps.internal_name AS payment_status_internal_name,
  ps.color AS payment_status_color,

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
  rf.name AS recurrence_frequency_name

FROM public.transactions t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.icons ci ON c.icon_id = ci.id
LEFT JOIN public.transaction_types tt ON t.transaction_type_id = tt.id
LEFT JOIN public.payment_statuses ps ON t.payment_status_id = ps.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.banks b ON t.bank_id = b.id
LEFT JOIN public.cards cr ON t.card_id = cr.id
LEFT JOIN public.card_types ct ON cr.card_type_id = ct.id
LEFT JOIN public.card_brands cb ON cr.card_brand_id = cb.id
LEFT JOIN public.recurrence_frequencies rf ON t.recurrence_frequency_id = rf.id
WHERE t.deleted_at IS NULL;

COMMENT ON VIEW public.transactions_enriched IS 'Transações com todos os dados relacionados (categorias, ícones, tipos, etc) para performance - SECURITY INVOKER para respeitar RLS';

-- ============================================
-- VIEW: assets_enriched
-- Ativos com dados enriquecidos e ganho/perda calculados
-- ============================================
CREATE OR REPLACE VIEW public.assets_enriched
WITH (security_invoker = true) AS
SELECT
  a.id,
  a.user_id,
  a.name,
  a.description,
  a.value,
  a.yield_rate,
  a.currency,
  a.valuation_date,
  a.purchase_date,
  a.purchase_value,
  a.created_at,
  a.updated_at,

  -- Ganho/Perda calculado
  CASE
    WHEN a.purchase_value IS NOT NULL THEN a.value - a.purchase_value
    ELSE NULL
  END AS gain_loss,

  CASE
    WHEN a.purchase_value IS NOT NULL AND a.purchase_value > 0 THEN
      ROUND(((a.value - a.purchase_value) / a.purchase_value * 100)::NUMERIC, 2)
    ELSE NULL
  END AS gain_loss_percentage,

  -- Category
  a.category_id,
  c.name AS category_name,
  c.color AS category_color,
  ci.name AS category_icon,

  -- Transaction Type (usado como tipo de ativo)
  tt.name AS asset_type_name,
  tt.color AS asset_type_color

FROM public.assets a
LEFT JOIN public.categories c ON a.category_id = c.id
LEFT JOIN public.icons ci ON c.icon_id = ci.id
LEFT JOIN public.transaction_types tt ON c.transaction_type_id = tt.id
WHERE a.deleted_at IS NULL;

COMMENT ON VIEW public.assets_enriched IS 'Ativos com dados de categoria e ganho/perda calculados automaticamente - SECURITY INVOKER para respeitar RLS';

-- ============================================
-- VIEW: targets_enriched
-- Metas com progresso e dias restantes calculados
-- ============================================
CREATE OR REPLACE VIEW public.targets_enriched
WITH (security_invoker = true) AS
SELECT
  t.id,
  t.user_id,
  t.title,
  t.description,
  t.goal_amount,
  t.current_amount,
  t.monthly_target,
  t.status,
  t.start_date,
  t.deadline,
  t.completed_at,
  t.created_at,
  t.updated_at,

  -- Progresso calculado
  ROUND((t.current_amount / t.goal_amount * 100)::NUMERIC, 2) AS progress_percentage,
  t.goal_amount - t.current_amount AS remaining_amount,

  -- Dias restantes
  CASE
    WHEN t.deadline IS NOT NULL THEN t.deadline - CURRENT_DATE
    ELSE NULL
  END AS days_remaining,

  -- Category
  t.category_id,
  c.name AS category_name,
  c.color AS category_color,
  ci.name AS category_icon

FROM public.targets t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.icons ci ON c.icon_id = ci.id
WHERE t.deleted_at IS NULL;

COMMENT ON VIEW public.targets_enriched IS 'Metas com progresso, dias restantes e dados de categoria calculados - SECURITY INVOKER para respeitar RLS';

-- ============================================
-- VIEW: banks_enriched
-- Bancos com ícones e tipo de conta
-- ============================================
CREATE OR REPLACE VIEW public.banks_enriched
WITH (security_invoker = true) AS
SELECT
  b.id,
  b.user_id,
  b.name,
  b.color,
  b.agency,
  b.account,
  b.initial_balance,
  b.current_balance,
  b.is_active,
  b.created_at,
  b.updated_at,

  -- Icon
  b.icon_id,
  i.name AS icon_name,

  -- Account Type
  b.account_type_id,
  at.name AS account_type_name,
  at.internal_name AS account_type_internal_name

FROM public.banks b
LEFT JOIN public.icons i ON b.icon_id = i.id
LEFT JOIN public.account_types at ON b.account_type_id = at.id
WHERE b.deleted_at IS NULL;

COMMENT ON VIEW public.banks_enriched IS 'Bancos com ícones e tipo de conta enriquecidos - SECURITY INVOKER para respeitar RLS';

-- ============================================
-- VIEW: cards_enriched
-- Cartões com ícones, tipo, bandeira e banco
-- ============================================
CREATE OR REPLACE VIEW public.cards_enriched
WITH (security_invoker = true) AS
SELECT
  c.id,
  c.user_id,
  c.name,
  c.color,
  c.credit_limit,
  c.closing_day,
  c.due_day,
  c.current_balance,
  c.is_active,
  c.created_at,
  c.updated_at,

  -- Icon
  c.icon_id,
  i.name AS icon_name,

  -- Card Type
  c.card_type_id,
  ct.name AS card_type_name,
  ct.internal_name AS card_type_internal_name,

  -- Card Brand
  c.card_brand_id,
  cb.name AS card_brand_name,

  -- Bank (optional)
  c.bank_id,
  b.name AS bank_name,
  b.color AS bank_color

FROM public.cards c
LEFT JOIN public.icons i ON c.icon_id = i.id
LEFT JOIN public.card_types ct ON c.card_type_id = ct.id
LEFT JOIN public.card_brands cb ON c.card_brand_id = cb.id
LEFT JOIN public.banks b ON c.bank_id = b.id
WHERE c.deleted_at IS NULL;

COMMENT ON VIEW public.cards_enriched IS 'Cartões com ícones, tipo, bandeira e banco enriquecidos - SECURITY INVOKER para respeitar RLS';

-- ============================================
-- VIEW: categories_enriched
-- Categorias com ícones e tipo de transação
-- ============================================
CREATE OR REPLACE VIEW public.categories_enriched
WITH (security_invoker = true) AS
SELECT
  c.id,
  c.name,
  c.color,
  c.user_id,
  c.created_at,
  c.updated_at,

  -- Icon
  c.icon_id,
  i.name AS icon_name,

  -- Transaction Type
  c.transaction_type_id,
  tt.name AS transaction_type_name,
  tt.internal_name AS transaction_type_internal_name,
  tt.color AS transaction_type_color

FROM public.categories c
LEFT JOIN public.icons i ON c.icon_id = i.id
LEFT JOIN public.transaction_types tt ON c.transaction_type_id = tt.id
WHERE c.deleted_at IS NULL;

COMMENT ON VIEW public.categories_enriched IS 'Categorias com ícones e tipo de transação enriquecidos - SECURITY INVOKER para respeitar RLS';