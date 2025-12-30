-- ============================================
-- MIGRATION 002: ENUM TABLES
-- Tabelas de enumeração normalizadas
-- ============================================

-- ============================================
-- TABELA: transaction_types
-- ============================================
CREATE TABLE IF NOT EXISTS public.transaction_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  internal_name VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(7) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT transaction_types_internal_name_check CHECK (internal_name IN ('income', 'expense', 'investment')),
  CONSTRAINT transaction_types_color_check CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_transaction_types_internal_name ON public.transaction_types(internal_name);
COMMENT ON TABLE public.transaction_types IS 'Tipos de transação do sistema (Receita, Despesa, Patrimônio)';

-- ============================================
-- TABELA: payment_statuses
-- ============================================
CREATE TABLE IF NOT EXISTS public.payment_statuses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  internal_name VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(7) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT payment_statuses_internal_name_check CHECK (internal_name IN ('pending', 'paid', 'overdue', 'cancelled')),
  CONSTRAINT payment_statuses_color_check CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

COMMENT ON TABLE public.payment_statuses IS 'Status de pagamento das transações';

-- ============================================
-- TABELA: payment_methods
-- ============================================
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  requires_card BOOLEAN NOT NULL DEFAULT false,
  requires_bank BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.payment_methods IS 'Formas de pagamento disponíveis no sistema';

-- ============================================
-- TABELA: recurrence_frequencies
-- ============================================
CREATE TABLE IF NOT EXISTS public.recurrence_frequencies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  internal_name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT recurrence_frequencies_internal_name_check CHECK (internal_name IN ('daily', 'weekly', 'monthly', 'yearly'))
);

COMMENT ON TABLE public.recurrence_frequencies IS 'Frequências de recorrência de transações';

-- ============================================
-- TABELA: account_types
-- ============================================
CREATE TABLE IF NOT EXISTS public.account_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  internal_name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT account_types_internal_name_check CHECK (internal_name IN ('corrente', 'poupanca', 'pagamento', 'investimento'))
);

COMMENT ON TABLE public.account_types IS 'Tipos de conta bancária';

-- ============================================
-- TABELA: card_types
-- ============================================
CREATE TABLE IF NOT EXISTS public.card_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  internal_name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT card_types_internal_name_check CHECK (internal_name IN ('credito', 'debito', 'multiplo'))
);

COMMENT ON TABLE public.card_types IS 'Tipos de cartão (crédito, débito, múltiplo)';

-- ============================================
-- TABELA: card_brands
-- ============================================
CREATE TABLE IF NOT EXISTS public.card_brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  icon_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.card_brands IS 'Bandeiras de cartão (Visa, Mastercard, Elo, etc)';