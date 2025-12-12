-- ============================================
-- MIGRATION 008: Vincular Assets e Transactions
-- Adiciona campo para relacionar ativos com transações de aporte
-- ============================================

-- Adicionar campo relacionado na tabela assets
ALTER TABLE public.assets
ADD COLUMN IF NOT EXISTS related_transaction_id BIGINT REFERENCES public.transactions(id) ON DELETE SET NULL;

-- Adicionar índice para performance
CREATE INDEX IF NOT EXISTS idx_assets_related_transaction
ON public.assets(related_transaction_id)
WHERE related_transaction_id IS NOT NULL;

-- Adicionar comentário
COMMENT ON COLUMN public.assets.related_transaction_id IS 'ID da transação de aporte que criou este ativo';

-- Adicionar campo relacionado na tabela transactions (opcional, para navegação bidirecional)
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS related_asset_id INTEGER REFERENCES public.assets(id) ON DELETE SET NULL;

-- Adicionar índice para performance
CREATE INDEX IF NOT EXISTS idx_transactions_related_asset
ON public.transactions(related_asset_id)
WHERE related_asset_id IS NOT NULL;

-- Adicionar comentário
COMMENT ON COLUMN public.transactions.related_asset_id IS 'ID do ativo relacionado (para transações de aporte)';
