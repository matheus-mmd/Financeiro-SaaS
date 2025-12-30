-- ============================================
-- MIGRATION 018: Corrigir exibição de ativos
-- Garantir que apenas ativos com categorias do tipo INVESTMENT sejam exibidos
-- ============================================

-- Recriar a view assets_enriched filtrando apenas categorias de tipo INVESTMENT (id = 3)
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
WHERE a.deleted_at IS NULL
  AND c.transaction_type_id = 3;  -- Apenas categorias do tipo INVESTMENT

COMMENT ON VIEW public.assets_enriched IS 'Ativos com dados de categoria e ganho/perda calculados automaticamente - Filtra apenas categorias INVESTMENT - SECURITY INVOKER para respeitar RLS';