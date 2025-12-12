-- ============================================
-- MIGRATION 003: MAIN TABLES
-- Tabelas principais do sistema
-- ============================================

-- ============================================
-- TABELA: categories
-- ============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,
  icon_id INTEGER NOT NULL REFERENCES public.icons(id) ON DELETE RESTRICT,
  transaction_type_id INTEGER NOT NULL REFERENCES public.transaction_types(id) ON DELETE RESTRICT,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- NULL = categoria do sistema
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT categories_color_check CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT categories_unique_name_per_user UNIQUE (name, transaction_type_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_categories_transaction_type ON public.categories(transaction_type_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_categories_deleted_at ON public.categories(deleted_at) WHERE deleted_at IS NOT NULL;

COMMENT ON TABLE public.categories IS 'Categorias de transações e ativos (podem ser do sistema ou customizadas por usuário)';
COMMENT ON COLUMN public.categories.user_id IS 'NULL = categoria padrão do sistema, UUID = categoria customizada do usuário';

-- ============================================
-- TABELA: banks
-- ============================================
CREATE TABLE IF NOT EXISTS public.banks (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon_id INTEGER NOT NULL REFERENCES public.icons(id) ON DELETE RESTRICT,
  color VARCHAR(7) NOT NULL,
  agency VARCHAR(20),
  account VARCHAR(50),
  account_type_id INTEGER NOT NULL REFERENCES public.account_types(id) ON DELETE RESTRICT,
  initial_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  current_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT banks_color_check CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT banks_name_check CHECK (LENGTH(TRIM(name)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_banks_user_id ON public.banks(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_banks_deleted_at ON public.banks(deleted_at) WHERE deleted_at IS NOT NULL;

COMMENT ON TABLE public.banks IS 'Contas bancárias do usuário';
COMMENT ON COLUMN public.banks.current_balance IS 'Saldo atual (pode ser desnormalizado para performance)';

-- ============================================
-- TABELA: cards
-- ============================================
CREATE TABLE IF NOT EXISTS public.cards (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon_id INTEGER NOT NULL REFERENCES public.icons(id) ON DELETE RESTRICT,
  color VARCHAR(7) NOT NULL,
  card_type_id INTEGER NOT NULL REFERENCES public.card_types(id) ON DELETE RESTRICT,
  card_brand_id INTEGER NOT NULL REFERENCES public.card_brands(id) ON DELETE RESTRICT,
  bank_id INTEGER REFERENCES public.banks(id) ON DELETE SET NULL,
  credit_limit NUMERIC(15, 2),
  closing_day INTEGER,
  due_day INTEGER,
  current_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT cards_color_check CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT cards_closing_day_check CHECK (closing_day IS NULL OR (closing_day >= 1 AND closing_day <= 31)),
  CONSTRAINT cards_due_day_check CHECK (due_day IS NULL OR (due_day >= 1 AND due_day <= 31)),
  CONSTRAINT cards_credit_limit_positive CHECK (credit_limit IS NULL OR credit_limit >= 0),
  CONSTRAINT cards_name_check CHECK (LENGTH(TRIM(name)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_cards_user_id ON public.cards(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cards_bank_id ON public.cards(bank_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cards_deleted_at ON public.cards(deleted_at) WHERE deleted_at IS NOT NULL;

COMMENT ON TABLE public.cards IS 'Cartões de crédito e débito do usuário';
COMMENT ON COLUMN public.cards.current_balance IS 'Saldo utilizado no cartão de crédito';

-- ============================================
-- TABELA: transactions
-- ============================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  transaction_type_id INTEGER NOT NULL REFERENCES public.transaction_types(id) ON DELETE RESTRICT,
  payment_status_id INTEGER NOT NULL REFERENCES public.payment_statuses(id) ON DELETE RESTRICT,
  payment_method_id INTEGER REFERENCES public.payment_methods(id) ON DELETE RESTRICT,
  bank_id INTEGER REFERENCES public.banks(id) ON DELETE SET NULL,
  card_id INTEGER REFERENCES public.cards(id) ON DELETE SET NULL,

  -- Dados principais
  description VARCHAR(255) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  notes TEXT,

  -- Datas
  transaction_date DATE NOT NULL,
  payment_date DATE,

  -- Parcelamento
  installment_number INTEGER,
  installment_total INTEGER,
  installment_group_id UUID,

  -- Recorrência
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_frequency_id INTEGER REFERENCES public.recurrence_frequencies(id) ON DELETE SET NULL,
  recurrence_end_date DATE,
  recurrence_parent_id BIGINT REFERENCES public.transactions(id) ON DELETE SET NULL,

  -- Audit trail
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT transactions_amount_not_zero CHECK (amount != 0),
  CONSTRAINT transactions_installment_number_check CHECK (installment_number IS NULL OR installment_number >= 1),
  CONSTRAINT transactions_installment_total_check CHECK (installment_total IS NULL OR installment_total >= 1),
  CONSTRAINT transactions_installment_consistency CHECK (
    (installment_number IS NULL AND installment_total IS NULL) OR
    (installment_number IS NOT NULL AND installment_total IS NOT NULL AND installment_number <= installment_total)
  ),
  CONSTRAINT transactions_recurrence_consistency CHECK (
    (is_recurring = false AND recurrence_frequency_id IS NULL) OR
    (is_recurring = true AND recurrence_frequency_id IS NOT NULL)
  ),
  CONSTRAINT transactions_description_check CHECK (LENGTH(TRIM(description)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_type_id ON public.transactions(transaction_type_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_date ON public.transactions(transaction_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_payment_date ON public.transactions(payment_date) WHERE deleted_at IS NULL AND payment_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_installment_group ON public.transactions(installment_group_id) WHERE deleted_at IS NULL AND installment_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_recurrence_parent ON public.transactions(recurrence_parent_id) WHERE deleted_at IS NULL AND recurrence_parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_deleted_at ON public.transactions(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.transactions IS 'Transações financeiras do usuário (receitas, despesas, aportes)';
COMMENT ON COLUMN public.transactions.amount IS 'Valor da transação: negativo para despesa, positivo para receita/aporte';

-- ============================================
-- TABELA: assets
-- ============================================
CREATE TABLE IF NOT EXISTS public.assets (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,

  -- Dados principais
  name VARCHAR(255) NOT NULL,
  description TEXT,
  value NUMERIC(15, 2) NOT NULL,
  yield_rate NUMERIC(8, 6),
  currency CHAR(3) NOT NULL DEFAULT 'BRL',

  -- Datas
  valuation_date DATE NOT NULL,
  purchase_date DATE,
  purchase_value NUMERIC(15, 2),

  -- Audit trail
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT assets_value_positive CHECK (value >= 0),
  CONSTRAINT assets_purchase_value_positive CHECK (purchase_value IS NULL OR purchase_value >= 0),
  CONSTRAINT assets_name_check CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT assets_currency_check CHECK (currency ~ '^[A-Z]{3}$')
);

CREATE INDEX IF NOT EXISTS idx_assets_user_id ON public.assets(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_assets_category_id ON public.assets(category_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_assets_deleted_at ON public.assets(deleted_at) WHERE deleted_at IS NOT NULL;

COMMENT ON TABLE public.assets IS 'Patrimônio e ativos do usuário (investimentos, imóveis, etc)';
COMMENT ON COLUMN public.assets.yield_rate IS 'Taxa de rendimento mensal/anual (0.005 = 0.5%)';

-- ============================================
-- TABELA: targets
-- ============================================
CREATE TABLE IF NOT EXISTS public.targets (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL,

  -- Dados principais
  title VARCHAR(255) NOT NULL,
  description TEXT,
  goal_amount NUMERIC(15, 2) NOT NULL,
  current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  monthly_target NUMERIC(15, 2),

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress',

  -- Datas
  start_date DATE NOT NULL,
  deadline DATE,
  completed_at TIMESTAMPTZ,

  -- Audit trail
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT targets_goal_amount_positive CHECK (goal_amount > 0),
  CONSTRAINT targets_current_amount_positive CHECK (current_amount >= 0),
  CONSTRAINT targets_monthly_target_positive CHECK (monthly_target IS NULL OR monthly_target >= 0),
  CONSTRAINT targets_status_check CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  CONSTRAINT targets_title_check CHECK (LENGTH(TRIM(title)) > 0),
  CONSTRAINT targets_deadline_check CHECK (deadline IS NULL OR deadline >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_targets_user_id ON public.targets(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_targets_status ON public.targets(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_targets_deadline ON public.targets(deadline) WHERE deleted_at IS NULL AND deadline IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_targets_deleted_at ON public.targets(deleted_at) WHERE deleted_at IS NOT NULL;

COMMENT ON TABLE public.targets IS 'Metas financeiras do usuário';
COMMENT ON COLUMN public.targets.current_amount IS 'Valor atual acumulado para a meta (progress)';
