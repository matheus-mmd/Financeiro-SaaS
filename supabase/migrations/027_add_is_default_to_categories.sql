-- ============================================
-- MIGRATION 027: ADICIONAR CAMPO is_default NA TABELA CATEGORIES
-- Permite diferenciar categorias padrão de personalizadas
-- ============================================

-- 1. Adicionar coluna is_default
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- 2. Atualizar a função de criação de categorias para marcar como padrão
CREATE OR REPLACE FUNCTION public.create_default_categories_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.categories WHERE user_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- RECEITAS (transaction_type_id = 1) - is_default = true
  INSERT INTO public.categories (user_id, name, color, emoji, transaction_type_id, is_default)
  VALUES
    (NEW.id, 'Salário Líquido', '#22c55e', '💰', 1, true),
    (NEW.id, 'Vale Refeição', '#22c55e', '🍽️', 1, true),
    (NEW.id, 'Vale Alimentação', '#22c55e', '🛒', 1, true),
    (NEW.id, 'Bônus/PLR', '#22c55e', '🏆', 1, true),
    (NEW.id, 'Férias', '#22c55e', '🏖️', 1, true),
    (NEW.id, '13º Salário', '#22c55e', '💵', 1, true),
    (NEW.id, 'Serviços Prestados', '#22c55e', '🛠️', 1, true),
    (NEW.id, 'Projeto/Freela', '#22c55e', '💼', 1, true),
    (NEW.id, 'Consultoria', '#22c55e', '🎯', 1, true),
    (NEW.id, 'Venda de Produto', '#22c55e', '📱', 1, true),
    (NEW.id, 'Comissão', '#22c55e', '💎', 1, true),
    (NEW.id, 'Aluguel/Locação', '#22c55e', '🏠', 1, true),
    (NEW.id, 'Dividendos/Lucros', '#22c55e', '📈', 1, true),
    (NEW.id, 'Outras Receitas', '#22c55e', '📦', 1, true);

  -- DESPESAS (transaction_type_id = 2) - is_default = true
  INSERT INTO public.categories (user_id, name, color, emoji, transaction_type_id, is_default)
  VALUES
    (NEW.id, 'Moradia', '#ef4444', '🏠', 2, true),
    (NEW.id, 'Alimentação', '#ef4444', '🍔', 2, true),
    (NEW.id, 'Transporte', '#ef4444', '🚗', 2, true),
    (NEW.id, 'Saúde', '#ef4444', '💊', 2, true),
    (NEW.id, 'Educação', '#ef4444', '📚', 2, true),
    (NEW.id, 'Lazer', '#ef4444', '🎮', 2, true),
    (NEW.id, 'Vestuário', '#ef4444', '👗', 2, true),
    (NEW.id, 'Compras', '#ef4444', '🛒', 2, true),
    (NEW.id, 'Serviços', '#ef4444', '🔧', 2, true),
    (NEW.id, 'Assinaturas', '#ef4444', '📱', 2, true),
    (NEW.id, 'Impostos', '#ef4444', '📋', 2, true),
    (NEW.id, 'Doações e Ofertas', '#ef4444', '🤝', 2, true),
    (NEW.id, 'Pet', '#ef4444', '🐕', 2, true),
    (NEW.id, 'Viagens', '#ef4444', '✈️', 2, true),
    (NEW.id, 'Beleza e Cuidados', '#ef4444', '💄', 2, true),
    (NEW.id, 'Streaming/Apps', '#ef4444', '📺', 2, true),
    (NEW.id, 'Outras Despesas', '#ef4444', '📦', 2, true);

  -- INVESTIMENTOS (transaction_type_id = 3) - is_default = true
  INSERT INTO public.categories (user_id, name, color, emoji, transaction_type_id, is_default)
  VALUES
    (NEW.id, 'Poupança', '#3b82f6', '🏦', 3, true),
    (NEW.id, 'Ações', '#3b82f6', '📊', 3, true),
    (NEW.id, 'Renda Fixa', '#3b82f6', '📈', 3, true),
    (NEW.id, 'Fundos', '#3b82f6', '💼', 3, true),
    (NEW.id, 'Criptomoedas', '#3b82f6', '🪙', 3, true),
    (NEW.id, 'Outros Investimentos', '#3b82f6', '💎', 3, true);

  RETURN NEW;
END;
$$;

-- 3. Recriar o trigger
DROP TRIGGER IF EXISTS on_user_created_add_categories ON public.users;

CREATE TRIGGER on_user_created_add_categories
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_categories_for_user();