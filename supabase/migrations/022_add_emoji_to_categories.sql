-- ============================================
-- MIGRATION 022: ADD EMOJI TO CATEGORIES
-- Adiciona suporte a emojis nas categorias
-- ============================================

-- Adicionar coluna emoji na tabela categories
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS emoji VARCHAR(10);

COMMENT ON COLUMN public.categories.emoji IS 'Emoji representando a categoria (ex: 🏠, 💰, 🚗)';

-- Atualizar a view categories_enriched para incluir emoji
CREATE OR REPLACE VIEW public.categories_enriched AS
SELECT
  c.id,
  c.user_id,
  c.name,
  c.color,
  c.emoji,
  c.icon_id,
  i.name AS icon_name,
  c.transaction_type_id,
  tt.name AS transaction_type_name,
  tt.internal_name AS transaction_type_internal_name,
  c.created_at,
  c.deleted_at
FROM public.categories c
LEFT JOIN public.icons i ON c.icon_id = i.id
LEFT JOIN public.transaction_types tt ON c.transaction_type_id = tt.id
WHERE c.deleted_at IS NULL;

-- Garantir que a view mantenha as permissões corretas
GRANT SELECT ON public.categories_enriched TO authenticated;