/**
 * Constantes do sistema financeiro
 * Centraliza valores que são usados em múltiplos lugares
 */

// ========================================
// METAS E LIMITES FINANCEIROS
// ========================================

/** Meta padrão de taxa de poupança (%) */
export const DEFAULT_SAVINGS_GOAL_PERCENTAGE = 20;

/** Limiar mínimo para taxa de poupança ser considerada boa (%) */
export const MIN_GOOD_SAVINGS_RATE = 10;

/** Limiar para taxa de poupança ser considerada excelente (%) */
export const EXCELLENT_SAVINGS_RATE = 20;

/** Limiar máximo de despesas em relação à receita (%) */
export const MAX_EXPENSE_RATIO = 70;

/** Meses mínimos de runway para segurança financeira */
export const MIN_RUNWAY_MONTHS = 3;

/** Meses de histórico para cálculo de média de despesas */
export const EXPENSE_HISTORY_MONTHS = 3;

// ========================================
// REGRA 50/30/20
// ========================================

/** Porcentagem recomendada para essenciais */
export const BUDGET_RULE_ESSENTIALS = 50;

/** Porcentagem recomendada para pessoais/desejos */
export const BUDGET_RULE_PERSONAL = 30;

/** Porcentagem recomendada para poupança */
export const BUDGET_RULE_SAVINGS = 20;

/** Categorias consideradas essenciais */
export const ESSENTIAL_CATEGORIES = ['Moradia', 'Transporte', 'Alimentação', 'Saúde'];

/** Categorias consideradas pessoais/desejos */
export const PERSONAL_CATEGORIES = ['Lazer', 'Educação', 'Outros'];

// ========================================
// ALERTAS E THRESHOLDS
// ========================================

/** Aumento percentual de despesas para gerar alerta crítico */
export const EXPENSE_INCREASE_ALERT_THRESHOLD = 1.2; // 20% acima

/** Aumento percentual de categoria para gerar alerta */
export const CATEGORY_INCREASE_ALERT_THRESHOLD = 40;

/** Saldo baixo para gerar alerta (R$) */
export const LOW_BALANCE_ALERT_THRESHOLD = 500;

/** Dias mínimos restantes para considerar alerta de saldo baixo */
export const LOW_BALANCE_MIN_DAYS_REMAINING = 5;

// ========================================
// PONTUAÇÃO DE SAÚDE FINANCEIRA
// ========================================

/** Pontos para cada critério do health score */
export const HEALTH_SCORE_POINTS = {
  BALANCE_POSITIVE: 25,
  SAVINGS_RATE: 25,
  EXPENSE_RATIO: 25,
  RUNWAY: 25,
};

// ========================================
// PAGINAÇÃO
// ========================================

/** Tamanho padrão de página para tabelas */
export const DEFAULT_PAGE_SIZE = 10;

/** Limite de itens para exibição em listas resumidas */
export const SUMMARY_LIST_LIMIT = 5;

// ========================================
// CORES PADRÃO
// ========================================

/** Cor padrão para categorias sem cor definida */
export const DEFAULT_CATEGORY_COLOR = '#64748b';

/** Cores por tipo de transação */
export const TRANSACTION_TYPE_COLORS = {
  income: '#10b981',   // verde
  expense: '#ef4444',  // vermelho
  investment: '#3b82f6', // azul
};

// ========================================
// TIPOS DE TRANSAÇÃO (internal_name)
// ========================================

export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
  INVESTMENT: 'investment',
};

// ========================================
// IDs DE TIPO DE TRANSAÇÃO
// ========================================

export const TRANSACTION_TYPE_IDS = {
  INCOME: 1,
  EXPENSE: 2,
  INVESTMENT: 3,
};

// ========================================
// FORMAS DE PAGAMENTO
// ========================================

export const PAYMENT_METHODS = [
  'Dinheiro',
  'Pix',
  'Débito Automático',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Boleto',
  'Transferência',
];

// ========================================
// STATUS DE METAS
// ========================================

export const GOAL_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};