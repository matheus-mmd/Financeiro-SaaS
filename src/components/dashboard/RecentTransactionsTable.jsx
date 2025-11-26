import { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import Table from '../Table';
import { formatCurrency, formatDate } from '../../formatters';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

export default function RecentTransactionsTable({
  transactions,
  transactionTypes,
  currentMonth,
  onRowClick
}) {
  const recentTransactions = useMemo(() => {
    const currentMonthTransactions = transactions.filter(t =>
      t.date.startsWith(currentMonth)
    );

    const sorted = [...currentMonthTransactions].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateB - dateA !== 0) {
        return dateB - dateA;
      }
      return Math.abs(b.amount) - Math.abs(a.amount);
    });

    return sorted.slice(0, 10);
  }, [transactions, currentMonth]);

  const getTransactionTypeByInternalName = (type) => {
    const typeMap = {
      credit: 1,
      debit: 2,
      investment: 3,
    };
    const typeId = typeMap[type];
    return transactionTypes.find(t => t.id === typeId);
  };

  const columns = [
    {
      key: 'description',
      label: 'Descrição',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Tipo',
      sortable: true,
      render: (row) => {
        const transactionType = getTransactionTypeByInternalName(row.type);
        const iconMap = {
          credit: ArrowUpRight,
          debit: ArrowDownRight,
          investment: TrendingUp,
        };
        const Icon = iconMap[row.type] || ArrowDownRight;

        return (
          <Badge
            variant="default"
            style={{
              backgroundColor: transactionType?.color || '#64748b',
              color: 'white',
            }}
          >
            <span className="flex items-center gap-1">
              <Icon className="w-3 h-3" />
              {transactionType?.name || 'Desconhecido'}
            </span>
          </Badge>
        );
      },
    },
    {
      key: 'amount',
      label: 'Valor',
      sortable: true,
      render: (row) => (
        <span>
          {formatCurrency(Math.abs(row.amount))}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Data',
      sortable: true,
      render: (row) => formatDate(row.date),
    },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Transações Recentes ({recentTransactions.length})
          </h2>
          <Link
            href="/transacoes"
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            Ver todas as transações →
          </Link>
        </div>
        {recentTransactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Nenhuma transação encontrada.
            </p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={recentTransactions}
            pageSize={10}
            onRowClick={onRowClick}
          />
        )}
      </CardContent>
    </Card>
  );
}