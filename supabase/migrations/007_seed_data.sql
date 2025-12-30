-- ============================================
-- MIGRATION 007: SEED DATA
-- Dados iniciais do sistema
-- ============================================

-- ============================================
-- SEED: icons (94 ícones do Lucide React)
-- ============================================
INSERT INTO public.icons (id, name) VALUES
(1, 'Wallet'), (2, 'DollarSign'), (3, 'CircleDollarSign'), (4, 'CreditCard'),
(5, 'Banknote'), (6, 'PiggyBank'), (7, 'Coins'), (8, 'TrendingUp'),
(9, 'TrendingDown'), (10, 'Receipt'), (11, 'Home'), (12, 'Building'),
(13, 'Building2'), (14, 'Warehouse'), (15, 'Key'), (16, 'Hotel'),
(17, 'Car'), (18, 'Bus'), (19, 'Bike'), (20, 'Plane'),
(21, 'Train'), (22, 'Ship'), (23, 'Fuel'), (24, 'ParkingCircle'),
(25, 'Utensils'), (26, 'Coffee'), (27, 'Pizza'), (28, 'Apple'),
(29, 'ShoppingCart'), (30, 'Beef'), (31, 'IceCream'), (32, 'Heart'),
(33, 'Activity'), (34, 'Pill'), (35, 'Stethoscope'), (36, 'Thermometer'),
(37, 'Dumbbell'), (38, 'Accessibility'), (39, 'GraduationCap'), (40, 'BookOpen'),
(41, 'Briefcase'), (42, 'Laptop'), (43, 'BookMarked'), (44, 'School'),
(45, 'Backpack'), (46, 'Film'), (47, 'Music'), (48, 'Gamepad2'),
(49, 'PartyPopper'), (50, 'Camera'), (51, 'Tv'), (52, 'Headphones'),
(53, 'ShoppingBag'), (54, 'Gift'), (55, 'Package'), (56, 'Shirt'),
(57, 'Watch'), (58, 'ShoppingBasket'), (59, 'Store'), (60, 'Wrench'),
(61, 'Hammer'), (62, 'Settings'), (63, 'Zap'), (64, 'Droplet'),
(65, 'Wifi'), (66, 'Phone'), (67, 'Smartphone'), (68, 'Users'),
(69, 'Baby'), (70, 'Dog'), (71, 'Cat'), (72, 'FileText'),
(73, 'Calculator'), (74, 'Scale'), (75, 'Landmark'), (76, 'BadgeDollarSign'),
(77, 'LineChart'), (78, 'BarChart3'), (79, 'PieChart'), (80, 'Target'),
(81, 'Gem'), (82, 'Lock'), (83, 'Shield'), (84, 'Tag'),
(85, 'Star'), (86, 'CheckCircle'), (87, 'AlertCircle'), (88, 'HelpCircle'),
(89, 'Info'), (90, 'Calendar'), (91, 'Clock'), (92, 'MapPin'),
(93, 'Globe'), (94, 'MessageCircle')
ON CONFLICT (id) DO NOTHING;

SELECT setval('public.icons_id_seq', 94, true);

-- ============================================
-- SEED: transaction_types
-- ============================================
INSERT INTO public.transaction_types (id, name, internal_name, color) VALUES
(1, 'Receita', 'income', '#22c55e'),
(2, 'Despesa', 'expense', '#ef4444'),
(3, 'Aporte', 'investment', '#3b82f6')
ON CONFLICT (id) DO NOTHING;

SELECT setval('public.transaction_types_id_seq', 3, true);

-- ============================================
-- SEED: payment_statuses
-- ============================================
INSERT INTO public.payment_statuses (id, name, internal_name, color) VALUES
(1, 'Pendente', 'pending', '#f59e0b'),
(2, 'Pago', 'paid', '#10b981'),
(3, 'Atrasado', 'overdue', '#ef4444'),
(4, 'Cancelado', 'cancelled', '#6b7280')
ON CONFLICT (id) DO NOTHING;

SELECT setval('public.payment_statuses_id_seq', 4, true);

-- ============================================
-- SEED: payment_methods
-- ============================================
INSERT INTO public.payment_methods (id, name, requires_card, requires_bank) VALUES
(1, 'Dinheiro', false, false),
(2, 'Pix', false, true),
(3, 'Débito Automático', false, true),
(4, 'Cartão de Crédito', true, false),
(5, 'Cartão de Débito', true, false),
(6, 'Boleto', false, false),
(7, 'Transferência', false, true)
ON CONFLICT (id) DO NOTHING;

