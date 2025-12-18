-- ============================================
-- MIGRATION 016: PREVENIR DELEÇÃO DE USUÁRIOS COM DADOS
-- Adiciona função e trigger para prevenir deleção de usuários
-- que possuem dados relacionados
-- ============================================

-- FUNÇÃO: check_user_has_no_data
-- Verifica se o usuário tem dados relacionados antes de permitir deleção
CREATE OR REPLACE FUNCTION public.check_user_has_no_data()
RETURNS TRIGGER AS $$
DECLARE
  transaction_count INT;
  asset_count INT;
  target_count INT;
  bank_count INT;
  card_count INT;
  category_count INT;
BEGIN
  -- Contar transações do usuário
  SELECT COUNT(*) INTO transaction_count
  FROM public.transactions
  WHERE user_id = OLD.id AND deleted_at IS NULL;

  -- Contar ativos do usuário
  SELECT COUNT(*) INTO asset_count
  FROM public.assets
  WHERE user_id = OLD.id AND deleted_at IS NULL;

  -- Contar metas do usuário
  SELECT COUNT(*) INTO target_count
  FROM public.targets
  WHERE user_id = OLD.id AND deleted_at IS NULL;

  -- Contar bancos do usuário
  SELECT COUNT(*) INTO bank_count
  FROM public.banks
  WHERE user_id = OLD.id AND deleted_at IS NULL;

  -- Contar cartões do usuário
  SELECT COUNT(*) INTO card_count
  FROM public.cards
  WHERE user_id = OLD.id AND deleted_at IS NULL;

  -- Contar categorias customizadas do usuário
  SELECT COUNT(*) INTO category_count
  FROM public.categories
  WHERE user_id = OLD.id AND deleted_at IS NULL;

  -- Se há dados relacionados, não permitir deleção
  IF transaction_count > 0 OR asset_count > 0 OR target_count > 0 OR
     bank_count > 0 OR card_count > 0 OR category_count > 0 THEN
    RAISE EXCEPTION 'Cannot delete user with existing data. User has % transactions, % assets, % targets, % banks, % cards, % categories',
      transaction_count, asset_count, target_count, bank_count, card_count, category_count;
  END IF;

  -- Permitir deleção se não há dados
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- TRIGGER: Prevenir deleção de usuários com dados
CREATE TRIGGER prevent_user_deletion_with_data
  BEFORE DELETE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.check_user_has_no_data();

COMMENT ON FUNCTION public.check_user_has_no_data IS 'Previne deleção de usuários que possuem dados relacionados (transações, ativos, metas, etc)';