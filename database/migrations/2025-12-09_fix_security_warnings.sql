-- =====================================================
-- Migration: Fix Security Warnings
-- Data: 2025-12-09
-- Versão: 1.0.1
-- Descrição: Corrige avisos de segurança do Supabase
-- =====================================================

-- =====================================================
-- 1. HABILITAR RLS EM TABELAS PÚBLICAS
-- =====================================================

-- Tabela icons - dados de referência (somente leitura pública)
ALTER TABLE icons ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler ícones
DROP POLICY IF EXISTS "Public icons are viewable by everyone" ON icons;
CREATE POLICY "Public icons are viewable by everyone" ON icons
  FOR SELECT USING (true);

-- Tabela transaction_types - dados de referência (somente leitura pública)
ALTER TABLE transaction_types ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler tipos de transação
DROP POLICY IF EXISTS "Public transaction types are viewable by everyone" ON transaction_types;
CREATE POLICY "Public transaction types are viewable by everyone" ON transaction_types
  FOR SELECT USING (true);

-- =====================================================
-- 2. CORRIGIR FUNÇÃO update_updated_at_column
-- =====================================================

-- Recriar função com search_path seguro
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Verificar se RLS está habilitado
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('icons', 'transaction_types')
ORDER BY tablename;

-- Resultado esperado: rls_enabled = true para ambas as tabelas
