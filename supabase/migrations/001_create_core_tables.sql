-- ============================================
-- MIGRATION 001: CORE TABLES
-- Tabelas fundamentais: users e icons
-- ============================================

-- ============================================
-- TABELA: users
-- Usuários do sistema (extensão de auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'BRL',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT users_currency_check CHECK (currency ~ '^[A-Z]{3}$')
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON public.users(deleted_at) WHERE deleted_at IS NOT NULL;

-- Comentários
COMMENT ON TABLE public.users IS 'Usuários do sistema financeiro (extensão de auth.users)';
COMMENT ON COLUMN public.users.currency IS 'Moeda padrão do usuário (ISO 4217: BRL, USD, EUR)';
COMMENT ON COLUMN public.users.id IS 'Referencia auth.users(id) - criado automaticamente no signup';

-- ============================================
-- TABELA: icons
-- Ícones disponíveis (Lucide React)
-- ============================================
CREATE TABLE IF NOT EXISTS public.icons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT icons_name_check CHECK (name ~ '^[A-Za-z0-9]+$')
);

-- Índices
CREATE UNIQUE INDEX IF NOT EXISTS idx_icons_name ON public.icons(name);

-- Comentários
COMMENT ON TABLE public.icons IS 'Ícones do Lucide React disponíveis para uso';
COMMENT ON COLUMN public.icons.name IS 'Nome do componente do Lucide React (ex: Wallet, DollarSign)';
