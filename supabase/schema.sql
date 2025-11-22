-- =====================================================
-- SCHEMA SUPABASE - FINANCEIRO SAAS
-- =====================================================
-- Este arquivo contém a estrutura completa do banco de dados
-- baseado nos dados mock do arquivo mockData.json
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELAS DE TIPOS/CATEGORIAS (Lookup Tables)
-- =====================================================

-- Categorias de despesas
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL, -- Formato hex: #RRGGBB
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tipos de ativos
CREATE TABLE asset_types (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL, -- Formato hex: #RRGGBB
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tipos de transações
CREATE TABLE transaction_types (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL, -- Formato hex: #RRGGBB
  internal_name VARCHAR(50) NOT NULL, -- credit, debit, investment
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_internal_name UNIQUE (internal_name)
);

-- =====================================================
-- TABELA DE USUÁRIOS (PERFIL ESTENDIDO)
-- =====================================================
-- A autenticação é gerenciada pelo Supabase Auth (tabela auth.users)
-- Esta tabela armazena informações adicionais do perfil do usuário

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL', -- ISO 4217 currency code
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Despesas
CREATE TABLE expenses (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  categories_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount >= 0),
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ativos/Patrimônio
CREATE TABLE assets (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_types_id BIGINT NOT NULL REFERENCES asset_types(id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  value DECIMAL(15, 2) NOT NULL CHECK (value >= 0),
  yield DECIMAL(10, 6) DEFAULT 0, -- Rendimento em decimal (0.005 = 0.5%)
  currency VARCHAR(3) DEFAULT 'BRL', -- ISO 4217 currency code
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Metas financeiras
CREATE TABLE targets (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  goal DECIMAL(15, 2) NOT NULL CHECK (goal > 0),
  progress DECIMAL(15, 2) DEFAULT 0 CHECK (progress >= 0),
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  date DATE NOT NULL, -- Data de início ou criação da meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_progress_not_exceeds_goal CHECK (progress <= goal * 1.5) -- Permite 50% a mais
);

-- Transações
CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_types_id BIGINT NOT NULL REFERENCES transaction_types(id) ON DELETE RESTRICT,
  date DATE NOT NULL,
  description VARCHAR(500) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL, -- Positivo para crédito, negativo para débito
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para users
CREATE INDEX idx_users_email ON users(email);

-- Índices para expenses
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_categories_id ON expenses(categories_id);
CREATE INDEX idx_expenses_date ON expenses(date DESC);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date DESC);

-- Índices para assets
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_asset_types_id ON assets(asset_types_id);
CREATE INDEX idx_assets_date ON assets(date DESC);
CREATE INDEX idx_assets_user_date ON assets(user_id, date DESC);

-- Índices para targets
CREATE INDEX idx_targets_user_id ON targets(user_id);
CREATE INDEX idx_targets_status ON targets(status);
CREATE INDEX idx_targets_user_status ON targets(user_id, status);

-- Índices para transactions
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_transaction_types_id ON transactions(transaction_types_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);

-- =====================================================
-- FUNÇÕES DE TRIGGER PARA updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_types_updated_at BEFORE UPDATE ON asset_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transaction_types_updated_at BEFORE UPDATE ON transaction_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_targets_updated_at BEFORE UPDATE ON targets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Habilitar RLS em todas as tabelas principais
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies para users
CREATE POLICY "Usuários podem ver apenas seu próprio perfil"
  ON users FOR SELECT
  USING ((select auth.uid()) = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON users FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON users FOR UPDATE
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Policies para expenses
CREATE POLICY "Usuários podem ver apenas suas próprias despesas"
  ON expenses FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Usuários podem inserir suas próprias despesas"
  ON expenses FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias despesas"
  ON expenses FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Usuários podem deletar suas próprias despesas"
  ON expenses FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Policies para assets
CREATE POLICY "Usuários podem ver apenas seus próprios ativos"
  ON assets FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Usuários podem inserir seus próprios ativos"
  ON assets FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios ativos"
  ON assets FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Usuários podem deletar seus próprios ativos"
  ON assets FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Policies para targets
CREATE POLICY "Usuários podem ver apenas suas próprias metas"
  ON targets FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Usuários podem inserir suas próprias metas"
  ON targets FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias metas"
  ON targets FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Usuários podem deletar suas próprias metas"
  ON targets FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Policies para transactions
CREATE POLICY "Usuários podem ver apenas suas próprias transações"
  ON transactions FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Usuários podem inserir suas próprias transações"
  ON transactions FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias transações"
  ON transactions FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Usuários podem deletar suas próprias transações"
  ON transactions FOR DELETE
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- POLÍTICAS PÚBLICAS PARA TABELAS DE LOOKUP
-- =====================================================
-- Categorias, tipos de ativos e tipos de transações são públicos (read-only)

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ler categorias"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Todos podem ler tipos de ativos"
  ON asset_types FOR SELECT
  USING (true);

CREATE POLICY "Todos podem ler tipos de transações"
  ON transaction_types FOR SELECT
  USING (true);

-- =====================================================
-- VIEWS ÚTEIS (OPCIONAL)
-- =====================================================

-- View de despesas enriquecidas (com nome da categoria)
CREATE OR REPLACE VIEW expenses_enriched
WITH (security_invoker = true)
AS
SELECT
  e.id,
  e.user_id,
  e.categories_id,
  c.name AS category_name,
  c.color AS category_color,
  e.title,
  e.amount,
  e.date,
  e.created_at,
  e.updated_at
FROM expenses e
JOIN categories c ON e.categories_id = c.id;

-- View de ativos enriquecidos (com nome do tipo)
CREATE OR REPLACE VIEW assets_enriched
WITH (security_invoker = true)
AS
SELECT
  a.id,
  a.user_id,
  a.asset_types_id,
  at.name AS type_name,
  at.color AS type_color,
  a.name,
  a.value,
  a.yield,
  a.currency,
  a.date,
  a.created_at,
  a.updated_at
FROM assets a
JOIN asset_types at ON a.asset_types_id = at.id;

-- View de transações enriquecidas (com nome do tipo)
CREATE OR REPLACE VIEW transactions_enriched
WITH (security_invoker = true)
AS
SELECT
  t.id,
  t.user_id,
  t.transaction_types_id,
  tt.name AS type_name,
  tt.color AS type_color,
  tt.internal_name AS type,
  t.date,
  t.description,
  t.amount,
  t.created_at,
  t.updated_at
FROM transactions t
JOIN transaction_types tt ON t.transaction_types_id = tt.id;

-- =====================================================
-- COMENTÁRIOS NAS TABELAS
-- =====================================================

COMMENT ON TABLE users IS 'Perfil estendido do usuário com informações adicionais';
COMMENT ON TABLE categories IS 'Categorias de despesas (Moradia, Transporte, etc)';
COMMENT ON TABLE asset_types IS 'Tipos de ativos (Poupança, CDB, Ações, etc)';
COMMENT ON TABLE transaction_types IS 'Tipos de transações (Crédito, Débito, Aporte)';
COMMENT ON TABLE expenses IS 'Registro de despesas do usuário';
COMMENT ON TABLE assets IS 'Patrimônio e ativos do usuário';
COMMENT ON TABLE targets IS 'Metas financeiras do usuário';
COMMENT ON TABLE transactions IS 'Transações financeiras do usuário';

COMMENT ON COLUMN transaction_types.internal_name IS 'Nome interno usado no código (credit, debit, investment)';
COMMENT ON COLUMN assets.yield IS 'Rendimento em formato decimal (0.005 = 0.5%)';
COMMENT ON COLUMN transactions.amount IS 'Valor positivo para crédito, negativo para débito';

-- =====================================================
-- FUNÇÃO E TRIGGER PARA CRIAR PERFIL DE USUÁRIO
-- =====================================================
-- Cria automaticamente um perfil quando um novo usuário se registra

CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, name, email, currency)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'BRL'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que executa a função quando um novo usuário é criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();
