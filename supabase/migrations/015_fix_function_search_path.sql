-- ============================================
-- MIGRATION 015: FIX FUNCTION SEARCH PATH
-- Adiciona search_path vazio às funções para prevenir
-- ataques de injeção de search path
-- ============================================

-- Fix: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Fix: generate_installment_group_id
CREATE OR REPLACE FUNCTION public.generate_installment_group_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.installment_total IS NOT NULL AND NEW.installment_total > 1 AND NEW.installment_group_id IS NULL THEN
    NEW.installment_group_id = gen_random_uuid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Fix: check_target_completion
CREATE OR REPLACE FUNCTION public.check_target_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_amount >= NEW.goal_amount AND NEW.status = 'in_progress' THEN
    NEW.status = 'completed';
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Fix: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, currency)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'currency', 'BRL')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';