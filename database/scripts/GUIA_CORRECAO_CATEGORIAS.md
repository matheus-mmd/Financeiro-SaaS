# Guia de Correção: Categorias nos Cards Errados

## Problema Identificado

Quando você cria uma transação com uma categoria de "Despesas", mas o valor aparece no card de "Receitas", isso significa que a **categoria está com o tipo incorreto no banco de dados**.

## Como Funciona o Sistema

1. **Cada categoria tem um tipo** que determina se é Receita, Despesa ou Aporte:
   - `transaction_type_id = 1` → Receita (income)
   - `transaction_type_id = 2` → Despesa (expense)
   - `transaction_type_id = 3` → Aporte/Investimento (investment)

2. **Quando você cria uma transação:**
   - Você seleciona uma categoria
   - O sistema AUTOMATICAMENTE define o tipo da transação baseado no tipo da categoria
   - O valor vai para o card correspondente (Receitas, Despesas ou Aportes)

3. **Se uma categoria de "Despesas" tem `transaction_type_id = 1` (income):**
   - As transações criadas com essa categoria aparecem como RECEITAS
   - Isso está errado!

## Como Corrigir

### Passo 1: Diagnosticar o Problema

1. Acesse o **Supabase SQL Editor**
2. Execute este comando:

```sql
SELECT
  c.id,
  c.name,
  c.transaction_type_id,
  tt.name as tipo_nome,
  tt.internal_name as tipo_interno
FROM public.categories c
LEFT JOIN public.transaction_types tt ON c.transaction_type_id = tt.id
WHERE c.user_id = auth.uid()
ORDER BY c.transaction_type_id, c.name;
```

3. Verifique se suas categorias estão com o tipo correto:
   - **Alimentação, Transporte, Moradia** → devem ter `transaction_type_id = 2` (expense)
   - **Salário, Freelance** → devem ter `transaction_type_id = 1` (income)
   - **Ações, Fundos, Investimentos** → devem ter `transaction_type_id = 3` (investment)

### Passo 2: Corrigir Categorias Específicas

Para cada categoria incorreta, execute:

```sql
-- Exemplo: Corrigir "Alimentação" para ser DESPESA
UPDATE public.categories
SET transaction_type_id = 2
WHERE name = 'Alimentação' AND user_id = auth.uid();

-- Exemplo: Corrigir "Salário" para ser RECEITA
UPDATE public.categories
SET transaction_type_id = 1
WHERE name = 'Salário' AND user_id = auth.uid();

-- Exemplo: Corrigir "Ações" para ser APORTE
UPDATE public.categories
SET transaction_type_id = 3
WHERE name = 'Ações' AND user_id = auth.uid();
```

### Passo 3: Verificar Correção

Execute novamente a query do Passo 1 para confirmar que está tudo correto.

### Passo 4: Corrigir Transações Antigas (Opcional)

Se você já tem transações criadas com as categorias erradas, elas também precisam ser corrigidas:

```sql
-- Ver transações que precisam ser corrigidas
SELECT
  t.id,
  t.description,
  t.amount,
  c.name as categoria,
  tt.name as tipo_atual
FROM public.transactions t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.transaction_types tt ON t.transaction_type_id = tt.id
WHERE t.user_id = auth.uid()
  AND t.deleted_at IS NULL
ORDER BY t.transaction_date DESC;

-- Corrigir transações de uma categoria específica
-- EXEMPLO: Todas as transações da categoria "Alimentação" devem ser DESPESAS (tipo 2)
UPDATE public.transactions
SET transaction_type_id = 2
WHERE category_id = (SELECT id FROM public.categories WHERE name = 'Alimentação' AND user_id = auth.uid())
  AND user_id = auth.uid();
```

## Referência: Categorias Comuns e Seus Tipos

### RECEITAS (transaction_type_id = 1)
- Salário
- Freelance
- Bonificação
- Renda Extra
- Presente Recebido
- Cashback

### DESPESAS (transaction_type_id = 2)
- Alimentação
- Moradia (Aluguel, Condomínio)
- Transporte (Combustível, Uber, Ônibus)
- Saúde (Farmácia, Plano de Saúde)
- Educação (Cursos, Livros)
- Lazer (Cinema, Restaurante, Streaming)
- Vestuário (Roupas, Calçados)
- Outros

### APORTES/INVESTIMENTOS (transaction_type_id = 3)
- Ações
- Fundos Imobiliários
- Renda Fixa
- Tesouro Direto
- Criptomoedas
- Previdência

## Nova Interface Visual

A partir de agora, quando você criar ou editar uma transação, verá um **badge colorido** ao lado do campo "Categoria" mostrando o tipo:

- 🟢 **Receita** (verde)
- 🔴 **Despesa** (vermelho)
- 🔵 **Aporte** (azul)

Isso deixa claro qual tipo de transação está sendo criado antes de salvar!

## Prevenção

Para evitar esse problema no futuro:

1. **Crie categorias na tela de Categorias**, onde elas são organizadas por tipo
2. **Preste atenção na seção** ao criar uma categoria:
   - Categorias de Receitas → vão para o card de Receitas
   - Categorias de Despesas → vão para o card de Despesas
   - Categorias de Patrimônio → vão para o card de Aportes

3. **Use o badge visual** no formulário de transações para confirmar o tipo antes de salvar

## Precisa de Ajuda?

Se ainda tiver dúvidas, execute o script completo de diagnóstico:
```bash
database/scripts/fix_category_types.sql
```

Ele mostra todas as suas categorias, transações problemáticas e exemplos de correção.
