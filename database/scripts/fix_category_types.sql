-- ============================================
-- SCRIPT: DIAGNOSTICAR E CORRIGIR TIPOS DE CATEGORIAS
-- Problema: Categorias com transaction_type_id errado fazem transações
-- aparecerem nos cards errados (Despesa vira Receita, etc.)
-- ============================================

-- ============================================
-- 1. VERIFICAR CATEGORIAS ATUAIS
-- ============================================
SELECT
  c.id,
  c.name,
  c.transaction_type_id,
  tt.name as tipo_nome,
  tt.internal_name as tipo_interno,
  c.user_id,
  CASE
    WHEN c.user_id IS NULL THEN 'CATEGORIA DO SISTEMA'
    ELSE 'CATEGORIA DO USUÁRIO'
  END as origem
FROM public.categories c
LEFT JOIN public.transaction_types tt ON c.transaction_type_id = tt.id
ORDER BY c.transaction_type_id, c.name;

-- ============================================
-- 2. VERIFICAR TRANSACTION TYPES DISPONÍVEIS
-- ============================================
SELECT
  id,
  name,
  internal_name,
  color
FROM public.transaction_types
ORDER BY id;

-- Esperado:
-- 1 | Receita      | income     | verde
-- 2 | Despesa      | expense    | vermelho
-- 3 | Aporte       | investment | azul

-- ============================================
-- 3. EXEMPLOS DE CORREÇÃO MANUAL
-- ============================================
-- Use estes comandos como referência para corrigir categorias específicas:

-- Exemplo: Corrigir categoria "Alimentação" para ser DESPESA (tipo 2)
-- UPDATE public.categories
-- SET transaction_type_id = 2
-- WHERE name = 'Alimentação' AND user_id = 'SEU_USER_ID';

-- Exemplo: Corrigir categoria "Salário" para ser RECEITA (tipo 1)
-- UPDATE public.categories
-- SET transaction_type_id = 1
-- WHERE name = 'Salário' AND user_id = 'SEU_USER_ID';

-- Exemplo: Corrigir categoria "Investimento" para ser APORTE (tipo 3)
-- UPDATE public.categories
-- SET transaction_type_id = 3
-- WHERE name = 'Investimento' AND user_id = 'SEU_USER_ID';

-- ============================================
-- 4. VERIFICAR TRANSAÇÕES PROBLEMÁTICAS
-- ============================================
-- Transações que podem estar no card errado

SELECT
  t.id,
  t.description,
  t.amount,
  c.name as categoria,
  tt.name as tipo_transacao,
  tt.internal_name,
  t.transaction_date,
  CASE
    WHEN tt.internal_name = 'income' AND t.amount < 0 THEN '⚠️ RECEITA COM VALOR NEGATIVO'
    WHEN tt.internal_name = 'expense' AND t.amount > 0 THEN '⚠️ DESPESA COM VALOR POSITIVO'
    WHEN tt.internal_name = 'investment' AND t.amount > 0 THEN '⚠️ APORTE COM VALOR POSITIVO'
    ELSE '✓ OK'
  END as status
FROM public.transactions t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.transaction_types tt ON t.transaction_type_id = tt.id
WHERE t.deleted_at IS NULL
ORDER BY t.transaction_date DESC
LIMIT 50;

-- ============================================
-- 5. CATEGORIAS COMUNS E SEUS TIPOS CORRETOS
-- ============================================
-- Use como referência para corrigir suas categorias:

-- RECEITAS (transaction_type_id = 1):
-- - Salário
-- - Freelance
-- - Bonificação
-- - Renda Extra
-- - Presente Recebido
-- - Cashback

-- DESPESAS (transaction_type_id = 2):
-- - Alimentação
-- - Moradia (Aluguel, Condomínio)
-- - Transporte (Combustível, Uber, Ônibus)
-- - Saúde (Farmácia, Plano de Saúde, Consultas)
-- - Educação (Cursos, Livros, Escola)
-- - Lazer (Cinema, Restaurante, Streaming)
-- - Vestuário (Roupas, Calçados)
-- - Outros

-- APORTES/INVESTIMENTOS (transaction_type_id = 3):
-- - Ações
-- - Fundos Imobiliários
-- - Renda Fixa
-- - Tesouro Direto
-- - Criptomoedas
-- - Previdência

-- ============================================
-- 6. VERIFICAÇÃO FINAL
-- ============================================
-- Após corrigir, execute novamente a query 1 para confirmar
SELECT
  tt.name as tipo,
  COUNT(*) as total_categorias
FROM public.categories c
LEFT JOIN public.transaction_types tt ON c.transaction_type_id = tt.id
GROUP BY tt.name, tt.id
ORDER BY tt.id;

-- ============================================
-- INSTRUÇÕES DE USO:
-- ============================================
-- 1. Execute a query 1 para ver suas categorias atuais
-- 2. Execute a query 2 para ver os tipos disponíveis
-- 3. Identifique categorias com tipo errado
-- 4. Use os exemplos da seção 3 para corrigir (substitua SEU_USER_ID)
-- 5. Execute a query 6 para verificar se está tudo correto
-- ============================================
