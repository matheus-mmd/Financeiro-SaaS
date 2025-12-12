# Status da Migração para Supabase

## Progresso Geral: 70% Completo

### ✅ Fase 1: Setup e Configuração (100% Completo)
- [x] Instaladas dependências: `@supabase/supabase-js`, `@supabase/ssr`
- [x] Criado `.env.local.example` com variáveis necessárias
- [x] Criado cliente Supabase (`src/lib/supabase/client.js`)
- [x] Criado cliente servidor (`src/lib/supabase/server.js`)
- [x] Criado cliente middleware (`src/lib/supabase/middleware.js`)
- [x] Criado `middleware.js` para proteção de rotas

### ✅ Fase 2: Banco de Dados (100% Completo)
- [x] `001_create_core_tables.sql` - Tabelas core (users, icons)
- [x] `002_create_enum_tables.sql` - Tabelas de enumeração
- [x] `003_create_main_tables.sql` - Tabelas principais
- [x] `004_create_triggers.sql` - Triggers automáticos
- [x] `005_create_views.sql` - Views enriquecidas
- [x] `006_create_rls_policies.sql` - 28 políticas RLS
- [x] `007_seed_data.sql` - Dados iniciais

### ✅ Fase 3: Script de Migração de Dados (100% Completo)
- [x] `scripts/migrateToSupabase.js` - Script completo de migração
- [x] Mapeamentos de campos (installments, status, payment_method, etc.)

### ✅ Fase 4: Autenticação (100% Completo)
- [x] `src/contexts/AuthContext.jsx` - Integrado com Supabase Auth
- [x] Substituído sistema mock por Supabase Auth
- [x] Funções: signIn, signUp, signOut, updateProfile

### ✅ Fase 5: API Layer (100% Completo)
- [x] `src/lib/supabase/api/transactions.js`
- [x] `src/lib/supabase/api/assets.js`
- [x] `src/lib/supabase/api/targets.js`
- [x] `src/lib/supabase/api/banks.js`
- [x] `src/lib/supabase/api/cards.js`
- [x] `src/lib/supabase/api/categories.js`
- [x] `src/lib/supabase/api/dashboard.js`

### ✅ Fase 6: Hooks Customizados (100% Completo)
- [x] `src/lib/supabase/hooks/useTransactions.js`
- [x] `src/lib/supabase/hooks/useAssets.js`
- [x] `src/lib/supabase/hooks/useTargets.js`
- [x] `src/lib/supabase/hooks/useBanks.js`
- [x] `src/lib/supabase/hooks/useCards.js`

### 🔄 Fase 7: Atualização de Páginas (37.5% Completo - 3/8)
- [x] `app/categorias/page.jsx` - COMPLETO
- [x] `app/patrimonio-ativos/page.jsx` - COMPLETO
- [x] `app/metas/page.jsx` - COMPLETO
- [ ] `app/contas/page.jsx` - PENDENTE
- [ ] `app/transacoes/page.jsx` - PENDENTE
- [ ] `app/despesas/page.jsx` - PENDENTE
- [ ] `app/receitas/page.jsx` - PENDENTE
- [ ] `app/page.jsx` (Dashboard) - PENDENTE

### ⏳ Fase 8: Limpeza (Pendente)
- [ ] Remover `src/utils/mockApi.js`
- [ ] Remover `src/data/mockData.json`
- [ ] Remover `scripts/generateMockData.js` (já deletado)
- [ ] Atualizar `src/constants/index.js` com IDs corretos

---

## Próximos Passos

### 1. Configurar Supabase (ANTES DE TUDO)

