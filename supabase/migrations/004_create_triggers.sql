-- ============================================
-- MIGRATION 004: TRIGGERS
-- Triggers e funções automáticas
-- ============================================

-- ============================================
-- FUNÇÃO: update_updated_at_column
-- Atualiza automaticamente o campo updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_banks_updated_at BEFORE UPDATE ON public.banks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_targets_updated_at BEFORE UPDATE ON public.targets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- FUNÇÃO: generate_installment_group_id
-- Gera UUID para agrupar parcelas automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_installment_group_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.installment_total IS NOT NULL AND NEW.installment_total > 1 AND NEW.installment_group_id IS NULL THEN
    NEW.installment_group_id = gen_random_uuid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_transaction_installment_group BEFORE INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.generate_installment_group_id();

-- ============================================
-- FUNÇÃO: check_target_completion
-- Marca meta como completada automaticamente quando atingir o objetivo
-- ============================================
CREATE OR REPLACE FUNCTION public.check_target_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_amount >= NEW.goal_amount AND NEW.status = 'in_progress' THEN
    NEW.status = 'completed';
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_target_completion_trigger BEFORE UPDATE ON public.targets
  FOR EACH ROW EXECUTE FUNCTION public.check_target_completion();

-- ============================================
-- FUNÇÃO: handle_new_user
-- Cria registro em public.users após signup no auth.users
-- ============================================
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
