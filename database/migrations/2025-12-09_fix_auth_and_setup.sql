-- =====================================================
-- Migration: Fix Auth Issues and Initial Setup
-- Data: 2025-12-09
-- Descrição: Resolve problemas de autenticação e configura ambiente
-- =====================================================

-- 1. CONFIRMAR TODOS OS USUÁRIOS EXISTENTES
-- Isso permite login sem precisar confirmar email
UPDATE auth.users
SET
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  confirmed_at = COALESCE(confirmed_at, NOW())
WHERE email_confirmed_at IS NULL OR confirmed_at IS NULL;

-- 2. CRIAR PERFIS NA TABELA USERS PARA USUÁRIOS QUE NÃO TEM
-- Usuários criados no Auth mas sem perfil na tabela users
INSERT INTO public.users (id, email, name)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', 'Usuário')
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 3. VERIFICAR RESULTADOS
-- Ver usuários confirmados
SELECT
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at,
  CASE
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmado'
    ELSE '❌ Não confirmado'
  END as status
FROM auth.users
ORDER BY created_at DESC;

-- Ver perfis criados
SELECT
  u.id,
  u.email,
  u.name,
  u.created_at,
  CASE
    WHEN au.id IS NOT NULL THEN '✅ Auth OK'
    ELSE '❌ Sem Auth'
  END as auth_status
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC;

-- =====================================================
-- INSTRUÇÕES PÓS-EXECUÇÃO
-- =====================================================

-- Depois de executar este SQL:
-- 1. Faça logout da aplicação
-- 2. Faça login novamente
-- 3. Deve funcionar! 🎉
--
-- Se ainda não funcionar, execute:
-- TRUNCATE auth.users CASCADE;
-- E crie novo usuário
