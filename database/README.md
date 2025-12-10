# Database Schema - Histórico de Mudanças

Este diretório contém os schemas SQL do banco de dados Supabase para histórico e versionamento.

## Arquivos

### `schema.sql` (Versão Atual: 1.0.1)
Schema completo do banco de dados incluindo:
- 9 tabelas principais
- Triggers para updated_at (com security definer)
- Índices para performance
- Row Level Security (RLS) policies (incluindo icons e transaction_types)
- Dados iniciais (seed data)

### `migrations/2025-12-09_fix_security_warnings.sql`
Migration para corrigir avisos de segurança do Supabase:
- Habilitar RLS em `icons` e `transaction_types`
- Corrigir `search_path` na função `update_updated_at_column`

## Como Executar o Schema no Supabase

### Opção 1: Via SQL Editor (Recomendado)

1. Acesse [Supabase Dashboard](https://app.supabase.com/)
2. Selecione seu projeto
3. Vá em **SQL Editor** (ícone na barra lateral)
4. Clique em **New Query**
5. Copie todo o conteúdo de `database/schema.sql`
6. Cole no editor
7. Clique em **Run** ou pressione `Ctrl+Enter`

### Opção 2: Via CLI do Supabase

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Fazer login
supabase login

# Executar o schema
supabase db push
```

## Estrutura do Banco de Dados

### Tabelas Principais

1. **icons** - Ícones para categorias
2. **transaction_types** - Tipos de transação (Receita, Despesa, Investimento)
3. **users** - Usuários do sistema
4. **categories** - Categorias de transações
5. **banks** - Contas bancárias
6. **cards** - Cartões de crédito
7. **transactions** - Transações financeiras
8. **assets** - Patrimônio/Ativos
9. **targets** - Metas financeiras

### Relacionamentos

```
users (1) ─── (N) transactions
users (1) ─── (N) banks
users (1) ─── (N) cards
users (1) ─── (N) assets
users (1) ─── (N) targets
users (1) ─── (N) categories (customizadas)

categories (1) ─── (N) transactions
categories (1) ─── (N) assets
categories (1) ─── (N) targets
categories (N) ─── (1) icons

transaction_types (1) ─── (N) transactions

banks (1) ─── (N) transactions
cards (1) ─── (N) transactions
```

## Migrations Futuras

Para criar uma nova migration:

1. Crie um novo arquivo: `database/migrations/YYYY-MM-DD_descricao.sql`
2. Adicione as alterações SQL
3. Execute no Supabase SQL Editor
4. Documente as mudanças abaixo

### Histórico de Migrations

- **2025-12-09** - `schema.sql` v1.0.1 - Correções de segurança (RLS e search_path)
- **2025-12-09** - `migrations/2025-12-09_fix_security_warnings.sql` - Fix para avisos de segurança
- **2025-12-09** - `schema.sql` v1.0.0 - Schema inicial completo

## Backup

Para fazer backup do banco de dados:

1. Via Dashboard: **Database** → **Backups** → **Create Backup**
2. Via CLI: `supabase db dump > backup-$(date +%Y%m%d).sql`

## Rollback

Para reverter mudanças:

1. Via Dashboard: **Database** → **Backups** → Selecione backup → **Restore**
2. Via SQL: Execute comandos `DROP TABLE` ou `ALTER TABLE` conforme necessário

## Políticas de Segurança (RLS)

Todas as tabelas de dados do usuário possuem Row Level Security habilitado:

- Usuários só podem ver seus próprios dados
- Usuários só podem criar/editar/deletar seus próprios registros
- Categorias padrão (user_id = NULL) são visíveis para todos

## Seed Data

O schema inclui dados iniciais:
- 26 ícones padrão
- 3 tipos de transação (Receita, Despesa, Investimento)
- 13 categorias padrão

## Verificar Schema no Supabase

Após executar o schema, verifique:

1. **Table Editor** - Todas as 9 tabelas devem aparecer
2. **Database** → **Triggers** - 9 triggers de updated_at
3. **Authentication** → **Policies** - Políticas RLS para cada tabela
4. Execute query de teste:

```sql
-- Verificar tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar dados iniciais
SELECT COUNT(*) as total_icons FROM icons;
SELECT COUNT(*) as total_transaction_types FROM transaction_types;
SELECT COUNT(*) as total_categories FROM categories;
```

Resultado esperado:
- 9 tabelas
- 26 ícones
- 3 tipos de transação
- 13 categorias

## Troubleshooting

### Erro: "permission denied for schema public"
- Verifique se está executando como superuser
- No Supabase, use o SQL Editor que já tem permissões corretas

### Erro: "relation already exists"
- O schema usa `CREATE TABLE IF NOT EXISTS`, então é seguro executar múltiplas vezes
- Para forçar recriação, delete as tabelas primeiro

### Erro: "policy already exists"
- Use `DROP POLICY IF EXISTS` antes de criar
- Ou execute apenas uma vez o schema completo

## Próximas Melhorias

Possíveis adições futuras ao schema:

- [ ] Tabela de anexos/comprovantes
- [ ] Tabela de orçamentos
- [ ] Tabela de lembretes de pagamento
- [ ] Tabela de compartilhamento de dados entre usuários
- [ ] Tabela de logs de auditoria
- [ ] Views materializadas para relatórios
