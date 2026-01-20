-- ============================================
-- MIGRATION 021: USER SETUP TABLES
-- Tabelas para o fluxo de configuração inicial
-- ============================================

-- ============================================
-- ALTERAR TABELA: users
-- Adicionar campos de configuração
-- ============================================
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS work_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS setup_completed_at TIMESTAMPTZ;

-- Constraints para os novos campos
ALTER TABLE public.users
ADD CONSTRAINT users_work_type_check CHECK (work_type IS NULL OR work_type IN ('clt', 'autonomo')),
ADD CONSTRAINT users_account_type_check CHECK (account_type IN ('individual', 'conjunta'));

-- Comentários
COMMENT ON COLUMN public.users.work_type IS 'Tipo de trabalho: clt (carteira assinada) ou autonomo (conta própria)';
COMMENT ON COLUMN public.users.account_type IS 'Tipo de conta: individual (só para mim) ou conjunta (com outras pessoas)';
COMMENT ON COLUMN public.users.setup_completed IS 'Indica se o usuário completou o setup inicial';
COMMENT ON COLUMN public.users.setup_completed_at IS 'Data/hora em que o setup foi completado';

-- ============================================
-- TABELA: account_members
-- Integrantes da conta conjunta
-- ============================================
CREATE TABLE IF NOT EXISTS public.account_members (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  work_type VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT account_members_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT account_members_work_type_check CHECK (work_type IS NULL OR work_type IN ('clt', 'autonomo')),
  CONSTRAINT account_members_unique_email_per_user UNIQUE (user_id, email)
);

CREATE INDEX IF NOT EXISTS idx_account_members_user_id ON public.account_members(user_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.account_members IS 'Integrantes da conta conjunta do usuário';
COMMENT ON COLUMN public.account_members.email IS 'Email do integrante (usado para identificação e lembretes)';
COMMENT ON COLUMN public.account_members.phone IS 'Telefone/WhatsApp do integrante para lembretes';
COMMENT ON COLUMN public.account_members.work_type IS 'Tipo de trabalho do integrante: clt ou autonomo';

-- ============================================
-- TABELA: user_incomes
-- Fontes de renda do usuário e integrantes
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_incomes (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  member_id INTEGER REFERENCES public.account_members(id) ON DELETE CASCADE,
  description VARCHAR(255) DEFAULT 'Renda principal',
  amount_cents INTEGER NOT NULL,
  payment_day INTEGER NOT NULL,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT user_incomes_amount_positive CHECK (amount_cents > 0),
  CONSTRAINT user_incomes_payment_day_check CHECK (payment_day >= 1 AND payment_day <= 31)
);

CREATE INDEX IF NOT EXISTS idx_user_incomes_user_id ON public.user_incomes(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_incomes_member_id ON public.user_incomes(member_id) WHERE deleted_at IS NULL AND member_id IS NOT NULL;

COMMENT ON TABLE public.user_incomes IS 'Fontes de renda do usuário e seus integrantes de conta conjunta';
COMMENT ON COLUMN public.user_incomes.member_id IS 'NULL = renda do próprio usuário, INTEGER = renda de um integrante';
COMMENT ON COLUMN public.user_incomes.amount_cents IS 'Valor líquido em centavos';
COMMENT ON COLUMN public.user_incomes.payment_day IS 'Dia do mês em que recebe (1-31)';

-- ============================================
-- TABELA: user_fixed_expenses
-- Despesas fixas do usuário (moradia, serviços básicos)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_fixed_expenses (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  member_id INTEGER REFERENCES public.account_members(id) ON DELETE SET NULL,
  expense_type VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount_cents INTEGER NOT NULL,
  due_day INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT user_fixed_expenses_amount_positive CHECK (amount_cents > 0),
  CONSTRAINT user_fixed_expenses_due_day_check CHECK (due_day >= 1 AND due_day <= 31),
  CONSTRAINT user_fixed_expenses_category_check CHECK (category IN ('moradia', 'servicos_basicos'))
);

CREATE INDEX IF NOT EXISTS idx_user_fixed_expenses_user_id ON public.user_fixed_expenses(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_fixed_expenses_member_id ON public.user_fixed_expenses(member_id) WHERE deleted_at IS NULL AND member_id IS NOT NULL;

COMMENT ON TABLE public.user_fixed_expenses IS 'Despesas fixas mensais do usuário (moradia, condomínio, energia, água, gás)';
COMMENT ON COLUMN public.user_fixed_expenses.member_id IS 'NULL = despesa do titular, INTEGER = despesa de um integrante';
COMMENT ON COLUMN public.user_fixed_expenses.expense_type IS 'Tipo específico: aluguel, financiamento, condominio, energia, agua, gas';
COMMENT ON COLUMN public.user_fixed_expenses.category IS 'Categoria: moradia ou servicos_basicos';
COMMENT ON COLUMN public.user_fixed_expenses.amount_cents IS 'Valor em centavos';
COMMENT ON COLUMN public.user_fixed_expenses.due_day IS 'Dia do vencimento (1-31)';

-- ============================================
-- RLS POLICIES
-- ============================================

-- Habilitar RLS
ALTER TABLE public.account_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_incomes ENABLE ROW LEVEL SECURITY;

-- Policies para account_members
CREATE POLICY "Users can view own account members" ON public.account_members
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own account members" ON public.account_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own account members" ON public.account_members
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own account members" ON public.account_members
  FOR DELETE USING (auth.uid() = user_id);

-- Policies para user_incomes
CREATE POLICY "Users can view own incomes" ON public.user_incomes
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own incomes" ON public.user_incomes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own incomes" ON public.user_incomes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own incomes" ON public.user_incomes
  FOR DELETE USING (auth.uid() = user_id);

-- Habilitar RLS para user_fixed_expenses
ALTER TABLE public.user_fixed_expenses ENABLE ROW LEVEL SECURITY;

-- Policies para user_fixed_expenses
CREATE POLICY "Users can view own fixed expenses" ON public.user_fixed_expenses
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own fixed expenses" ON public.user_fixed_expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fixed expenses" ON public.user_fixed_expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fixed expenses" ON public.user_fixed_expenses
  FOR DELETE USING (auth.uid() = user_id);