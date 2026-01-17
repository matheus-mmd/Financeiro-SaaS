-- =====================================================
-- Migration: 020_create_plans_table.sql
-- Description: Cria tabela de planos de assinatura
-- =====================================================

-- Tabela de planos
CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,

    -- Preços (em centavos para evitar problemas com decimais)
    price_monthly_cents INTEGER NOT NULL DEFAULT 0,
    price_yearly_cents INTEGER NOT NULL DEFAULT 0,
    price_original_monthly_cents INTEGER DEFAULT NULL,
    price_original_yearly_cents INTEGER DEFAULT NULL,

    -- Configurações
    is_recommended BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,

    -- Badge customizado (ex: "Grátis", "Mais Popular")
    badge_text VARCHAR(50) DEFAULT NULL,
    badge_color VARCHAR(20) DEFAULT NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de funcionalidades dos planos
CREATE TABLE IF NOT EXISTS plan_features (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    feature_text TEXT NOT NULL,
    is_highlighted BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_plans_active ON plans(is_active);
CREATE INDEX IF NOT EXISTS idx_plans_order ON plans(display_order);
CREATE INDEX IF NOT EXISTS idx_plan_features_plan_id ON plan_features(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_features_order ON plan_features(display_order);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_plans_updated_at
    BEFORE UPDATE ON plans
    FOR EACH ROW
    EXECUTE FUNCTION update_plans_updated_at();

-- =====================================================
-- SEED DATA: Planos iniciais
-- =====================================================

-- Inserir plano BASIC
INSERT INTO plans (name, slug, description, price_monthly_cents, price_yearly_cents, price_original_monthly_cents, price_original_yearly_cents, is_recommended, display_order, badge_text)
VALUES (
    'BASIC',
    'basic',
    'Para organizar seus gastos',
    590,      -- R$ 5,90/mês
    2597,     -- R$ 25,97/ano
    NULL,     -- Sem preço original (sem desconto)
    7080,     -- R$ 70,80 original anual
    FALSE,
    1,
    NULL
);

-- Inserir plano PRO
INSERT INTO plans (name, slug, description, price_monthly_cents, price_yearly_cents, price_original_monthly_cents, price_original_yearly_cents, is_recommended, display_order, badge_text, badge_color)
VALUES (
    'PRO',
    'pro',
    'Para tomar decisões financeiras melhores com ajuda da IA',
    1490,     -- R$ 14,90/mês
    6990,     -- R$ 69,90/ano
    NULL,     -- Sem preço original mensal
    17880,    -- R$ 178,80 original anual
    TRUE,
    2,
    'RECOMENDADO',
    'brand'
);

-- =====================================================
-- SEED DATA: Funcionalidades do plano BASIC
-- =====================================================

INSERT INTO plan_features (plan_id, feature_text, is_highlighted, display_order) VALUES
((SELECT id FROM plans WHERE slug = 'basic'), 'Controle de receitas e despesas', FALSE, 1),
((SELECT id FROM plans WHERE slug = 'basic'), 'Conta individual ou conjunta', FALSE, 2),
((SELECT id FROM plans WHERE slug = 'basic'), 'Importação de fatura com IA', FALSE, 3),
((SELECT id FROM plans WHERE slug = 'basic'), 'Gráficos e relatórios', FALSE, 4),
((SELECT id FROM plans WHERE slug = 'basic'), 'Transações recorrentes', FALSE, 5),
((SELECT id FROM plans WHERE slug = 'basic'), 'App para Android e iOS', FALSE, 6);

-- =====================================================
-- SEED DATA: Funcionalidades do plano PRO
-- =====================================================

INSERT INTO plan_features (plan_id, feature_text, is_highlighted, display_order) VALUES
((SELECT id FROM plans WHERE slug = 'pro'), 'Tudo do plano BASIC', FALSE, 1),
((SELECT id FROM plans WHERE slug = 'pro'), 'Assistente IA via WhatsApp', TRUE, 2),
((SELECT id FROM plans WHERE slug = 'pro'), 'Metas financeiras com acompanhamento', FALSE, 3),
((SELECT id FROM plans WHERE slug = 'pro'), 'Orçamento por categoria', FALSE, 4),
((SELECT id FROM plans WHERE slug = 'pro'), 'Comparativo mensal detalhado', FALSE, 5),
((SELECT id FROM plans WHERE slug = 'pro'), 'Insights personalizados com IA', FALSE, 6),
((SELECT id FROM plans WHERE slug = 'pro'), 'Controle total pelo WhatsApp + Insights com IA!', TRUE, 7);

-- =====================================================
-- RLS Policies (tabelas públicas, apenas leitura)
-- =====================================================

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública dos planos ativos
CREATE POLICY "Planos ativos são públicos"
    ON plans FOR SELECT
    USING (is_active = TRUE);

-- Permitir leitura pública das funcionalidades
CREATE POLICY "Funcionalidades são públicas"
    ON plan_features FOR SELECT
    USING (TRUE);

-- Comentários
COMMENT ON TABLE plans IS 'Planos de assinatura disponíveis';
COMMENT ON TABLE plan_features IS 'Funcionalidades incluídas em cada plano';
COMMENT ON COLUMN plans.price_monthly_cents IS 'Preço mensal em centavos (ex: 590 = R$ 5,90)';
COMMENT ON COLUMN plans.price_yearly_cents IS 'Preço anual em centavos (ex: 2597 = R$ 25,97)';