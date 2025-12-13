-- ============================================
-- SCRIPT: CLEANUP DUPLICATE CATEGORIES
-- Remove categorias duplicadas de usuários existentes
-- Execute este script APENAS se você quiser limpar as categorias
-- ============================================

-- ============================================
-- PASSO 1: ANÁLISE - Ver a situação atual
-- ============================================

-- Ver total de categorias por tipo
SELECT
  CASE
    WHEN user_id IS NULL THEN 'Sistema (padrão)'
    ELSE 'Usuários'
  END as tipo,
  COUNT(*) as total_categorias
FROM public.categories
WHERE deleted_at IS NULL
GROUP BY CASE WHEN user_id IS NULL THEN 'Sistema (padrão)' ELSE 'Usuários' END;

-- Ver quantas categorias cada usuário tem
SELECT
  u.email,
  u.name,
  COUNT(c.id) as total_categorias
FROM public.users u
LEFT JOIN public.categories c ON c.user_id = u.id AND c.deleted_at IS NULL
GROUP BY u.id, u.email, u.name
ORDER BY total_categorias DESC;

-- Ver categorias duplicadas (mesmo nome para o mesmo usuário)
SELECT
  c.user_id,
  u.email,
  c.name,
  COUNT(*) as vezes_duplicada
FROM public.categories c
JOIN public.users u ON u.id = c.user_id
WHERE c.deleted_at IS NULL
GROUP BY c.user_id, u.email, c.name
HAVING COUNT(*) > 1
ORDER BY vezes_duplicada DESC;

-- ============================================
-- PASSO 2: LIMPEZA - Escolha UMA das opções abaixo
-- ============================================

-- OPÇÃO A: Deletar TODAS as categorias de TODOS os usuários
-- (Mantém apenas categorias do sistema - user_id = NULL)
-- CUIDADO: Isso remove categorias personalizadas também!
-- DELETE FROM public.categories
-- WHERE user_id IS NOT NULL;

-- OPÇÃO B: Manter apenas UMA cópia de cada categoria duplicada
-- (Remove duplicatas mas mantém uma cópia)
DELETE FROM public.categories
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY user_id, name, color, icon_id, transaction_type_id
        ORDER BY created_at ASC
      ) as rn
    FROM public.categories
    WHERE user_id IS NOT NULL
      AND deleted_at IS NULL
  ) t
  WHERE rn > 1
);

-- ============================================
-- PASSO 3: VERIFICAÇÃO - Confirmar que limpeza funcionou
-- ============================================

-- Ver quantas categorias restaram por usuário
SELECT
  u.email,
  u.name,
  COUNT(c.id) as total_categorias
FROM public.users u
LEFT JOIN public.categories c ON c.user_id = u.id AND c.deleted_at IS NULL
GROUP BY u.id, u.email, u.name
ORDER BY total_categorias DESC;

-- Ver se ainda existem duplicatas
SELECT
  c.user_id,
  u.email,
  c.name,
  COUNT(*) as vezes_duplicada
FROM public.categories c
JOIN public.users u ON u.id = c.user_id
WHERE c.deleted_at IS NULL
GROUP BY c.user_id, u.email, c.name
HAVING COUNT(*) > 1;
