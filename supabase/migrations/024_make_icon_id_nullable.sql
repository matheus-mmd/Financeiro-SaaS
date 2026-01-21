-- ============================================
-- MIGRATION 024: TORNAR icon_id NULLABLE EM CATEGORIES
-- Permite criar categorias apenas com emoji, sem icon_id
-- ============================================

-- Remover constraint NOT NULL do icon_id
ALTER TABLE public.categories
ALTER COLUMN icon_id DROP NOT NULL;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.categories.icon_id IS 'ID do ícone (opcional se emoji for fornecido)';
COMMENT ON COLUMN public.categories.emoji IS 'Emoji da categoria (alternativa ao icon_id)';