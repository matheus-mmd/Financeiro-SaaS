-- ============================================
-- MIGRATION 019: Renomear Aporte para Patrimônio e Padronizar Cores
-- ============================================
-- Altera "Aporte" para "Patrimônio" e padroniza cores:
-- - Receita: verde (#22c55e) - já está correto
-- - Despesa: vermelho (#ef4444) - já está correto
-- - Patrimônio: roxo (#a855f7) - precisa ser alterado
-- ============================================

-- Atualizar nome e cor do tipo de transação INVESTMENT (Aporte -> Patrimônio)
UPDATE public.transaction_types
SET
  name = 'Patrimônio',
  color = '#a855f7'
WHERE id = 3 AND internal_name = 'investment';

-- Padronizar cores das categorias de Patrimônio para tons de roxo
-- Mantendo variedade mas dentro da paleta roxa
UPDATE public.categories
SET color = '#a855f7'  -- Roxo padrão
WHERE id = 18 AND transaction_type_id = 3;  -- Poupança

UPDATE public.categories
SET color = '#9333ea'  -- Roxo mais escuro
WHERE id = 19 AND transaction_type_id = 3;  -- Ações

UPDATE public.categories
SET color = '#c084fc'  -- Roxo mais claro
WHERE id = 20 AND transaction_type_id = 3;  -- Fundos

UPDATE public.categories
SET color = '#7c3aed'  -- Roxo médio
WHERE id = 21 AND transaction_type_id = 3;  -- Criptomoedas

UPDATE public.categories
SET color = '#a855f7'  -- Roxo padrão
WHERE id = 23 AND transaction_type_id = 3;  -- CDB

UPDATE public.categories
SET color = '#9333ea'  -- Roxo mais escuro
WHERE id = 24 AND transaction_type_id = 3;  -- Tesouro Direto

UPDATE public.categories
SET color = '#c084fc'  -- Roxo mais claro
WHERE id = 25 AND transaction_type_id = 3;  -- FGTS

-- Garantir que categorias de usuário do tipo INVESTMENT também usem tons de roxo
-- (aplicar a mesma cor roxa padrão para categorias criadas por usuários)
UPDATE public.categories
SET color = '#a855f7'
WHERE transaction_type_id = 3
  AND user_id IS NOT NULL
  AND color NOT LIKE '#a%'
  AND color NOT LIKE '#9333ea'
  AND color NOT LIKE '#c084fc'
  AND color NOT LIKE '#7c3aed';