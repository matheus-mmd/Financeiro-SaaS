import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import BalanceCard from '../components/BalanceCard';
import Card from '../components/Card';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import DoughnutChart from '../components/charts/DoughnutChart';
import LineChart from '../components/charts/LineChart';
import ProgressBar from '../components/ProgressBar';
import { fetchMock, formatCurrency, formatDate } from '../utils/mockApi';
import { Wallet, TrendingDown, ArrowUpRight, Target, Eye } from 'lucide-react';

/**
 * Página Dashboard - Visão geral do controle financeiro
 * Exibe resumo mensal, gráficos de despesas e evolução, transações e metas
 */
export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [summaryRes, expensesRes, categoriesRes, transactionsRes, targetsRes] = await Promise.all([
          fetchMock('/api/summary'),
          fetchMock('/api/expenses'),
          fetchMock('/api/categories'),
          fetchMock('/api/transactions'),
          fetchMock('/api/targets'),
        ]);

        setSummary(summaryRes.data);
        setExpenses(expensesRes.data);
        setCategories(categoriesRes.data);
        setTransactions(transactionsRes.data);
        setTargets(targetsRes.data.filter(t => t.status === 'in_progress').slice(0, 2));
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // Preparar dados para gráfico de despesas por categoria
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.name === expense.category);
    if (existing) {
      existing.value += expense.amount;
    } else {
      // Buscar cor da categoria
      const category = categories.find(c => c.name === expense.category || c.id === expense.category.toLowerCase());
      acc.push({
        name: expense.category,
        value: expense.amount,
        color: category?.color || '#64748b'
      });
    }
    return acc;
  }, []);

  // Dados mockados para evolução de saldo (linha do tempo)
  const balanceEvolution = [
    { date: 'Ago', value: 15000 },
    { date: 'Set', value: 16200 },
    { date: 'Out', value: 17500 },
    { date: 'Nov', value: 18252 },
  ];

  // Configuração de colunas da tabela de transações
  const transactionColumns = [
    {
      key: 'date',
      label: 'Data',
      sortable: true,
      render: (row) => formatDate(row.date),
    },
    {
      key: 'description',
      label: 'Descrição',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (row) => (
        <Badge variant={row.type === 'credit' ? 'success' : 'error'}>
          {row.type === 'credit' ? 'Crédito' : 'Débito'}
        </Badge>
      ),
    },
    {
      key: 'amount',
      label: 'Valor',
      sortable: true,
      render: (row) => (
        <span className={row.type === 'credit' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
          {formatCurrency(Math.abs(row.amount))}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (row) => (
        <Link
          to="/transacoes"
          className="p-1 hover:bg-gray-100 rounded transition-colors inline-block"
          aria-label="Ver transação"
        >
          <Eye className="w-4 h-4 text-gray-600" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu controle financeiro"
      />

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BalanceCard
          title="Receita Líquida"
          amount={summary.income_net}
          icon={Wallet}
        />
        <BalanceCard
          title="Despesas Mensais"
          amount={summary.monthly_expenses_total}
          icon={TrendingDown}
        />
        <BalanceCard
          title="Saldo Disponível"
          amount={summary.available_balance}
          trend="up"
          icon={ArrowUpRight}
        />
        <BalanceCard
          title="Descontos Totais"
          amount={summary.discounts.total}
          subtitle={`Matheus: ${formatCurrency(summary.discounts.matheus)} | Nayanna: ${formatCurrency(summary.discounts.nayanna)}`}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de despesas por categoria */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Despesas por Categoria
          </h2>
          <div className="h-[300px] sm:h-[350px]">
            <DoughnutChart data={expensesByCategory} />
          </div>
        </Card>

        {/* Gráfico de evolução de saldo */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Evolução do Saldo
          </h2>
          <div className="h-[300px] sm:h-[350px]">
            <LineChart data={balanceEvolution} />
          </div>
        </Card>
      </div>

      {/* Metas em andamento (preview) */}
      {targets.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-500" />
              Metas em Andamento
            </h2>
            <Link to="/metas" className="text-sm text-brand-500 hover:text-brand-600 font-medium">
              Ver todas →
            </Link>
          </div>
          <div className="space-y-4">
            {targets.map(target => (
              <div key={target.id}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-900">{target.title}</h3>
                  <span className="text-sm text-gray-600">
                    {formatCurrency(target.progress)} / {formatCurrency(target.goal)}
                  </span>
                </div>
                <ProgressBar progress={target.progress} goal={target.goal} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tabela de transações */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Transações Recentes
        </h2>
        <Table
          columns={transactionColumns}
          data={transactions}
          pageSize={5}
        />
      </Card>
    </div>
  );
}
