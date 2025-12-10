// Script para gerar mockData.json melhorado
// Consolida expenses e incomes em transactions, adiciona campos novos e expande dados

const fs = require('fs');
const path = require('path');

// Ler mockData atual
const oldMockData = require('../src/data/mockData.backup.json');

const userId = "550e8400-e29b-41d4-a716-446655440000";

// Função auxiliar para gerar datas
function getDate(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getDateTime(year, month, day, hour = 10) {
  return `${getDate(year, month, day)}T${String(hour).padStart(2, '0')}:00:00Z`;
}

// Manter icons, transactionTypes, categories, users inalterados
const newMockData = {
  icons: oldMockData.icons,
  transactionTypes: oldMockData.transactionTypes,
  categories: oldMockData.categories,
  users: oldMockData.users,
  transactions: [],
  assets: [],
  targets: [],
  banks: [],
  cards: []
};

// ==========================================
// CONSOLIDAR EXPENSES E INCOMES EM TRANSACTIONS
// ==========================================

let transactionId = 1;

// Converter expenses para transactions
console.log('Convertendo expenses para transactions...');
oldMockData.expenses.forEach(expense => {
  newMockData.transactions.push({
    id: transactionId++,
    user_id: expense.user_id,
    category_id: expense.categories_id, // padronizado
    transaction_type_id: 2, // EXPENSE
    date: expense.date,
    description: expense.title,
    amount: -Math.abs(expense.amount), // negativo
    notes: null,
    status: expense.status || 'paid',
    payment_date: expense.paid_date || expense.date,
    payment_method: expense.payment_method || null,
    card_id: null, // adicionar depois manualmente se necessário
    bank_id: null,
    installments: expense.installments || null,
    installment_group_id: null,
    is_recurring: false,
    recurrence_frequency: null,
    recurrence_end_date: null,
    recurrence_parent_id: null,
    created_at: expense.created_at,
    updated_at: expense.updated_at,
    deleted_at: null
  });
});

// Converter incomes para transactions
console.log('Convertendo incomes para transactions...');
oldMockData.incomes.forEach(income => {
  newMockData.transactions.push({
    id: transactionId++,
    user_id: income.user_id,
    category_id: income.categories_id, // padronizado
    transaction_type_id: 1, // INCOME
    date: income.date,
    description: income.title,
    amount: Math.abs(income.amount), // positivo
    notes: null,
    status: 'paid', // incomes geralmente são pagos
    payment_date: income.date,
    payment_method: 'Transferência', // assumir padrão
    card_id: null,
    bank_id: null,
    installments: null,
    installment_group_id: null,
    is_recurring: false,
    recurrence_frequency: null,
    recurrence_end_date: null,
    recurrence_parent_id: null,
    created_at: income.created_at,
    updated_at: income.updated_at,
    deleted_at: null
  });
});

// Adicionar transactions já existentes (com campos novos)
console.log('Adicionando transactions existentes...');
oldMockData.transactions.forEach(tx => {
  newMockData.transactions.push({
    id: transactionId++,
    user_id: tx.user_id,
    category_id: tx.category_id,
    transaction_type_id: tx.transaction_type_id,
    date: tx.date,
    description: tx.description,
    amount: tx.amount,
    notes: tx.notes || null,
    status: tx.status || 'paid',
    payment_date: tx.date, // assumir pago na mesma data
    payment_method: tx.payment_method || null,
    card_id: null, // campos novos
    bank_id: null,
    installments: tx.installments || null,
    installment_group_id: null,
    is_recurring: tx.is_recurring || false,
    recurrence_frequency: tx.recurrence_frequency || null,
    recurrence_end_date: null,
    recurrence_parent_id: null,
    created_at: tx.created_at,
    updated_at: tx.updated_at,
    deleted_at: null
  });
});

// ==========================================
// EXPANDIR DADOS DE EXEMPLO - TRANSAÇÕES
// ==========================================

console.log('Expandindo transações com mais dados...');

// Adicionar transações de Janeiro a Junho 2025
const monthsToAdd = [
  { month: 1, salarioM: 2840.30, salarioN: 3517.20, despesas: 4200 },
  { month: 2, salarioM: 2840.30, salarioN: 3517.20, despesas: 3800 },
  { month: 3, salarioM: 2840.30, salarioN: 3517.20, despesas: 4500 },
  { month: 4, salarioM: 2840.30, salarioN: 3517.20, despesas: 3900 },
  { month: 5, salarioM: 2840.30, salarioN: 3517.20, despesas: 4100 },
  { month: 6, salarioM: 2840.30, salarioN: 3517.20, despesas: 4300 }
];

monthsToAdd.forEach(({ month, salarioM, salarioN, despesas }) => {
  // Salários
  newMockData.transactions.push({
    id: transactionId++,
    user_id: userId,
    category_id: 1, // Salário
    transaction_type_id: 1,
    date: getDate(2025, month, 1),
    description: "Salário Matheus",
    amount: salarioM,
    notes: null,
    status: "paid",
    payment_date: getDate(2025, month, 1),
    payment_method: "Transferência",
    card_id: null,
    bank_id: 1, // Nubank
    installments: null,
    installment_group_id: null,
    is_recurring: true,
    recurrence_frequency: "monthly",
    recurrence_end_date: null,
    recurrence_parent_id: null,
    created_at: getDateTime(2025, month, 1),
    updated_at: getDateTime(2025, month, 1),
    deleted_at: null
  });

  newMockData.transactions.push({
    id: transactionId++,
    user_id: userId,
    category_id: 1,
    transaction_type_id: 1,
    date: getDate(2025, month, 1),
    description: "Salário Nayanna",
    amount: salarioN,
    notes: null,
    status: "paid",
    payment_date: getDate(2025, month, 1),
    payment_method: "Transferência",
    card_id: null,
    bank_id: 2, // Inter
    installments: null,
    installment_group_id: null,
    is_recurring: true,
    recurrence_frequency: "monthly",
    recurrence_end_date: null,
    recurrence_parent_id: null,
    created_at: getDateTime(2025, month, 1),
    updated_at: getDateTime(2025, month, 1),
    deleted_at: null
  });

  // Despesas fixas
  newMockData.transactions.push({
    id: transactionId++,
    user_id: userId,
    category_id: 5, // Moradia
    transaction_type_id: 2,
    date: getDate(2025, month, 5),
    description: "Parcela do apartamento",
    amount: -1805.00,
    notes: null,
    status: "paid",
    payment_date: getDate(2025, month, 5),
    payment_method: "Débito Automático",
    card_id: null,
    bank_id: 1,
    installments: null,
    installment_group_id: null,
    is_recurring: true,
    recurrence_frequency: "monthly",
    recurrence_end_date: null,
    recurrence_parent_id: null,
    created_at: getDateTime(2025, month, 5),
    updated_at: getDateTime(2025, month, 5),
    deleted_at: null
  });

  newMockData.transactions.push({
    id: transactionId++,
    user_id: userId,
    category_id: 5,
    transaction_type_id: 2,
    date: getDate(2025, month, 7),
    description: "Condomínio",
    amount: -550.00,
    notes: null,
    status: "paid",
    payment_date: getDate(2025, month, 7),
    payment_method: "Boleto",
    card_id: null,
    bank_id: 1,
    installments: null,
    installment_group_id: null,
    is_recurring: true,
    recurrence_frequency: "monthly",
    recurrence_end_date: null,
    recurrence_parent_id: null,
    created_at: getDateTime(2025, month, 7),
    updated_at: getDateTime(2025, month, 7),
    deleted_at: null
  });

  // Utilities
  newMockData.transactions.push({
    id: transactionId++,
    user_id: userId,
    category_id: 14, // Utilities
    transaction_type_id: 2,
    date: getDate(2025, month, 10),
    description: "Água, luz e internet",
    amount: -300.00,
    notes: "Contas fixas",
    status: "paid",
    payment_date: getDate(2025, month, 10),
    payment_method: "Pix",
    card_id: null,
    bank_id: 1,
    installments: null,
    installment_group_id: null,
    is_recurring: true,
    recurrence_frequency: "monthly",
    recurrence_end_date: null,
    recurrence_parent_id: null,
    created_at: getDateTime(2025, month, 10),
    updated_at: getDateTime(2025, month, 10),
    deleted_at: null
  });

  // Assinaturas
  newMockData.transactions.push({
    id: transactionId++,
    user_id: userId,
    category_id: 11, // Assinaturas
    transaction_type_id: 2,
    date: getDate(2025, month, 15),
    description: "Netflix",
    amount: -49.90,
    notes: null,
    status: "paid",
    payment_date: getDate(2025, month, 15),
    payment_method: "Cartão de Crédito",
    card_id: 1, // Nubank
    bank_id: null,
    installments: null,
    installment_group_id: null,
    is_recurring: true,
    recurrence_frequency: "monthly",
    recurrence_end_date: null,
    recurrence_parent_id: null,
    created_at: getDateTime(2025, month, 15),
    updated_at: getDateTime(2025, month, 15),
    deleted_at: null
  });

  newMockData.transactions.push({
    id: transactionId++,
    user_id: userId,
    category_id: 11,
    transaction_type_id: 2,
    date: getDate(2025, month, 15),
    description: "Spotify",
    amount: -19.90,
    notes: null,
    status: "paid",
    payment_date: getDate(2025, month, 15),
    payment_method: "Cartão de Crédito",
    card_id: 1,
    bank_id: null,
    installments: null,
    installment_group_id: null,
    is_recurring: true,
    recurrence_frequency: "monthly",
    recurrence_end_date: null,
    recurrence_parent_id: null,
    created_at: getDateTime(2025, month, 15),
    updated_at: getDateTime(2025, month, 15),
    deleted_at: null
  });

  // Transporte
  newMockData.transactions.push({
    id: transactionId++,
    user_id: userId,
    category_id: 6, // Transporte
    transaction_type_id: 2,
    date: getDate(2025, month, 12),
    description: "Gasolina",
    amount: -250.00,
    notes: null,
    status: "paid",
    payment_date: getDate(2025, month, 12),
    payment_method: "Cartão de Débito",
    card_id: 2, // Inter Débito
    bank_id: null,
    installments: null,
    installment_group_id: null,
    is_recurring: false,
    recurrence_frequency: null,
    recurrence_end_date: null,
    recurrence_parent_id: null,
    created_at: getDateTime(2025, month, 12),
    updated_at: getDateTime(2025, month, 12),
    deleted_at: null
  });

  // Alimentação
  newMockData.transactions.push({
    id: transactionId++,
    user_id: userId,
    category_id: 7, // Alimentação
    transaction_type_id: 2,
    date: getDate(2025, month, 8),
    description: "Mercado do mês",
    amount: -850.00,
    notes: "Compras no supermercado",
    status: "paid",
    payment_date: getDate(2025, month, 8),
    payment_method: "Cartão de Crédito",
    card_id: 1,
    bank_id: null,
    installments: null,
    installment_group_id: null,
    is_recurring: false,
    recurrence_frequency: null,
    recurrence_end_date: null,
    recurrence_parent_id: null,
    created_at: getDateTime(2025, month, 8),
    updated_at: getDateTime(2025, month, 8),
    deleted_at: null
  });

  newMockData.transactions.push({
    id: transactionId++,
    user_id: userId,
    category_id: 7,
    transaction_type_id: 2,
    date: getDate(2025, month, 20),
    description: "Restaurante",
    amount: -180.00,
    notes: "Jantar no fim de semana",
    status: "paid",
    payment_date: getDate(2025, month, 20),
    payment_method: "Cartão de Crédito",
    card_id: 3, // Santander
    bank_id: null,
    installments: null,
    installment_group_id: null,
    is_recurring: false,
    recurrence_frequency: null,
    recurrence_end_date: null,
    recurrence_parent_id: null,
    created_at: getDateTime(2025, month, 20),
    updated_at: getDateTime(2025, month, 20),
    deleted_at: null
  });

  // Saúde (trimestral - apenas meses 3, 6, 9, 12)
  if (month % 3 === 0) {
    newMockData.transactions.push({
      id: transactionId++,
      user_id: userId,
      category_id: 8, // Saúde
      transaction_type_id: 2,
      date: getDate(2025, month, 18),
      description: "Consulta médica",
      amount: -200.00,
      notes: "Check-up trimestral",
      status: "paid",
      payment_date: getDate(2025, month, 18),
      payment_method: "Pix",
      card_id: null,
      bank_id: 1,
      installments: null,
      installment_group_id: null,
      is_recurring: false,
      recurrence_frequency: null,
      recurrence_end_date: null,
      recurrence_parent_id: null,
      created_at: getDateTime(2025, month, 18),
      updated_at: getDateTime(2025, month, 18),
      deleted_at: null
    });
  }

  // Despesas diversas
  newMockData.transactions.push({
    id: transactionId++,
    user_id: userId,
    category_id: 22, // Outros
    transaction_type_id: 2,
    date: getDate(2025, month, 25),
    description: "Despesas diversas",
    amount: -despesas,
    notes: null,
    status: "paid",
    payment_date: getDate(2025, month, 25),
    payment_method: "Dinheiro",
    card_id: null,
    bank_id: null,
    installments: null,
    installment_group_id: null,
    is_recurring: false,
    recurrence_frequency: null,
    recurrence_end_date: null,
    recurrence_parent_id: null,
    created_at: getDateTime(2025, month, 25),
    updated_at: getDateTime(2025, month, 25),
    deleted_at: null
  });

  // Investimento mensal
  newMockData.transactions.push({
    id: transactionId++,
    user_id: userId,
    category_id: 18, // Poupança
    transaction_type_id: 3,
    date: getDate(2025, month, 15),
    description: "Investimento poupança",
    amount: -1109.50,
    notes: "Aporte mensal",
    status: "paid",
    payment_date: getDate(2025, month, 15),
    payment_method: "Pix",
    card_id: null,
    bank_id: 3, // Caixa
    installments: null,
    installment_group_id: null,
    is_recurring: true,
    recurrence_frequency: "monthly",
    recurrence_end_date: null,
    recurrence_parent_id: null,
    created_at: getDateTime(2025, month, 15),
    updated_at: getDateTime(2025, month, 15),
    deleted_at: null
  });
});

// Adicionar parcelamentos (iPhone em 12x começando em Janeiro)
const installmentGroupId1 = 1;
for (let i = 1; i <= 12; i++) {
  newMockData.transactions.push({
    id: transactionId++,
    user_id: userId,
    category_id: 15, // Compras
    transaction_type_id: 2,
    date: getDate(2025, i, 5),
    description: "iPhone 15 Pro",
    amount: -416.58,
    notes: `Parcela ${i}/12`,
    status: i <= 12 ? "paid" : "pending",
    payment_date: i <= 12 ? getDate(2025, i, 5) : null,
    payment_method: "Cartão de Crédito",
    card_id: 1,
    bank_id: null,
    installments: { current: i, total: 12 },
    installment_group_id: installmentGroupId1,
    is_recurring: false,
    recurrence_frequency: null,
    recurrence_end_date: null,
    recurrence_parent_id: null,
    created_at: getDateTime(2025, 1, 5),
    updated_at: getDateTime(2025, i, 5),
    deleted_at: null
  });
}

// ==========================================
// ASSETS COM CAMPOS NOVOS
// ==========================================

console.log('Criando assets com campos novos...');

newMockData.assets = [
  {
    id: 1,
    user_id: userId,
    category_id: 18, // Poupança (padronizado)
    name: "Poupança Matheus",
    value: 52752.00,
    yield: 0.005,
    currency: "BRL",
    date: "2025-12-01",
    description: "Poupança principal para emergências",
    purchase_date: "2023-01-01",
    purchase_value: 40000.00,
    created_at: "2025-12-01T10:00:00Z",
    updated_at: "2025-12-01T10:00:00Z",
    deleted_at: null
  },
  {
    id: 2,
    user_id: userId,
    category_id: 18,
    name: "Poupança Nayanna",
    value: 64500.00,
    yield: 0.005,
    currency: "BRL",
    date: "2025-12-01",
    description: "Poupança para metas de longo prazo",
    purchase_date: "2023-01-01",
    purchase_value: 50000.00,
    created_at: "2025-12-01T10:00:00Z",
    updated_at: "2025-12-01T10:00:00Z",
    deleted_at: null
  },
  {
    id: 3,
    user_id: userId,
    category_id: 25, // FGTS
    name: "FGTS Matheus",
    value: 5000.00,
    yield: 0.003,
    currency: "BRL",
    date: "2025-12-01",
    description: "Fundo de Garantia",
    purchase_date: "2020-01-01",
    purchase_value: 3000.00,
    created_at: "2025-12-01T10:00:00Z",
    updated_at: "2025-12-01T10:00:00Z",
    deleted_at: null
  },
  {
    id: 4,
    user_id: userId,
    category_id: 25,
    name: "FGTS Nayanna",
    value: 1000.00,
    yield: 0.003,
    currency: "BRL",
    date: "2025-12-01",
    description: "Fundo de Garantia",
    purchase_date: "2022-01-01",
    purchase_value: 500.00,
    created_at: "2025-12-01T10:00:00Z",
    updated_at: "2025-12-01T10:00:00Z",
    deleted_at: null
  },
  {
    id: 5,
    user_id: userId,
    category_id: 24, // Tesouro Direto
    name: "Tesouro Selic 2027",
    value: 15000.00,
    yield: 0.0095,
    currency: "BRL",
    date: "2025-12-01",
    description: "Investimento em renda fixa",
    purchase_date: "2024-06-01",
    purchase_value: 14000.00,
    created_at: "2025-12-01T10:00:00Z",
    updated_at: "2025-12-01T10:00:00Z",
    deleted_at: null
  },
  {
    id: 6,
    user_id: userId,
    category_id: 23, // CDB
    name: "CDB Banco Inter 120% CDI",
    value: 8000.00,
    yield: 0.011,
    currency: "BRL",
    date: "2025-12-01",
    description: "CDB com liquidez após 90 dias",
    purchase_date: "2024-09-01",
    purchase_value: 7500.00,
    created_at: "2025-12-01T10:00:00Z",
    updated_at: "2025-12-01T10:00:00Z",
    deleted_at: null
  },
  {
    id: 7,
    user_id: userId,
    category_id: 19, // Ações
    name: "Ações ITSA4",
    value: 5500.00,
    yield: 0.015,
    currency: "BRL",
    date: "2025-12-01",
    description: "Itaúsa - 500 ações",
    purchase_date: "2024-03-15",
    purchase_value: 4000.00,
    created_at: "2025-12-01T10:00:00Z",
    updated_at: "2025-12-01T10:00:00Z",
    deleted_at: null
  },
  {
    id: 8,
    user_id: userId,
    category_id: 20, // Fundos
    name: "Fundo Imobiliário HGLG11",
    value: 3200.00,
    yield: 0.007,
    currency: "BRL",
    date: "2025-12-01",
    description: "100 cotas de FII",
    purchase_date: "2024-07-01",
    purchase_value: 3000.00,
    created_at: "2025-12-01T10:00:00Z",
    updated_at: "2025-12-01T10:00:00Z",
    deleted_at: null
  },
  {
    id: 9,
    user_id: userId,
    category_id: 21, // Criptomoedas
    name: "Bitcoin",
    value: 2000.00,
    yield: 0.05,
    currency: "BRL",
    date: "2025-12-01",
    description: "0.008 BTC",
    purchase_date: "2024-01-15",
    purchase_value: 1500.00,
    created_at: "2025-12-01T10:00:00Z",
    updated_at: "2025-12-01T10:00:00Z",
    deleted_at: null
  }
];

// ==========================================
// TARGETS COM CAMPOS NOVOS
// ==========================================

console.log('Criando targets com campos novos...');

newMockData.targets = [
  {
    id: 1,
    user_id: userId,
    title: "Entrada + Documentação (imóvel)",
    goal: 80000.00,
    progress: 80000.00,
    status: "completed",
    date: "2025-01-01",
    category_id: 5, // Moradia
    deadline: "2025-06-01",
    monthly_target: 0, // já completa
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-06-01T10:00:00Z",
    deleted_at: null
  },
  {
    id: 2,
    user_id: userId,
    title: "Reserva de emergência (6 meses)",
    goal: 25000.00,
    progress: 10500.00,
    status: "in_progress",
    date: "2025-01-01",
    category_id: 18, // Poupança
    deadline: "2026-12-31",
    monthly_target: 700.00,
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-12-01T10:00:00Z",
    deleted_at: null
  },
  {
    id: 3,
    user_id: userId,
    title: "Fundo Viagem Europa 2026",
    goal: 8000.00,
    progress: 1250.00,
    status: "in_progress",
    date: "2025-01-01",
    category_id: 10, // Lazer
    deadline: "2026-06-01",
    monthly_target: 375.00,
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-12-01T10:00:00Z",
    deleted_at: null
  },
  {
    id: 4,
    user_id: userId,
    title: "Notebook novo",
    goal: 5000.00,
    progress: 800.00,
    status: "in_progress",
    date: "2025-06-01",
    category_id: 15, // Compras
    deadline: "2026-01-31",
    monthly_target: 600.00,
    created_at: "2025-06-01T10:00:00Z",
    updated_at: "2025-12-01T10:00:00Z",
    deleted_at: null
  },
  {
    id: 5,
    user_id: userId,
    title: "Trocar de carro",
    goal: 60000.00,
    progress: 8000.00,
    status: "in_progress",
    date: "2025-03-01",
    category_id: 6, // Transporte
    deadline: "2027-12-31",
    monthly_target: 1500.00,
    created_at: "2025-03-01T10:00:00Z",
    updated_at: "2025-12-01T10:00:00Z",
    deleted_at: null
  },
  {
    id: 6,
    user_id: userId,
    title: "Casamento",
    goal: 50000.00,
    progress: 12000.00,
    status: "in_progress",
    date: "2024-06-01",
    category_id: 12, // Família
    deadline: "2026-12-31",
    monthly_target: 1500.00,
    created_at: "2024-06-01T10:00:00Z",
    updated_at: "2025-12-01T10:00:00Z",
    deleted_at: null
  }
];

// ==========================================
// BANKS COM CURRENT_BALANCE
// ==========================================

console.log('Criando banks com current_balance...');

newMockData.banks = [
  {
    id: 1,
    user_id: userId,
    name: "Nubank",
    icon_id: 1,
    color: "#8A05BE",
    agency: "0001",
    account: "12345678-9",
    account_type: "corrente",
    initial_balance: 5000.00,
    current_balance: 6850.50, // calculado ou manual
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-12-09T15:30:00Z",
    deleted_at: null
  },
  {
    id: 2,
    user_id: userId,
    name: "Banco Inter",
    icon_id: 2,
    color: "#FF7A00",
    agency: "0001",
    account: "98765432-1",
    account_type: "poupanca",
    initial_balance: 3000.00,
    current_balance: 4250.00,
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-12-09T15:30:00Z",
    deleted_at: null
  },
  {
    id: 3,
    user_id: userId,
    name: "Caixa Econômica",
    icon_id: 75,
    color: "#0066B3",
    agency: "1234",
    account: "00012345-6",
    account_type: "poupanca",
    initial_balance: 10000.00,
    current_balance: 11500.00,
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-12-09T15:30:00Z",
    deleted_at: null
  },
  {
    id: 4,
    user_id: userId,
    name: "PagBank",
    icon_id: 1,
    color: "#00C13E",
    agency: "0001",
    account: "11223344-5",
    account_type: "pagamento",
    initial_balance: 1000.00,
    current_balance: 2350.75,
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-12-09T15:30:00Z",
    deleted_at: null
  }
];

// ==========================================
// CARDS COM CURRENT_BALANCE
// ==========================================

console.log('Criando cards com current_balance...');

newMockData.cards = [
  {
    id: 1,
    user_id: userId,
    name: "Nubank Crédito",
    icon_id: 4,
    color: "#8A05BE",
    card_type: "credito",
    card_brand: "Mastercard",
    limit: 5000.00,
    closing_day: 10,
    due_day: 17,
    bank_id: 1,
    current_balance: 1850.38, // quanto já gastou este mês (37%)
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-12-09T15:30:00Z",
    deleted_at: null
  },
  {
    id: 2,
    user_id: userId,
    name: "Inter Débito",
    icon_id: 4,
    color: "#FF7A00",
    card_type: "debito",
    card_brand: "Visa",
    limit: null,
    closing_day: null,
    due_day: null,
    bank_id: 2,
    current_balance: 0, // débito não tem limite/saldo
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-12-09T15:30:00Z",
    deleted_at: null
  },
  {
    id: 3,
    user_id: userId,
    name: "Santander Black",
    icon_id: 4,
    color: "#EC0000",
    card_type: "credito",
    card_brand: "Visa",
    limit: 8000.00,
    closing_day: 15,
    due_day: 22,
    bank_id: null,
    current_balance: 2450.00, // 30.6% do limite
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-12-09T15:30:00Z",
    deleted_at: null
  },
  {
    id: 4,
    user_id: userId,
    name: "BTG+ Black",
    icon_id: 4,
    color: "#000000",
    card_type: "credito",
    card_brand: "Mastercard",
    limit: 10000.00,
    closing_day: 25,
    due_day: 5,
    bank_id: null,
    current_balance: 3450.00, // 34.5% do limite
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-12-09T15:30:00Z",
    deleted_at: null
  },
  {
    id: 5,
    user_id: userId,
    name: "C6 Carbon",
    icon_id: 4,
    color: "#1E1E1E",
    card_type: "credito",
    card_brand: "Mastercard",
    limit: 3000.00,
    closing_day: 5,
    due_day: 12,
    bank_id: null,
    current_balance: 890.50, // 29.7% do limite
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-12-09T15:30:00Z",
    deleted_at: null
  }
];

// ==========================================
// SALVAR ARQUIVO
// ==========================================

const outputPath = path.join(__dirname, '../src/data/mockData.json');
fs.writeFileSync(outputPath, JSON.stringify(newMockData, null, 2), 'utf-8');

console.log('\n✅ mockData.json atualizado com sucesso!');
console.log(`📊 Estatísticas:`);
console.log(`   - Transações: ${newMockData.transactions.length}`);
console.log(`   - Assets: ${newMockData.assets.length}`);
console.log(`   - Targets: ${newMockData.targets.length}`);
console.log(`   - Banks: ${newMockData.banks.length}`);
console.log(`   - Cards: ${newMockData.cards.length}`);
console.log(`   - Categorias: ${newMockData.categories.length}`);
console.log(`   - Ícones: ${newMockData.icons.length}`);
console.log(`\n❌ Removido: expenses e incomes (consolidados em transactions)`);
