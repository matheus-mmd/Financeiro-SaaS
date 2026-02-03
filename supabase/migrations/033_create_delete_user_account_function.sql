-- ============================================
-- MIGRATION 033: FUNÇÃO PARA EXCLUSÃO COMPLETA DE CONTA
-- Permite que o próprio usuário exclua sua conta e todos os dados,
-- incluindo o registro em auth.users (requer SECURITY DEFINER)
-- ============================================

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Obter o ID do usuário autenticado
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Deletar todos os dados na ordem correta (respeita RESTRICT constraints)
  -- 1. Tabelas que referenciam categories com RESTRICT
  DELETE FROM public.transactions WHERE user_id = current_user_id;
  DELETE FROM public.assets WHERE user_id = current_user_id;

  -- 2. Tabelas que referenciam categories com CASCADE ou SET NULL
  DELETE FROM public.category_budgets WHERE user_id = current_user_id;
  DELETE FROM public.targets WHERE user_id = current_user_id;

  -- 3. cards antes de banks (cards referencia banks)
  DELETE FROM public.cards WHERE user_id = current_user_id;
  DELETE FROM public.banks WHERE user_id = current_user_id;

  -- 4. categories (agora seguro - nenhum RESTRICT aponta para ela)
  DELETE FROM public.categories WHERE user_id = current_user_id;

  -- 5. Tabelas de setup
  DELETE FROM public.user_incomes WHERE user_id = current_user_id;
  DELETE FROM public.user_fixed_expenses WHERE user_id = current_user_id;
  DELETE FROM public.account_members WHERE user_id = current_user_id;

  -- 6. Deletar de auth.users (cascadeia para public.users automaticamente)
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

COMMENT ON FUNCTION public.delete_user_account IS 'Exclui permanentemente a conta do usuário autenticado e todos os dados associados, incluindo o registro de autenticação';