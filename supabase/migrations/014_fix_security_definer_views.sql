-- ============================================
-- MIGRATION 014: FIX SECURITY DEFINER VIEWS
-- Altera views de SECURITY DEFINER para SECURITY INVOKER
-- para respeitar as políticas RLS do usuário que executa a query
-- ============================================

-- Fix: transactions_enriched
ALTER VIEW public.transactions_enriched SET (security_invoker = true);

-- Fix: assets_enriched
ALTER VIEW public.assets_enriched SET (security_invoker = true);

-- Fix: targets_enriched
ALTER VIEW public.targets_enriched SET (security_invoker = true);

-- Fix: banks_enriched
ALTER VIEW public.banks_enriched SET (security_invoker = true);

-- Fix: cards_enriched
ALTER VIEW public.cards_enriched SET (security_invoker = true);

-- Fix: categories_enriched
ALTER VIEW public.categories_enriched SET (security_invoker = true);

COMMENT ON VIEW public.transactions_enriched IS 'Transações com todos os dados relacionados (categorias, ícones, tipos, etc) para performance - SECURITY INVOKER para respeitar RLS';
COMMENT ON VIEW public.assets_enriched IS 'Ativos com dados de categoria e ganho/perda calculados automaticamente - SECURITY INVOKER para respeitar RLS';
COMMENT ON VIEW public.targets_enriched IS 'Metas com progresso, dias restantes e dados de categoria calculados - SECURITY INVOKER para respeitar RLS';
COMMENT ON VIEW public.banks_enriched IS 'Bancos com ícones e tipo de conta enriquecidos - SECURITY INVOKER para respeitar RLS';
COMMENT ON VIEW public.cards_enriched IS 'Cartões com ícones, tipo, bandeira e banco enriquecidos - SECURITY INVOKER para respeitar RLS';
COMMENT ON VIEW public.categories_enriched IS 'Categorias com ícones e tipo de transação enriquecidos - SECURITY INVOKER para respeitar RLS';