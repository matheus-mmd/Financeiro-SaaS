# Configuração do Supabase - Financeiro SaaS

Este documento contém as instruções para configurar o Supabase no projeto.

## 1. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.local.example` para `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Abra `.env.local` e preencha com as credenciais do seu projeto Supabase:
   - Acesse https://app.supabase.com
   - Selecione seu projeto
   - Vá em **Settings > API**
   - Copie:
     - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (mantenha secreto!)

## 2. Executar Migrations SQL

As migrations estão na pasta `supabase/migrations/`. Você deve executá-las na ordem:

### Opção A: Via Dashboard do Supabase
1. Acesse https://app.supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Copie e cole o conteúdo de cada arquivo de migration na ordem:
   - `001_create_core_tables.sql`
   - `002_create_enum_tables.sql`
   - `003_create_main_tables.sql`
   - `004_create_triggers.sql`
   - `005_create_views.sql`
   - `006_create_rls_policies.sql`
   - `007_seed_data.sql`
5. Execute cada script (**RUN** button)

### Opção B: Via Supabase CLI (Recomendado)
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login no Supabase
supabase login

# Link com seu projeto
supabase link --project-ref your-project-ref

# Executar migrations
supabase db push
```

## 3. Migrar Dados do Mock

Após executar todas as migrations, migre os dados do `mockData.json`:

```bash
node scripts/migrateToSupabase.js
```

Este script irá:
- Ler todos os dados do `mockData.json`
- Mapear campos antigos → novos
- Inserir no Supabase respeitando foreign keys
- Validar integridade dos dados

## 4. Verificar Instalação

Após configurar tudo:

1. ✅ Variáveis de ambiente configuradas
2. ✅ Todas as 7 migrations executadas
3. ✅ Dados migrados com sucesso
4. ✅ RLS habilitado

Para testar:
```bash
npm run dev
```

Acesse http://localhost:3000 e tente fazer login.

## 5. Estrutura do Banco

### Tabelas Criadas (15)
- `users` - Usuários do sistema
- `icons` - 94 ícones Lucide React
- `transaction_types` - Receita, Despesa, Aporte
- `payment_statuses` - Status de pagamento
- `payment_methods` - Formas de pagamento
- `recurrence_frequencies` - Frequências de recorrência
- `account_types` - Tipos de conta bancária
- `card_types` - Tipos de cartão
- `card_brands` - Bandeiras de cartão
- `categories` - Categorias (25 padrão + customizadas)
- `banks` - Contas bancárias
- `cards` - Cartões de crédito/débito
- `transactions` - Transações financeiras
- `assets` - Patrimônio e ativos
- `targets` - Metas financeiras

### Views Criadas (3)
- `transactions_enriched` - Transações com dados enriquecidos
- `assets_enriched` - Ativos com ganho/perda calculados
- `targets_enriched` - Metas com progresso calculado

### Triggers (8)
- Auto-atualização de `updated_at`
- Geração automática de `installment_group_id`
- Completar metas automaticamente

## 6. Autenticação

O projeto agora usa **Supabase Auth** ao invés do mock.

Recursos disponíveis:
- ✅ Signup/Login com email e senha
- ✅ Logout
- ✅ Refresh automático de sessão
- ✅ Proteção de rotas via middleware
- ✅ Row Level Security (RLS) - cada usuário vê apenas seus dados

## 7. Próximos Passos

Após configurar:

1. Teste o login/signup
2. Crie algumas transações de teste
3. Verifique se o RLS está funcionando (crie outro usuário e confirme isolamento)
4. Configure backup automático do banco no Supabase
5. Monitore uso e performance

## 8. Troubleshooting

### Erro: "Invalid API key"
- Verifique se as variáveis de ambiente estão corretas
- Reinicie o servidor Next.js (`npm run dev`)

### Erro: "relation does not exist"
- Certifique-se de que executou todas as migrations na ordem
- Verifique no SQL Editor se as tabelas foram criadas

### Erro: "RLS policy violation"
- Verifique se está logado
- Confirme que as políticas RLS foram criadas (migration 006)

### Dados não aparecem
- Verifique se executou o script de migração
- Confirme que o `user_id` dos dados corresponde ao seu usuário
- Use o SQL Editor para fazer SELECT direto nas tabelas

## Suporte

Para mais informações:
- Documentação Supabase: https://supabase.com/docs
- Next.js + Supabase: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

---

Sucesso! 🚀
