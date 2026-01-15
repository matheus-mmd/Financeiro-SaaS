"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  TrendingUp,
  Target,
  DollarSign,
} from "lucide-react";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { formatCurrency, formatDate } from "../utils";
import { useDebounce } from "../hooks/useDebounce";
import { useAuth } from "../contexts/AuthContext";
import { getSearchDataset } from "../lib/supabase/api/search";

/**
 * GlobalSearch - Componente de busca global na aplicação
 * Busca em transações, metas e patrimônio e ativos
 * OTIMIZADO: Usa debounce para evitar chamadas excessivas de API
 */
export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { user, loading: authLoading, signOut } = useAuth();
  const [results, setResults] = useState({
    transactions: [],
    targets: [],
    assets: [],
  });
  const [dataset, setDataset] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const router = useRouter();

  const handleAuthFailure = useCallback(async () => {
    await signOut();
    router.replace('/');
  }, [router, signOut]);

  // Atalho de teclado Ctrl+K ou Cmd+K para abrir busca
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (authLoading) return;

    if (!user) {
      setOpen(false);
      setDataset(null);
      setResults({ transactions: [], targets: [], assets: [] });
      router.replace('/');
    }
  }, [open, authLoading, user, router]);

  // Carregar dataset uma única vez quando a busca é aberta e usuário autenticado
  useEffect(() => {
    if (!open || authLoading || !user || dataset) return;

    let isMounted = true;
    setLoadingData(true);

    const loadDataset = async () => {
      try {
        const { data, error } = await getSearchDataset();

        if (error?.code === 'AUTH_REQUIRED') {
          await handleAuthFailure();
          return;
        }

        if (!isMounted) return;

        setDataset(data);

        if (error) {
          console.warn("[GlobalSearch] Dados carregados com erro parcial:", error);
        }
      } catch (error) {
        if (error?.code === 'AUTH_REQUIRED') {
          await handleAuthFailure();
        } else {
          console.error("Erro ao carregar dados de busca:", error);
        }
      } finally {
        if (isMounted) {
          setLoadingData(false);
        }
      }
    };

    loadDataset();

    return () => {
      isMounted = false;
    };
  }, [open, authLoading, user, dataset]);

  // Resetar dataset quando usuário desloga
  useEffect(() => {
    if (!user) {
      setDataset(null);
      setResults({ transactions: [], targets: [], assets: [] });
    }
  }, [user]);

  // Buscar nos dados já carregados quando o termo de busca debounced mudar
  useEffect(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
      setResults({ transactions: [], targets: [], assets: [] });
      return;
    }

    if (!dataset) return;

    const term = debouncedSearchTerm.toLowerCase();

    const filteredTransactions = dataset.transactions
      .filter((t) => t.description?.toLowerCase().includes(term))
      .slice(0, 5);

    const filteredTargets = dataset.targets
      .filter((t) => t.title?.toLowerCase().includes(term))
      .slice(0, 5);

    const filteredAssets = dataset.assets
      .filter(
        (a) =>
          a.name?.toLowerCase().includes(term) ||
          a.type?.toLowerCase().includes(term)
      )
      .slice(0, 5);

    setResults({
      transactions: filteredTransactions,
      targets: filteredTargets,
      assets: filteredAssets,
    });
  }, [debouncedSearchTerm, dataset]);

  const handleClose = () => {
    setOpen(false);
    setSearchTerm("");
  };

  const handleNavigate = (path) => {
    handleClose();
    router.push(path);
  };

  const totalResults =
    results.transactions.length +
    results.targets.length +
    results.assets.length;

  return (
    <>
      {/* Campo de busca no header - Design moderno */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 w-full px-4 py-2.5
          bg-gray-50 hover:bg-gray-100
          border border-gray-200 rounded-xl
          text-gray-500 text-sm
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300"
      >
        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="flex-1 text-left hidden sm:block">Buscar...</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-400 bg-white border border-gray-200 rounded-md">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Dialog de resultados */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[80vh] overflow-y-auto">
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
              loadingData && !dataset ? (
                <p className="text-sm text-gray-500">Carregando dados para busca...</p>
              ) : totalResults > 0 ? (
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
                            onClick={() => handleNavigate("/transacoes")}
                            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {t.description}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDate(t.date)}
                              </p>
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
                            onClick={() => handleNavigate("/metas")}
                            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {t.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatCurrency(t.progress)} /{" "}
                                {formatCurrency(t.goal)}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Patrimônio e Ativos */}
                  {results.assets.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Patrimônio e Ativos
                      </h3>
                      <div className="space-y-1">
                        {results.assets.map((a) => (
                          <button
                            key={a.id}
                            onClick={() => handleNavigate("/patrimonio-ativos")}
                            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {a.name}
                              </p>
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