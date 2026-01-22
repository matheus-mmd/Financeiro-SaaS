-- ============================================
-- MIGRATION 028: CORRIGIR VIEW CATEGORIES_ENRICHED
-- Adiciona campo is_default que faltava na view
-- E atualiza categorias existentes para ter is_default = true
-- ============================================

-- 1. Dropar a view existente
DROP VIEW IF EXISTS public.categories_enriched;

-- 2. Recriar a view com o campo is_default
CREATE VIEW public.categories_enriched AS
SELECT
  c.id,
  c.user_id,
  c.name,
  c.color,
  c.emoji,
  c.icon_id,
  i.name AS icon_name,
  c.transaction_type_id,
  tt.name AS transaction_type_name,
  tt.internal_name AS transaction_type_internal_name,
  c.is_default,
  c.created_at,
  c.deleted_at
FROM public.categories c
LEFT JOIN public.icons i ON c.icon_id = i.id
LEFT JOIN public.transaction_types tt ON c.transaction_type_id = tt.id
WHERE c.deleted_at IS NULL;

-- 3. Garantir permissões corretas na view
GRANT SELECT ON public.categories_enriched TO authenticated;

-- 4. Atualizar categorias existentes que são padrão mas não estão marcadas
-- (para usuários que foram criados antes da migration 027 ou que tiveram problemas)

-- Lista de nomes de categorias padrão de RECEITA
UPDATE public.categories
SET is_default = true
WHERE is_default IS NOT TRUE
  AND transaction_type_id = 1
  AND name IN (
    'Salário Líquido', 'Vale Refeição', 'Vale Alimentação', 'Bônus/PLR',
    'Férias', '13º Salário', 'Serviços Prestados', 'Projeto/Freela',
    'Consultoria', 'Venda de Produto', 'Comissão', 'Aluguel/Locação',
    'Dividendos/Lucros', 'Outras Receitas'
  );

-- Lista de nomes de categorias padrão de DESPESA
UPDATE public.categories
SET is_default = true
WHERE is_default IS NOT TRUE
  AND transaction_type_id = 2
  AND name IN (
    'Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Educação',
    'Lazer', 'Vestuário', 'Compras', 'Serviços', 'Assinaturas',
    'Impostos', 'Doações e Ofertas', 'Pet', 'Viagens',
    'Beleza e Cuidados', 'Streaming/Apps', 'Outras Despesas'
  );

-- Lista de nomes de categorias padrão de INVESTIMENTO
UPDATE public.categories
SET is_default = true
WHERE is_default IS NOT TRUE
  AND transaction_type_id = 3
  AND name IN (
    'Poupança', 'Ações', 'Renda Fixa', 'Fundos',
    'Criptomoedas', 'Outros Investimentos'
  );