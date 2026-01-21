-- ============================================
-- MIGRATION 025: ORÇAMENTO POR CATEGORIA
-- Permite definir limites mensais de gastos por categoria
-- ============================================

-- ============================================
-- 1. TABELA: category_budgets
-- ============================================
CREATE TABLE IF NOT EXISTS public.category_budgets (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  limit_amount DECIMAL(12, 2) NOT NULL CHECK (limit_amount > 0),
  alert_percentage INTEGER DEFAULT 80 CHECK (alert_percentage >= 0 AND alert_percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: apenas um orçamento por categoria/mês/ano
  CONSTRAINT category_budgets_unique_per_month UNIQUE (user_id, category_id, year, month)
);

-- ============================================
-- 2. ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_category_budgets_user_id ON public.category_budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_category_budgets_category_id ON public.category_budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_category_budgets_period ON public.category_budgets(user_id, year, month);

-- ============================================
-- 3. TRIGGER: Atualizar updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_category_budgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_category_budgets_updated_at ON public.category_budgets;
CREATE TRIGGER trigger_category_budgets_updated_at
  BEFORE UPDATE ON public.category_budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_category_budgets_updated_at();

-- ============================================
-- 4. RLS (Row Level Security)
-- ============================================
ALTER TABLE public.category_budgets ENABLE ROW LEVEL SECURITY;

-- Policy: usuários podem ver apenas seus próprios orçamentos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'category_budgets_select_own'
  ) THEN
    CREATE POLICY category_budgets_select_own ON public.category_budgets
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policy: usuários podem inserir apenas seus próprios orçamentos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'category_budgets_insert_own'
  ) THEN
    CREATE POLICY category_budgets_insert_own ON public.category_budgets
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Policy: usuários podem atualizar apenas seus próprios orçamentos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'category_budgets_update_own'
  ) THEN
    CREATE POLICY category_budgets_update_own ON public.category_budgets
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policy: usuários podem deletar apenas seus próprios orçamentos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'category_budgets_delete_own'
  ) THEN
    CREATE POLICY category_budgets_delete_own ON public.category_budgets
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- 5. VIEW: Orçamentos com informações da categoria e gastos
-- ============================================
CREATE OR REPLACE VIEW public.category_budgets_with_spending AS
SELECT
  cb.id,
  cb.user_id,
  cb.category_id,
  cb.year,
  cb.month,
  cb.limit_amount,
  cb.alert_percentage,
  cb.created_at,
  cb.updated_at,
  c.name as category_name,
  c.emoji as category_emoji,
  c.color as category_color,
  COALESCE(
    (
      SELECT SUM(ABS(t.amount))
      FROM public.transactions t
      WHERE t.category_id = cb.category_id
        AND t.user_id = cb.user_id
        AND EXTRACT(YEAR FROM t.date) = cb.year
        AND EXTRACT(MONTH FROM t.date) = cb.month
        AND t.transaction_type_id = 2 -- Apenas despesas
        AND t.deleted_at IS NULL
    ),
    0
  ) as spent_amount
FROM public.category_budgets cb
JOIN public.categories c ON c.id = cb.category_id;

-- ============================================
-- 6. COMENTÁRIOS
-- ============================================
COMMENT ON TABLE public.category_budgets IS 'Orçamentos mensais por categoria';
COMMENT ON COLUMN public.category_budgets.limit_amount IS 'Limite de gasto mensal para a categoria';
COMMENT ON COLUMN public.category_budgets.alert_percentage IS 'Percentual para disparo de alerta (ex: 80 = alerta quando atingir 80%)';