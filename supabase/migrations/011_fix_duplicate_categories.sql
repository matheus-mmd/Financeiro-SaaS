-- ============================================
-- MIGRATION 011: FIX DUPLICATE CATEGORIES
-- Corrige a duplicação de categorias para novos usuários
-- ============================================

-- ============================================
-- FUNÇÃO CORRIGIDA: assign_default_categories_to_user
-- Verifica se o usuário já tem categorias antes de criar
-- Isso evita duplicação caso a função seja chamada múltiplas vezes
-- ============================================
CREATE OR REPLACE FUNCTION public.assign_default_categories_to_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_categories_count INT;
BEGIN
  -- Verificar se o usuário já possui categorias
  SELECT COUNT(*)
  INTO existing_categories_count
  FROM public.categories
  WHERE user_id = NEW.id;

  -- Se já existem categorias, não criar novamente
  IF existing_categories_count > 0 THEN
    RAISE NOTICE 'Usuário % já possui % categorias. Pulando criação.', NEW.id, existing_categories_count;
    RETURN NEW;
  END IF;

  -- Inserir categorias padrão do sistema para o novo usuário
  INSERT INTO public.categories (name, color, icon_id, transaction_type_id, user_id, created_at, updated_at)
  SELECT
    name,
    color,
    icon_id,
    transaction_type_id,
    NEW.id, -- ID do novo usuário
    NOW(),
    NOW()
  FROM public.categories
  WHERE user_id IS NULL -- Apenas categorias do sistema
    AND deleted_at IS NULL; -- Apenas categorias ativas

  -- Log para debug
  RAISE NOTICE 'Categorias padrão atribuídas ao usuário %', NEW.id;

  RETURN NEW;
END;
$$;

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON FUNCTION public.assign_default_categories_to_user() IS
'Função trigger que copia automaticamente todas as categorias padrão do sistema para novos usuários. Verifica se já existem categorias para evitar duplicação.';
