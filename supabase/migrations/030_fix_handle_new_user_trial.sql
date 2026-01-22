-- ============================================
-- MIGRATION 030: FIX HANDLE_NEW_USER TRIAL
-- Atualiza função handle_new_user para definir trial_ends_at corretamente
-- ============================================

-- Recriar função handle_new_user com campos de trial
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    name,
    currency,
    trial_ends_at,
    subscription_status
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'currency', 'BRL'),
    NOW() + INTERVAL '3 days',
    'trial'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION public.handle_new_user IS 'Cria registro na tabela users quando um novo usuário se cadastra via auth. Define período de teste de 3 dias.';

-- Corrigir usuários existentes que foram criados com período de 7 dias
-- Recalcula trial_ends_at para created_at + 3 dias para usuários em trial
UPDATE public.users
SET trial_ends_at = created_at + INTERVAL '3 days'
WHERE subscription_status = 'trial'
  AND trial_ends_at > created_at + INTERVAL '3 days';

COMMENT ON COLUMN public.users.trial_ends_at IS 'Data de expiração do período de teste (3 dias)';