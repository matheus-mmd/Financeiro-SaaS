import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Spinner from './Spinner';
import { fetchMock } from '../utils/mockApi';

/**
 * Componente Layout - Layout principal da aplicação
 * Carrega dados do usuário e saldo para Topbar
 */
export default function Layout() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, summaryData] = await Promise.all([
          fetchMock('/api/user'),
          fetchMock('/api/summary'),
        ]);
        setUser(userData.data);
        setBalance(summaryData.data.available_balance);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <Topbar user={user} balance={balance} />

        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
