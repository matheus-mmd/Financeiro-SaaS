-- =====================================================
-- SEED - Dados Iniciais (Tabelas de Lookup)
-- =====================================================
-- Execute este script APÓS criar o schema para popular
-- as tabelas de categorias, tipos de ativos e tipos de
-- transações com valores padrão.
--
-- IMPORTANTE: Este script NÃO cria dados de usuário.
-- Os dados do usuário (despesas, ativos, metas, transações)
-- devem ser criados pela própria aplicação.
-- =====================================================

-- =====================================================
-- CATEGORIAS DE DESPESAS
-- =====================================================

INSERT INTO categories (name, color) VALUES
  ('Moradia', '#3b82f6'),
  ('Transporte', '#ef4444'),
  ('Alimentação', '#10b981'),
  ('Saúde', '#f59e0b'),
  ('Educação', '#8b5cf6'),
  ('Lazer', '#ec4899'),
  ('Assinaturas', '#06b6d4'),
  ('Família', '#f97316'),
  ('Crédito', '#6366f1'),
  ('Utilities', '#84cc16'),
  ('Outros', '#64748b');

-- =====================================================
-- TIPOS DE ATIVOS
-- =====================================================

INSERT INTO asset_types (name, color) VALUES
  ('Poupança', '#22c55e'),
  ('CDB', '#3b82f6'),
  ('Tesouro Direto', '#f59e0b'),
  ('Ações', '#ef4444'),
  ('Fundos', '#8b5cf6'),
  ('Criptomoedas', '#ec4899'),
  ('Outros', '#64748b');

-- =====================================================
-- TIPOS DE TRANSAÇÕES
-- =====================================================

INSERT INTO transaction_types (name, color, internal_name) VALUES
  ('Crédito', '#22c55e', 'credit'),
  ('Débito', '#ef4444', 'debit'),
  ('Aporte', '#3b82f6', 'investment');

-- =====================================================
-- FIM DO SEED
-- =====================================================
-- Tabelas de lookup populadas com sucesso!
--
-- Próximos passos:
-- 1. Configure autenticação no Supabase
-- 2. Crie um usuário no app
-- 3. Use a aplicação para criar despesas, ativos, metas e transações
-- =====================================================
