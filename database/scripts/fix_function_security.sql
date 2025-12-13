-- ============================================
-- SCRIPT: CORRIGIR SEARCH_PATH DAS FUNÇÕES
-- Adiciona search_path explícito para evitar ataques de path injection
-- ============================================

-- ============================================
-- DROPAR FUNÇÕES ANTIGAS PRIMEIRO
-- ============================================
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.generate_installment_group_id() CASCADE;
DROP FUNCTION IF EXISTS public.check_target_completion() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ============================================
-- 1. update_updated_at_column
-- ============================================
CREATE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- 2. generate_installment_group_id
-- ============================================
CREATE FUNCTION public.generate_installment_group_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Gera um UUID v4 como string para agrupar parcelas
  RETURN gen_random_uuid()::text;
END;
$$;

-- ============================================
-- 3. check_target_completion
-- ============================================
CREATE FUNCTION public.check_target_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se current_amount >= goal_amount, marcar como completo
  IF NEW.current_amount >= NEW.goal_amount AND NEW.status != 'completed' THEN
    NEW.status := 'completed';
    NEW.completed_at := NOW();
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================
-- 4. handle_new_user
-- ============================================
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Criar registro na tabela users quando um novo usuário é criado no auth.users
  INSERT INTO public.users (id, email, name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- ============================================
-- VERIFICAÇÃO
-- ============================================
SELECT
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'update_updated_at_column',
    'generate_installment_group_id',
    'check_target_completion',
    'handle_new_user'
  );
