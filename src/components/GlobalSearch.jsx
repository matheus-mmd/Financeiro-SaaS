'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, TrendingUp, Target, DollarSign, Receipt } from 'lucide-react';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { formatCurrency, formatDate, fetchMock } from '../utils/mockApi';

/**
 * GlobalSearch - Componente de busca global na aplicação
 * Busca em transações, metas, investimentos e despesas
 */
export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState({
    transactions: [],
    targets: [],
    assets: [],
    expenses: [],
  });
  const router = useRouter();

  // Atalho de teclado Ctrl+K ou Cmd+K para abrir busca
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Buscar dados quando o termo de busca mudar
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults({ transactions: [], targets: [], assets: [], expenses: [] });
      return;
    }

    const term = searchTerm.toLowerCase();

    // Buscar nos dados mockados
    const searchInData = async () => {
      try {
        const [transactionsRes, targetsRes, assetsRes, expensesRes] = await Promise.all([
          fetchMock('/api/transactions'),
          fetchMock('/api/targets'),
          fetchMock('/api/assets'),
          fetchMock('/api/expenses'),
        ]);

        const transactions = transactionsRes.data;
        const targets = targetsRes.data;
        const assets = assetsRes.data;
        const expenses = expensesRes.data;

        const filteredTransactions = transactions.filter(t =>
          t.description?.toLowerCase().includes(term)
        ).slice(0, 5);

        const filteredTargets = targets.filter(t =>
          t.title?.toLowerCase().includes(term)
        ).slice(0, 5);

        const filteredAssets = assets.filter(a =>
          a.name?.toLowerCase().includes(term) || a.type?.toLowerCase().includes(term)
        ).slice(0, 5);

        const filteredExpenses = expenses.filter(e =>
          e.title?.toLowerCase().includes(term) || e.category?.toLowerCase().includes(term)
        ).slice(0, 5);

        setResults({
          transactions: filteredTransactions,
          targets: filteredTargets,
          assets: filteredAssets,
          expenses: filteredExpenses,
        });
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    searchInData();
  }, [searchTerm]);

  const handleClose = () => {
    setOpen(false);
    setSearchTerm('');
  };

  const handleNavigate = (path) => {
    handleClose();
    router.push(path);
  };

  const totalResults =
    results.transactions.length +
    results.targets.length +
    results.assets.length +
    results.expenses.length;

  return (
    <>
      {/* Campo de busca no header */}
      <div className="relative flex-1 max-w-md mx-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Buscar... (Ctrl+K)"
          className="pl-10 pr-4"
          onClick={() => setOpen(true)}
          readOnly
        />
      </div>

      {/* Dialog de resultados */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buscar na aplicação</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Campo de busca dentro do dialog */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Digite para buscar..."
                className="pl-10 pr-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            {/* Resultados */}
            {searchTerm.length >= 2 ? (
              totalResults > 0 ? (
                <div className="space-y-4">
                  {/* Transações */}
                  {results.transactions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Transações
                      </h3>
                      <div className="space-y-1">
                        {results.transactions.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => handleNavigate('/transacoes')}
                            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{t.description}</p>
                              <p className="text-sm text-gray-500">{formatDate(t.date)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(Math.abs(t.amount))}
                              </span>
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metas */}
                  {results.targets.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Metas
                      </h3>
                      <div className="space-y-1">
                        {results.targets.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => handleNavigate('/metas')}
                            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{t.title}</p>
                              <p className="text-sm text-gray-500">
                                {formatCurrency(t.progress)} / {formatCurrency(t.goal)}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Investimentos */}
                  {results.assets.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Investimentos
                      </h3>
                      <div className="space-y-1">
                        {results.assets.map((a) => (
                          <button
                            key={a.id}
                            onClick={() => handleNavigate('/investimentos')}
                            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{a.name}</p>
                              <p className="text-sm text-gray-500">{a.type}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(a.value)}
                              </span>
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Despesas */}
                  {results.expenses.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Receipt className="w-4 h-4" />
                        Despesas
                      </h3>
                      <div className="space-y-1">
                        {results.expenses.map((e) => (
                          <button
                            key={e.id}
                            onClick={() => handleNavigate('/despesas')}
                            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{e.title}</p>
                              <p className="text-sm text-gray-500">{e.category}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(e.amount)}
                              </span>
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhum resultado encontrado para "{searchTerm}"
                </div>
              )
            ) : (
              <div className="text-center py-8 text-gray-500">
                Digite pelo menos 2 caracteres para buscar
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
