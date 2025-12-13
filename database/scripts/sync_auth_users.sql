-- ============================================
-- SCRIPT: SINCRONIZAR USUÁRIOS AUTH → PUBLIC
-- Corrige usuários que existem em auth.users mas não em public.users
-- ============================================

-- ============================================
-- 1. VERIFICAR USUÁRIOS FALTANDO
-- ============================================
-- Ver quais usuários existem em auth mas não em public
SELECT
  au.id,
  au.email,
  au.created_at,
  CASE
    WHEN pu.id IS NULL THEN 'FALTANDO em public.users'
    ELSE 'OK'
  END as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- ============================================
-- 2. INSERIR USUÁRIOS FALTANDO
-- ============================================
-- Copia usuários de auth.users para public.users
INSERT INTO public.users (id, email, name, created_at, updated_at)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', au.email) as name,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. VERIFICAR SE FUNCIONOU
-- ============================================
SELECT COUNT(*) as total_usuarios_auth FROM auth.users;
SELECT COUNT(*) as total_usuarios_public FROM public.users;

-- Os dois números devem ser iguais!

-- ============================================
-- 4. VERIFICAR TRIGGER
-- ============================================
-- Ver se o trigger está ativo
SELECT
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Se não retornar nada, o trigger não existe! Precisa criar.

-- ============================================
-- 5. RECRIAR TRIGGER (se não existir)
-- ============================================
-- Dropar trigger antigo (se existir)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger novo
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. VERIFICAÇÃO FINAL
-- ============================================
-- Todos os usuários devem estar sincronizados
SELECT
  COUNT(*) FILTER (WHERE pu.id IS NOT NULL) as sincronizados,
  COUNT(*) FILTER (WHERE pu.id IS NULL) as faltando
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id;

-- Se "faltando" = 0, está OK!
