# Guia de Migração para Supabase

## Status da Migração

✅ **Concluído:**
1. Instalação de dependências do Supabase (@supabase/supabase-js, dotenv)
2. Configuração do cliente Supabase (`src/lib/supabase.js`)
3. Arquivo `.env.local` com credenciais já configurado
4. Script de migração de dados (`scripts/migrate-to-supabase.js`)
5. AuthContext atualizado para usar Supabase Auth
6. Nova camada de API com Supabase (`src/utils/supabaseApi.js`)
7. Utils atualizados para usar Supabase API

⏳ **Próximos Passos:**
1. Executar schema SQL no Supabase
2. Executar script de migração de dados
3. Testar a integração completa

---

## Como Completar a Migração

### Passo 1: Executar o Schema SQL no Supabase

1. Acesse o [Supabase Dashboard](https://app.supabase.com/)
2. Selecione seu projeto (URL: `qpdhocmwoiyfzchehtyv.supabase.co`)
3. Vá em **SQL Editor** (ícone de banco de dados na barra lateral)
4. Clique em **New Query**
5. Copie e cole o SQL abaixo no editor
6. Clique em **Run** ou pressione `Ctrl+Enter`

```sql
-- =====================================================
-- SCHEMA COMPLETO PARA FINANCEIRO SAAS - SUPABASE
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABELA: icons
-- =====================================================
CREATE TABLE IF NOT EXISTS icons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABELA: transaction_types
-- =====================================================
CREATE TABLE IF NOT EXISTS transaction_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  internal_name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TABELA: users
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. TABELA: categories
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  internal_name VARCHAR(100),
  icon_id INTEGER REFERENCES icons(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT unique_category_name_per_user UNIQUE NULLS NOT DISTINCT (name, user_id)
);

-- =====================================================
-- 5. TABELA: banks (Contas Bancárias)
-- =====================================================
CREATE TABLE IF NOT EXISTS banks (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  initial_balance DECIMAL(15, 2) DEFAULT 0,
  current_balance DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 6. TABELA: cards (Cartões de Crédito)
-- =====================================================
CREATE TABLE IF NOT EXISTS cards (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  "limit" DECIMAL(15, 2) DEFAULT 0,
  due_day INTEGER CHECK (due_day BETWEEN 1 AND 31),
  closing_day INTEGER CHECK (closing_day BETWEEN 1 AND 31),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 7. TABELA: transactions (Transações - Receitas/Despesas/Investimentos)
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  transaction_type_id INTEGER NOT NULL REFERENCES transaction_types(id),
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_date DATE,
  card_id INTEGER REFERENCES cards(id) ON DELETE SET NULL,
  bank_id INTEGER REFERENCES banks(id) ON DELETE SET NULL,
  installment_current INTEGER,
  installment_total INTEGER,
  installment_group_id VARCHAR(100),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_frequency VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 8. TABELA: assets (Patrimônio/Ativos)
-- =====================================================
CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  value DECIMAL(15, 2) NOT NULL,
  purchase_date DATE,
  purchase_value DECIMAL(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 9. TABELA: targets (Metas Financeiras)
-- =====================================================
CREATE TABLE IF NOT EXISTS targets (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  goal DECIMAL(15, 2) NOT NULL,
  progress DECIMAL(15, 2) DEFAULT 0,
  deadline DATE,
  monthly_target DECIMAL(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- TRIGGERS: Atualizar updated_at automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_icons_updated_at BEFORE UPDATE ON icons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transaction_types_updated_at BEFORE UPDATE ON transaction_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banks_updated_at BEFORE UPDATE ON banks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_targets_updated_at BEFORE UPDATE ON targets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ÍNDICES para Melhorar Performance
-- =====================================================
CREATE INDEX idx_transactions_user_id ON transactions(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_date ON transactions(date) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_category_id ON transactions(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_type_id ON transactions(transaction_type_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_categories_user_id ON categories(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_banks_user_id ON banks(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_cards_user_id ON cards(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_user_id ON assets(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_targets_user_id ON targets(user_id) WHERE deleted_at IS NULL;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Habilitar RLS em todas as tabelas de usuário
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para categories
CREATE POLICY "Users can view all categories" ON categories
  FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can create own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para banks
CREATE POLICY "Users can view own banks" ON banks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own banks" ON banks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own banks" ON banks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own banks" ON banks
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para cards
CREATE POLICY "Users can view own cards" ON cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cards" ON cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards" ON cards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards" ON cards
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para assets
CREATE POLICY "Users can view own assets" ON assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assets" ON assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets" ON assets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets" ON assets
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para targets
CREATE POLICY "Users can view own targets" ON targets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own targets" ON targets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own targets" ON targets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own targets" ON targets
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- DADOS INICIAIS (SEED)
-- =====================================================

-- Inserir ícones padrão
INSERT INTO icons (id, name) VALUES
  (1, 'DollarSign'),
  (2, 'Home'),
  (3, 'Car'),
  (4, 'ShoppingCart'),
  (5, 'Coffee'),
  (6, 'Utensils'),
  (7, 'Shirt'),
  (8, 'Smartphone'),
  (9, 'Heart'),
  (10, 'GraduationCap'),
  (11, 'Plane'),
  (12, 'Gift'),
  (13, 'Gamepad'),
  (14, 'Book'),
  (15, 'Music'),
  (16, 'Film'),
  (17, 'Camera'),
  (18, 'Dumbbell'),
  (19, 'Briefcase'),
  (20, 'Wallet'),
  (21, 'CreditCard'),
  (22, 'PiggyBank'),
  (23, 'TrendingUp'),
  (24, 'Target'),
  (25, 'Award'),
  (26, 'Tag')
ON CONFLICT (id) DO NOTHING;

-- Inserir tipos de transação
INSERT INTO transaction_types (id, name, internal_name) VALUES
  (1, 'Receita', 'income'),
  (2, 'Despesa', 'expense'),
  (3, 'Investimento', 'investment')
ON CONFLICT (internal_name) DO NOTHING;

-- Inserir categorias padrão
INSERT INTO categories (id, name, internal_name, icon_id, user_id) VALUES
  (1, 'Salário', 'salary', 1, NULL),
  (2, 'Freelance', 'freelance', 19, NULL),
  (3, 'Vendas', 'sales', 20, NULL),
  (4, 'Investimentos', 'investments', 23, NULL),
  (5, 'Moradia', 'housing', 2, NULL),
  (6, 'Transporte', 'transport', 3, NULL),
  (7, 'Alimentação', 'food', 6, NULL),
  (8, 'Saúde', 'health', 9, NULL),
  (9, 'Educação', 'education', 10, NULL),
  (10, 'Lazer', 'entertainment', 13, NULL),
  (11, 'Roupas', 'clothing', 7, NULL),
  (12, 'Tecnologia', 'technology', 8, NULL),
  (13, 'Outros', 'other', 26, NULL)
ON CONFLICT DO NOTHING;

-- Resetar sequências
SELECT setval('icons_id_seq', (SELECT MAX(id) FROM icons));
SELECT setval('transaction_types_id_seq', (SELECT MAX(id) FROM transaction_types));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
```

**Verificação:** Após executar, você deverá ver a mensagem "Success. No rows returned" e as tabelas criadas aparecerão na aba **Table Editor**.

---

### Passo 2: Executar o Script de Migração de Dados

Agora vamos migrar todos os dados do `mockData.json` para o Supabase:

1. Abra um terminal na raiz do projeto
2. Execute o comando:

```bash
node scripts/migrate-to-supabase.js
```

**Saída Esperada:**
```
🚀 Iniciando migração de dados para Supabase...

📍 Supabase URL: https://qpdhocmwoiyfzchehtyv.supabase.co
🔑 Anon Key: eyJhbGciOiJIUzI1NiIs...

📖 Carregando mockData.json...
✅ mockData.json carregado com sucesso

📦 Migrando ícones...
✅ 26 ícones migrados com sucesso

📦 Migrando tipos de transação...
✅ 3 tipos de transação migrados com sucesso

📦 Migrando usuários...
✅ 1 usuários migrados com sucesso

...

✅ Migração concluída com sucesso!
```

---

### Passo 3: Testar a Integração

1. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

2. Abra o navegador em `http://localhost:3000`

3. **Teste o fluxo de autenticação:**
   - Tente fazer login com as credenciais do usuário migrado
   - O login agora usa Supabase Auth
   - Se necessário, registre um novo usuário

4. **Teste as funcionalidades:**
   - [ ] Dashboard carrega dados do Supabase
   - [ ] Listar transações
   - [ ] Criar nova transação
   - [ ] Editar transação
   - [ ] Deletar transação
   - [ ] Listar receitas
   - [ ] Listar despesas
   - [ ] Gerenciar metas
   - [ ] Gerenciar patrimônio
   - [ ] Gerenciar contas bancárias
   - [ ] Gerenciar cartões

5. **Verificar no Supabase:**
   - Acesse **Table Editor** no Supabase Dashboard
   - Verifique se os dados estão sendo salvos corretamente
   - Veja os logs em **Database > Logs** para depuração

---

## Arquivos Criados/Modificados

### Novos Arquivos:
- `src/lib/supabase.js` - Cliente Supabase configurado
- `src/utils/supabaseApi.js` - Camada de API com Supabase
- `scripts/migrate-to-supabase.js` - Script de migração de dados
- `MIGRATION_GUIDE.md` - Este guia

### Arquivos Modificados:
- `src/contexts/AuthContext.jsx` - Agora usa Supabase Auth
- `src/utils/index.js` - Exporta supabaseApi em vez de mockApi
- `.env.local` - Já contém as credenciais do Supabase

### Arquivos Não Modificados (mantidos para fallback):
- `src/utils/mockApi.js` - Pode ser usado para testes

---

## Alternando Entre Mock e Supabase

Se você quiser voltar a usar a API mock temporariamente:

1. Abra `src/utils/index.js`
2. Comente a linha do Supabase:
   ```js
   // export * from "./supabaseApi";
   ```
3. Descomente a linha do Mock:
   ```js
   export * from "./mockApi";
   ```

---

## Troubleshooting

### Erro: "Variáveis de ambiente do Supabase não configuradas"
- Verifique se o arquivo `.env.local` existe na raiz do projeto
- Confirme que contém `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Reinicie o servidor de desenvolvimento

### Erro: "Erro ao buscar dados" / "Row Level Security"
- Certifique-se de estar autenticado (faça login)
- Verifique se as políticas RLS foram criadas corretamente
- Veja os logs no Supabase Dashboard

### Erro: "Cannot read properties of null"
- Pode acontecer se não houver usuário autenticado
- Faça login novamente
- Verifique o console do navegador para mais detalhes

### Migração falhou parcialmente
- Execute o script de migração novamente
- O script usa `upsert` para evitar duplicação
- Verifique os logs no terminal para ver qual entidade falhou

---

## Próximas Melhorias (Opcional)

Após a migração básica funcionar, você pode implementar:

1. **Realtime Subscriptions:** Atualizar dados em tempo real
2. **Storage:** Upload de arquivos (comprovantes, etc.)
3. **Edge Functions:** Lógica de negócio serverless
4. **Backup Automático:** Configurar backups no Supabase
5. **Analytics:** Implementar rastreamento de uso

---

## Suporte

Se encontrar problemas:

1. Verifique os logs no console do navegador (F12)
2. Verifique os logs no terminal do Next.js
3. Verifique os logs no Supabase Dashboard > Database > Logs
4. Consulte a [documentação do Supabase](https://supabase.com/docs)

---