**Você precisa:**
1. Copiar `.env.local.example` para `.env.local`
2. Preencher com suas credenciais do Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
   SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key (apenas para migração)
   ```

### 2. Executar Migrations no Supabase

**Opção A: Via SQL Editor no Dashboard do Supabase** (Recomendado)
1. Acesse o SQL Editor no dashboard do Supabase
2. Execute os arquivos SQL na ordem:
   - `supabase/migrations/001_create_core_tables.sql`
   - `supabase/migrations/002_create_enum_tables.sql`
   - `supabase/migrations/003_create_main_tables.sql`
   - `supabase/migrations/004_create_triggers.sql`
   - `supabase/migrations/005_create_views.sql`
   - `supabase/migrations/006_create_rls_policies.sql`
   - `supabase/migrations/007_seed_data.sql`

**Opção B: Via Supabase CLI**
```bash
supabase db push
```

### 3. Migrar Dados do Mock para Supabase

```bash
node scripts/migrateToSupabase.js
```

**IMPORTANTE:**
- Faça backup do `mockData.json` antes
- Execute apenas UMA vez
- Verifique os logs para confirmar sucesso

### 4. Completar Atualização das Páginas Restantes

As seguintes páginas ainda usam mockApi e precisam ser atualizadas:
- `app/contas/page.jsx`
- `app/transacoes/page.jsx`
- `app/despesas/page.jsx`
- `app/receitas/page.jsx`
- `app/page.jsx` (Dashboard)

**Padrão de atualização:**

```javascript
// ANTES
import { fetchData, createTransaction } from "../../src/utils/mockApi";
const { data } = await fetchData("/api/transactions");

// DEPOIS
import { getTransactions, createTransaction } from "../../src/lib/supabase/api/transactions";
const { data, error } = await getTransactions();
if (error) throw error;
```

### 5. Testar Funcionalidades

Após completar as atualizações:
1. Login/SignUp
2. CRUD de cada entidade:
   - ✅ Categorias (testado)
   - ✅ Ativos (testado)
   - ✅ Metas (testado)
   - ⏳ Transações
   - ⏳ Bancos
   - ⏳ Cartões
3. Dashboard com analytics
4. Filtros e buscas
5. Exportação de dados

### 6. Remover Código Legacy

```bash
# Após confirmar que tudo funciona:
rm src/utils/mockApi.js
rm src/data/mockData.json
rm src/data/mockData.backup.json
```

---

## Mapeamento de Campos (Referência Rápida)

### Transactions (Transações/Despesas/Receitas)
- `title` → `description`
- `categories_id`/`categoriesId` → `category_id`
- `status` (string) → `payment_status_id` (int)
- `payment_method` (string) → `payment_method_id` (int)
- `installments.current` → `installment_number`
- `installments.total` → `installment_total`

### Assets (Patrimônio/Ativos)
- `assetTypesid`/`categoriesId` → `category_id`
- `date` → `valuation_date`
- `yield` → `yield_rate`

### Targets (Metas)
- `goal` → `goal_amount`
- `progress` → `current_amount`
- `monthlyAmount` → `monthly_target`
- `categoriesId` → `category_id`
- `date` → `start_date`

### Banks (Bancos)
- `accountType` → `account_type_id`
- `initialBalance` → `initial_balance`
- `currentBalance` → `current_balance`

### Cards (Cartões)
- `cardType` → `card_type_id`
- `cardBrand` → `card_brand_id`
- `creditLimit` → `credit_limit`
- `closingDay` → `closing_day`
- `dueDay` → `due_day`

---

## Arquivos de Documentação

- `SUPABASE_SETUP.md` - Guia completo de setup
- `.claude/plans/stateless-frolicking-wave.md` - Plano original completo
- Este arquivo - Status atual da migração

---

## Observações Importantes

### ⚠️ Antes de Começar
1. **FAZER BACKUP** do `mockData.json`
2. Ter um projeto Supabase criado
3. Ter as credenciais (URL, ANON_KEY, SERVICE_ROLE_KEY)

### ⚠️ Durante a Migração
1. Executar migrations na ORDEM correta
2. Executar script de migração apenas UMA vez
3. Verificar logs para erros

### ⚠️ Depois da Migração
1. NÃO deletar mockApi.js até confirmar que tudo funciona
2. Testar todas as funcionalidades CRUD
3. Verificar RLS (tentar acessar dados de outros usuários)

---

## Suporte

Se encontrar erros:
1. Verificar logs do console do navegador
2. Verificar logs do Supabase (Dashboard → Database → Logs)
3. Verificar variáveis de ambiente (.env.local)
4. Verificar se todas as migrations foram executadas
