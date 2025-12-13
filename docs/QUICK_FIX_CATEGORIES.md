# 🔧 Correção Rápida: Categorias Padrão Não Foram Criadas

## ❌ Problema Identificado

Você aplicou o trigger de auto-atribuição de categorias, mas **nenhuma categoria foi criada** para novos usuários.

**Causa**: As categorias padrão do sistema (com `user_id = NULL`) foram deletadas do banco de dados, então o trigger não tem o que copiar.

## ✅ Solução em 2 Passos

### Passo 1: Popular as Categorias Padrão do Sistema

Execute este SQL no **Supabase SQL Editor**:

```sql
-- LIMPAR CATEGORIAS ANTIGAS (se houver)
DELETE FROM public.categories WHERE user_id IS NULL;

-- INSERIR 25 CATEGORIAS PADRÃO DO SISTEMA
INSERT INTO public.categories (id, name, color, icon_id, transaction_type_id, user_id) VALUES
-- RECEITAS (transaction_type_id = 1)
(1, 'Salário', '#10b981', 1, 1, NULL),
(2, 'Freelance', '#3b82f6', 41, 1, NULL),
(3, 'Investimentos', '#8b5cf6', 8, 1, NULL),
(4, 'Reembolsos', '#f59e0b', 10, 1, NULL),

-- DESPESAS (transaction_type_id = 2)
(5, 'Moradia', '#3b82f6', 11, 2, NULL),
(6, 'Transporte', '#ef4444', 17, 2, NULL),
(7, 'Alimentação', '#10b981', 25, 2, NULL),
(8, 'Saúde', '#f59e0b', 32, 2, NULL),
(9, 'Educação', '#8b5cf6', 39, 2, NULL),
(10, 'Lazer', '#ec4899', 48, 2, NULL),
(11, 'Assinaturas', '#06b6d4', 67, 2, NULL),
(12, 'Família', '#f97316', 68, 2, NULL),
(13, 'Crédito', '#6366f1', 4, 2, NULL),
(14, 'Utilities', '#84cc16', 63, 2, NULL),
(15, 'Compras', '#ec4899', 53, 2, NULL),
(16, 'Serviços', '#06b6d4', 60, 2, NULL),
(17, 'Impostos', '#f97316', 73, 2, NULL),
(22, 'Outros', '#64748b', 84, 2, NULL),

-- APORTES/INVESTIMENTOS (transaction_type_id = 3)
(18, 'Poupança', '#22c55e', 6, 3, NULL),
(19, 'Ações', '#ef4444', 77, 3, NULL),
(20, 'Fundos', '#8b5cf6', 78, 3, NULL),
(21, 'Criptomoedas', '#ec4899', 7, 3, NULL),
(23, 'CDB', '#3b82f6', 76, 3, NULL),
(24, 'Tesouro Direto', '#f59e0b', 75, 3, NULL),
(25, 'FGTS', '#10b981', 83, 3, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  color = EXCLUDED.color,
  icon_id = EXCLUDED.icon_id,
  transaction_type_id = EXCLUDED.transaction_type_id,
  user_id = EXCLUDED.user_id,
  updated_at = NOW();

-- RESETAR SEQUÊNCIA
SELECT setval('public.categories_id_seq', 25, true);
```

**OU** execute o arquivo de migration completo:
```
supabase/migrations/010_repopulate_system_categories.sql
```

### Passo 2: Verificar se Funcionou

Após executar o SQL acima, verifique se as categorias foram criadas:

```sql
-- Verificar categorias do sistema
SELECT id, name, transaction_type_id, user_id
FROM public.categories
WHERE user_id IS NULL
ORDER BY id;
```

**Resultado esperado**: 25 linhas (categorias do sistema)

### Passo 3: Testar com um Novo Usuário

1. **Crie um novo usuário** pelo formulário de cadastro
2. **Verifique se recebeu as categorias**:

```sql
-- Substituir 'seuemail@teste.com' pelo email do usuário de teste
SELECT c.id, c.name, c.transaction_type_id, u.email
FROM categories c
JOIN users u ON u.id = c.user_id
WHERE u.email = 'seuemail@teste.com'
ORDER BY c.id;
```

**Resultado esperado**: 25 linhas (cópias das categorias para o novo usuário)

## 📊 Como o Sistema Funciona

```
┌────────────────────────────────────────────────────────────┐
│  CATEGORIAS DO SISTEMA (user_id = NULL)                   │
│  → Armazenadas no banco como "templates"                  │
│  → Não aparecem para usuários específicos                 │
│  → São usadas apenas pelo TRIGGER para copiar             │
└────────────────────────────────────────────────────────────┘
                              ↓
                         (TRIGGER)
                              ↓
┌────────────────────────────────────────────────────────────┐
│  CATEGORIAS DO USUÁRIO (user_id = UUID do usuário)        │
│  → Cópias personalizadas para cada usuário                │
│  → Podem ser editadas/deletadas pelo usuário              │
│  → Aparecem na interface do usuário                       │
└────────────────────────────────────────────────────────────┘
```

## ⚠️ Importante

**NÃO DELETE** as categorias onde `user_id IS NULL` novamente! Essas são as categorias "template" que o trigger usa para copiar para novos usuários.

Se você quiser modificar as categorias padrão:
1. Edite o arquivo `supabase/migrations/010_repopulate_system_categories.sql`
2. Execute novamente no SQL Editor
3. Novos usuários receberão a versão atualizada

## 🐛 Troubleshooting

### "Violação de constraint de chave estrangeira"

Se você receber erro de foreign key ao inserir as categorias, pode ser que os `icon_id` ou `transaction_type_id` não existam. Execute:

```sql
-- Verificar se os ícones existem
SELECT COUNT(*) FROM icons;

-- Verificar se os tipos de transação existem
SELECT COUNT(*) FROM transaction_types;
```

Se retornar 0, você precisa executar as migrations anteriores:
- `007_seed_data.sql` (para ícones e transaction_types)

### "Trigger não está funcionando"

Verifique se o trigger está ativo:

```sql
SELECT tgname, tgtype, tgenabled
FROM pg_trigger
WHERE tgname = 'assign_categories_on_user_creation';
```

Se não retornar nada, execute novamente:
```
supabase/migrations/009_auto_assign_default_categories.sql
```

## 📝 Resumo do Processo Completo

1. ✅ Execute `009_auto_assign_default_categories.sql` (você já fez)
2. ✅ Execute `010_repopulate_system_categories.sql` (faça agora)
3. ✅ Teste criando um novo usuário
4. ✅ Verifique se as categorias foram copiadas

---

**Qualquer dúvida, consulte**: `docs/AUTO_ASSIGN_CATEGORIES.md`
