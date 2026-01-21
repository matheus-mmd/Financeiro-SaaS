-- ============================================
-- MIGRATION 026: RECRIAR CATEGORIAS AUTOMÁTICAS PARA NOVOS USUÁRIOS
-- Recria o trigger que foi removido na migration 023
-- Agora usando emojis em vez de icon_id
-- ============================================

-- ============================================
-- 1. FUNÇÃO: CRIAR CATEGORIAS PADRÃO (ATUALIZADA COM EMOJIS)
-- ============================================
CREATE OR REPLACE FUNCTION public.create_default_categories_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se o usuário já tem categorias
  -- (evita duplicação se a função for executada múltiplas vezes)
  IF EXISTS (SELECT 1 FROM public.categories WHERE user_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- ============================================
  -- RECEITAS (transaction_type_id = 1)
  -- ============================================
  INSERT INTO public.categories (user_id, name, color, emoji, transaction_type_id)
  VALUES
    (NEW.id, 'Salário Líquido', '#22c55e', '💰', 1),
    (NEW.id, 'Vale Refeição', '#22c55e', '🍽️', 1),
    (NEW.id, 'Vale Alimentação', '#22c55e', '🛒', 1),
    (NEW.id, 'Bônus/PLR', '#22c55e', '🏆', 1),
    (NEW.id, 'Férias', '#22c55e', '🏖️', 1),
    (NEW.id, '13º Salário', '#22c55e', '💵', 1),
    (NEW.id, 'Serviços Prestados', '#22c55e', '🛠️', 1),
    (NEW.id, 'Projeto/Freela', '#22c55e', '💼', 1),
    (NEW.id, 'Consultoria', '#22c55e', '🎯', 1),
    (NEW.id, 'Venda de Produto', '#22c55e', '📱', 1),
    (NEW.id, 'Comissão', '#22c55e', '💎', 1),
    (NEW.id, 'Aluguel/Locação', '#22c55e', '🏠', 1),
    (NEW.id, 'Dividendos/Lucros', '#22c55e', '📈', 1),
    (NEW.id, 'Outras Receitas', '#22c55e', '📦', 1);

  -- ============================================
  -- DESPESAS (transaction_type_id = 2)
  -- ============================================
  INSERT INTO public.categories (user_id, name, color, emoji, transaction_type_id)
  VALUES
    (NEW.id, 'Moradia', '#ef4444', '🏠', 2),
    (NEW.id, 'Alimentação', '#ef4444', '🍔', 2),
    (NEW.id, 'Transporte', '#ef4444', '🚗', 2),
    (NEW.id, 'Saúde', '#ef4444', '💊', 2),
    (NEW.id, 'Educação', '#ef4444', '📚', 2),
    (NEW.id, 'Lazer', '#ef4444', '🎮', 2),
    (NEW.id, 'Vestuário', '#ef4444', '👗', 2),
    (NEW.id, 'Compras', '#ef4444', '🛒', 2),
    (NEW.id, 'Serviços', '#ef4444', '🔧', 2),
    (NEW.id, 'Assinaturas', '#ef4444', '📱', 2),
    (NEW.id, 'Impostos', '#ef4444', '📋', 2),
    (NEW.id, 'Doações e Ofertas', '#ef4444', '🤝', 2),
    (NEW.id, 'Pet', '#ef4444', '🐕', 2),
    (NEW.id, 'Viagens', '#ef4444', '✈️', 2),
    (NEW.id, 'Beleza e Cuidados', '#ef4444', '💄', 2),
    (NEW.id, 'Streaming/Apps', '#ef4444', '📺', 2),
    (NEW.id, 'Outras Despesas', '#ef4444', '📦', 2);

  -- ============================================
  -- INVESTIMENTOS/PATRIMÔNIO (transaction_type_id = 3)
  -- ============================================
  INSERT INTO public.categories (user_id, name, color, emoji, transaction_type_id)
  VALUES
    (NEW.id, 'Poupança', '#3b82f6', '🏦', 3),
    (NEW.id, 'Ações', '#3b82f6', '📊', 3),
    (NEW.id, 'Renda Fixa', '#3b82f6', '📈', 3),
    (NEW.id, 'Fundos', '#3b82f6', '💼', 3),
    (NEW.id, 'Criptomoedas', '#3b82f6', '🪙', 3),
    (NEW.id, 'Outros Investimentos', '#3b82f6', '💎', 3);

  RETURN NEW;
END;
$$;

-- ============================================
-- 2. TRIGGER: EXECUTAR APÓS CRIAR USUÁRIO
-- ============================================
-- Dropar trigger antigo se existir
DROP TRIGGER IF EXISTS on_user_created_add_categories ON public.users;

-- Criar trigger novo
CREATE TRIGGER on_user_created_add_categories
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_categories_for_user();

-- ============================================
-- 3. FUNÇÃO AUXILIAR: CRIAR CATEGORIAS MANUALMENTE
-- ============================================
-- Use esta função para criar categorias para usuários existentes
CREATE OR REPLACE FUNCTION public.create_default_categories_for_user_manual(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se o usuário já tem categorias
  IF EXISTS (SELECT 1 FROM public.categories WHERE user_id = p_user_id) THEN
    RAISE NOTICE 'Usuário % já possui categorias', p_user_id;
    RETURN;
  END IF;

  -- RECEITAS (transaction_type_id = 1)
  INSERT INTO public.categories (user_id, name, color, emoji, transaction_type_id)
  VALUES
    (p_user_id, 'Salário Líquido', '#22c55e', '💰', 1),
    (p_user_id, 'Vale Refeição', '#22c55e', '🍽️', 1),
    (p_user_id, 'Vale Alimentação', '#22c55e', '🛒', 1),
    (p_user_id, 'Bônus/PLR', '#22c55e', '🏆', 1),
    (p_user_id, 'Férias', '#22c55e', '🏖️', 1),
    (p_user_id, '13º Salário', '#22c55e', '💵', 1),
    (p_user_id, 'Serviços Prestados', '#22c55e', '🛠️', 1),
    (p_user_id, 'Projeto/Freela', '#22c55e', '💼', 1),
    (p_user_id, 'Consultoria', '#22c55e', '🎯', 1),
    (p_user_id, 'Venda de Produto', '#22c55e', '📱', 1),
    (p_user_id, 'Comissão', '#22c55e', '💎', 1),
    (p_user_id, 'Aluguel/Locação', '#22c55e', '🏠', 1),
    (p_user_id, 'Dividendos/Lucros', '#22c55e', '📈', 1),
    (p_user_id, 'Outras Receitas', '#22c55e', '📦', 1);

  -- DESPESAS (transaction_type_id = 2)
  INSERT INTO public.categories (user_id, name, color, emoji, transaction_type_id)
  VALUES
    (p_user_id, 'Moradia', '#ef4444', '🏠', 2),
    (p_user_id, 'Alimentação', '#ef4444', '🍔', 2),
    (p_user_id, 'Transporte', '#ef4444', '🚗', 2),
    (p_user_id, 'Saúde', '#ef4444', '💊', 2),
    (p_user_id, 'Educação', '#ef4444', '📚', 2),
    (p_user_id, 'Lazer', '#ef4444', '🎮', 2),
    (p_user_id, 'Vestuário', '#ef4444', '👗', 2),
    (p_user_id, 'Compras', '#ef4444', '🛒', 2),
    (p_user_id, 'Serviços', '#ef4444', '🔧', 2),
    (p_user_id, 'Assinaturas', '#ef4444', '📱', 2),
    (p_user_id, 'Impostos', '#ef4444', '📋', 2),
    (p_user_id, 'Doações e Ofertas', '#ef4444', '🤝', 2),
    (p_user_id, 'Pet', '#ef4444', '🐕', 2),
    (p_user_id, 'Viagens', '#ef4444', '✈️', 2),
    (p_user_id, 'Beleza e Cuidados', '#ef4444', '💄', 2),
    (p_user_id, 'Streaming/Apps', '#ef4444', '📺', 2),
    (p_user_id, 'Outras Despesas', '#ef4444', '📦', 2);

  -- INVESTIMENTOS/PATRIMÔNIO (transaction_type_id = 3)
  INSERT INTO public.categories (user_id, name, color, emoji, transaction_type_id)
  VALUES
    (p_user_id, 'Poupança', '#3b82f6', '🏦', 3),
    (p_user_id, 'Ações', '#3b82f6', '📊', 3),
    (p_user_id, 'Renda Fixa', '#3b82f6', '📈', 3),
    (p_user_id, 'Fundos', '#3b82f6', '💼', 3),
    (p_user_id, 'Criptomoedas', '#3b82f6', '🪙', 3),
    (p_user_id, 'Outros Investimentos', '#3b82f6', '💎', 3);

  RAISE NOTICE 'Categorias criadas com sucesso para o usuário %', p_user_id;
END;
$$;

-- ============================================
-- 4. CRIAR CATEGORIAS PARA USUÁRIOS EXISTENTES SEM CATEGORIAS
-- ============================================
DO $$
DECLARE
  user_record RECORD;
  users_updated INTEGER := 0;
BEGIN
  FOR user_record IN
    SELECT u.id
    FROM public.users u
    WHERE NOT EXISTS (
      SELECT 1 FROM public.categories c WHERE c.user_id = u.id
    )
  LOOP
    PERFORM public.create_default_categories_for_user_manual(user_record.id);
    users_updated := users_updated + 1;
  END LOOP;

  RAISE NOTICE 'Categorias criadas para % usuário(s) existente(s)', users_updated;
END $$;

-- ============================================
-- 5. VERIFICAÇÃO
-- ============================================
-- Verificar se o trigger foi criado
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_user_created_add_categories';

-- ============================================
-- RESUMO DAS CATEGORIAS CRIADAS:
-- ============================================
--
-- RECEITAS (14):
-- 💰 Salário Líquido
-- 🍽️ Vale Refeição
-- 🛒 Vale Alimentação
-- 🏆 Bônus/PLR
-- 🏖️ Férias
-- 💵 13º Salário
-- 🛠️ Serviços Prestados
-- 💼 Projeto/Freela
-- 🎯 Consultoria
-- 📱 Venda de Produto
-- 💎 Comissão
-- 🏠 Aluguel/Locação
-- 📈 Dividendos/Lucros
-- 📦 Outras Receitas
--
-- DESPESAS (17):
-- 🏠 Moradia
-- 🍔 Alimentação
-- 🚗 Transporte
-- 💊 Saúde
-- 📚 Educação
-- 🎮 Lazer
-- 👗 Vestuário
-- 🛒 Compras
-- 🔧 Serviços
-- 📱 Assinaturas
-- 📋 Impostos
-- 🤝 Doações e Ofertas
-- 🐕 Pet
-- ✈️ Viagens
-- 💄 Beleza e Cuidados
-- 📺 Streaming/Apps
-- 📦 Outras Despesas
--
-- INVESTIMENTOS (6):
-- 🏦 Poupança
-- 📊 Ações
-- 📈 Renda Fixa
-- 💼 Fundos
-- 🪙 Criptomoedas
-- 💎 Outros Investimentos
--
-- TOTAL: 37 categorias
-- ============================================