SELECT setval('public.payment_methods_id_seq', 7, true);

-- ============================================
-- SEED: recurrence_frequencies
-- ============================================
INSERT INTO public.recurrence_frequencies (id, name, internal_name) VALUES
(1, 'Diário', 'daily'),
(2, 'Semanal', 'weekly'),
(3, 'Mensal', 'monthly'),
(4, 'Anual', 'yearly')
ON CONFLICT (id) DO NOTHING;

SELECT setval('public.recurrence_frequencies_id_seq', 4, true);

-- ============================================
-- SEED: account_types
-- ============================================
INSERT INTO public.account_types (id, name, internal_name) VALUES
(1, 'Conta Corrente', 'corrente'),
(2, 'Conta Poupança', 'poupanca'),
(3, 'Conta Pagamento', 'pagamento'),
(4, 'Conta Investimento', 'investimento')
ON CONFLICT (id) DO NOTHING;

SELECT setval('public.account_types_id_seq', 4, true);

-- ============================================
-- SEED: card_types
-- ============================================
INSERT INTO public.card_types (id, name, internal_name) VALUES
(1, 'Cartão de Crédito', 'credito'),
(2, 'Cartão de Débito', 'debito'),
(3, 'Cartão Múltiplo', 'multiplo')
ON CONFLICT (id) DO NOTHING;

SELECT setval('public.card_types_id_seq', 3, true);

-- ============================================
-- SEED: card_brands
-- ============================================
INSERT INTO public.card_brands (id, name) VALUES
(1, 'Visa'),
(2, 'Mastercard'),
(3, 'Elo'),
(4, 'American Express'),
(5, 'Hipercard'),
(6, 'Diners Club')
ON CONFLICT (id) DO NOTHING;

SELECT setval('public.card_brands_id_seq', 6, true);

-- ============================================
-- SEED: categories (25 categorias padrão do sistema)
-- user_id = NULL significa categoria do sistema (visível para todos)
-- ============================================
INSERT INTO public.categories (id, name, color, icon_id, transaction_type_id, user_id) VALUES
-- RECEITAS (transaction_type_id = 1)
(1, 'Salário', '#10b981', 1, 1, NULL),
(2, 'Freelance', '#3b82f6', 41, 1, NULL),
(3, 'Investimentos', '#8b5cf6', 8, 1, NULL),
(4, 'Reembolsos', '#f59e0b', 10, 1, NULL),

-- DESPESAS (transaction_type_id = 2)
(5, 'Moradia', '#3b82f6', 11, 2, NULL),
(6, 'Transporte', '#ef4444', 17, 2, NULL),
(7, 'Alimentação', '#10b981', 25, 2, NULL),
(8, 'Saúde', '#f59e0b', 32, 2, NULL),
(9, 'Educação', '#8b5cf6', 39, 2, NULL),
(10, 'Lazer', '#ec4899', 48, 2, NULL),
(11, 'Assinaturas', '#06b6d4', 67, 2, NULL),
(12, 'Família', '#f97316', 68, 2, NULL),
(13, 'Crédito', '#6366f1', 4, 2, NULL),
(14, 'Utilities', '#84cc16', 63, 2, NULL),
(15, 'Compras', '#ec4899', 53, 2, NULL),
(16, 'Serviços', '#06b6d4', 60, 2, NULL),
(17, 'Impostos', '#f97316', 73, 2, NULL),
(22, 'Outros', '#64748b', 84, 2, NULL),

-- PATRIMÔNIO/INVESTIMENTOS (transaction_type_id = 3)
(18, 'Poupança', '#22c55e', 6, 3, NULL),
(19, 'Ações', '#ef4444', 77, 3, NULL),
(20, 'Fundos', '#8b5cf6', 78, 3, NULL),
(21, 'Criptomoedas', '#ec4899', 7, 3, NULL),
(23, 'CDB', '#3b82f6', 76, 3, NULL),
(24, 'Tesouro Direto', '#f59e0b', 75, 3, NULL),
(25, 'FGTS', '#10b981', 83, 3, NULL)
ON CONFLICT (id) DO NOTHING;

SELECT setval('public.categories_id_seq', 25, true);