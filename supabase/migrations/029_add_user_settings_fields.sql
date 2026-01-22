-- ============================================
-- MIGRATION 029: ADICIONA CAMPOS DE CONFIGURAÇÕES DO USUÁRIO
-- Campos para telefone, assinatura e preferências
-- ============================================

-- 1. Adicionar campo phone à tabela users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

COMMENT ON COLUMN public.users.phone IS 'Telefone/WhatsApp do usuário';

-- 2. Adicionar campos de assinatura
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '3 days');

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'trial';

COMMENT ON COLUMN public.users.trial_ends_at IS 'Data de expiração do período de teste';
COMMENT ON COLUMN public.users.subscription_status IS 'Status da assinatura: trial, active, expired, cancelled';

-- 3. Adicionar campos de preferências
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS push_notifications_enabled BOOLEAN DEFAULT false;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS dark_mode_enabled BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.users.push_notifications_enabled IS 'Notificações push habilitadas';
COMMENT ON COLUMN public.users.dark_mode_enabled IS 'Modo escuro habilitado';

-- 4. Atualizar usuários existentes para ter trial_ends_at baseado em created_at
UPDATE public.users
SET trial_ends_at = created_at + INTERVAL '3 days'
WHERE trial_ends_at IS NULL;

-- 5. Adicionar campo name à tabela account_members (se não existir)
ALTER TABLE public.account_members
ADD COLUMN IF NOT EXISTS name VARCHAR(255);

COMMENT ON COLUMN public.account_members.name IS 'Nome do integrante da conta conjunta';

-- 6. Atualizar a view de busca de usuário (se necessário)
-- A view pode ser usada para exibir informações completas do perfil