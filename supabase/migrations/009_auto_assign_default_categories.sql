-- ============================================
-- MIGRATION 009: AUTO ASSIGN DEFAULT CATEGORIES
-- Trigger para criar categorias padrão para novos usuários
-- ============================================

-- ============================================
-- FUNÇÃO: assign_default_categories_to_user
-- Copia todas as categorias do sistema (user_id = NULL)
-- para o novo usuário automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION public.assign_default_categories_to_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

  -- Log para debug (opcional, pode remover em produção)
  RAISE NOTICE 'Categorias padrão atribuídas ao usuário %', NEW.id;

  RETURN NEW;
END;
$$;

-- ============================================
-- TRIGGER: assign_categories_on_user_creation
-- Executado automaticamente após a inserção de um novo usuário
-- ============================================
DROP TRIGGER IF EXISTS assign_categories_on_user_creation ON public.users;

CREATE TRIGGER assign_categories_on_user_creation
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_categories_to_user();

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON FUNCTION public.assign_default_categories_to_user() IS
'Função trigger que copia automaticamente todas as categorias padrão do sistema para novos usuários';

COMMENT ON TRIGGER assign_categories_on_user_creation ON public.users IS
'Trigger que executa após inserção de novo usuário para criar suas categorias padrão';