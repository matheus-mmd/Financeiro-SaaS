-- ============================================
-- SCRIPT: APLICAR CATEGORIAS PADRÃO PARA USUÁRIOS EXISTENTES
-- Execute este script para criar categorias padrão para usuários que já existem
-- ============================================

-- ============================================
-- 1. VERIFICAR USUÁRIOS SEM CATEGORIAS
-- ============================================
SELECT
  u.id,
  u.email,
  u.name,
  COUNT(c.id) as total_categorias
FROM public.users u
LEFT JOIN public.categories c ON u.id = c.user_id
GROUP BY u.id, u.email, u.name
HAVING COUNT(c.id) = 0;

-- Se a query acima retornar usuários, eles NÃO têm categorias próprias
-- (podem estar vendo apenas as categorias do sistema com user_id = NULL)

-- ============================================
-- 2. APLICAR CATEGORIAS PARA TODOS OS USUÁRIOS SEM CATEGORIAS
-- ============================================
-- Este bloco cria categorias para TODOS os usuários que não têm categorias

DO $$
DECLARE
  user_record RECORD;
  categories_created INTEGER := 0;
BEGIN
  -- Iterar sobre cada usuário sem categorias
  FOR user_record IN
    SELECT DISTINCT u.id, u.email
    FROM public.users u
    WHERE NOT EXISTS (
      SELECT 1 FROM public.categories WHERE user_id = u.id
    )
  LOOP
    -- RECEITAS
    INSERT INTO public.categories (user_id, name, color, icon_id, transaction_type_id)
    VALUES
      (user_record.id, 'Salário', '#10b981', 1, 1),
      (user_record.id, 'Freelance', '#3b82f6', 41, 1),
      (user_record.id, 'Outros Ganhos', '#8b5cf6', 54, 1);

    -- DESPESAS
    INSERT INTO public.categories (user_id, name, color, icon_id, transaction_type_id)
    VALUES
      (user_record.id, 'Alimentação', '#10b981', 25, 2),
      (user_record.id, 'Moradia', '#3b82f6', 11, 2),
      (user_record.id, 'Transporte', '#ef4444', 17, 2),
      (user_record.id, 'Saúde', '#f59e0b', 32, 2),
      (user_record.id, 'Educação', '#8b5cf6', 39, 2),
      (user_record.id, 'Lazer', '#ec4899', 48, 2),
      (user_record.id, 'Vestuário', '#06b6d4', 56, 2),
      (user_record.id, 'Assinaturas', '#6366f1', 67, 2),
      (user_record.id, 'Contas', '#84cc16', 63, 2),
      (user_record.id, 'Outros Gastos', '#64748b', 84, 2);

    -- INVESTIMENTOS
    INSERT INTO public.categories (user_id, name, color, icon_id, transaction_type_id)
    VALUES
      (user_record.id, 'Poupança', '#22c55e', 6, 3),
      (user_record.id, 'Ações', '#ef4444', 77, 3),
      (user_record.id, 'Renda Fixa', '#3b82f6', 76, 3),
      (user_record.id, 'Outros Investimentos', '#8b5cf6', 78, 3);

    categories_created := categories_created + 17;
    RAISE NOTICE 'Criadas 17 categorias para usuário: % (%)', user_record.email, user_record.id;
  END LOOP;

  RAISE NOTICE 'Total de categorias criadas: %', categories_created;
END $$;

-- ============================================
-- 3. APLICAR PARA UM USUÁRIO ESPECÍFICO (ALTERNATIVA)
-- ============================================
-- Se preferir aplicar apenas para o seu usuário atual, use:

-- SELECT public.create_default_categories_for_user_manual(auth.uid());

-- Ou para um usuário específico (substitua o UUID):
-- SELECT public.create_default_categories_for_user_manual('seu-user-id-uuid-aqui');

-- ============================================
-- 4. VERIFICAR RESULTADO
-- ============================================
-- Ver todas as categorias criadas por usuário
SELECT
  u.email,
  u.name,
  COUNT(c.id) as total_categorias,
  COUNT(CASE WHEN c.transaction_type_id = 1 THEN 1 END) as receitas,
  COUNT(CASE WHEN c.transaction_type_id = 2 THEN 1 END) as despesas,
  COUNT(CASE WHEN c.transaction_type_id = 3 THEN 1 END) as investimentos
FROM public.users u
LEFT JOIN public.categories c ON u.id = c.user_id
GROUP BY u.email, u.name
ORDER BY u.email;

-- Ver categorias detalhadas de um usuário
SELECT
  c.name,
  tt.name as tipo,
  c.color,
  i.name as icone
FROM public.categories c
LEFT JOIN public.transaction_types tt ON c.transaction_type_id = tt.id
LEFT JOIN public.icons i ON c.icon_id = i.id
WHERE c.user_id = auth.uid()
ORDER BY c.transaction_type_id, c.name;

-- ============================================
-- RESUMO
-- ============================================
-- Este script criou 17 categorias padrão para cada usuário:
-- - 3 Receitas
-- - 10 Despesas
-- - 4 Investimentos
--
-- O usuário pode adicionar, editar ou deletar essas categorias depois
-- na tela de Categorias.
-- ============================================
