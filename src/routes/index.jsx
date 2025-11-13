import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';

// Lazy loading das páginas para code splitting
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Transacoes = lazy(() => import('../pages/Transacoes'));
const Despesas = lazy(() => import('../pages/Despesas'));
const Investimentos = lazy(() => import('../pages/Investimentos'));
const Metas = lazy(() => import('../pages/Metas'));
const Comparador = lazy(() => import('../pages/Comparador'));
const Perfil = lazy(() => import('../pages/Perfil'));

// Wrapper com Suspense para lazy loading
const LazyPage = ({ children }) => (
  <Suspense
    fallback={
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    }
  >
    {children}
  </Suspense>
);

/**
 * Configuração de rotas da aplicação
 * Usa React Router v6 com createBrowserRouter
 * Implementa code splitting com lazy loading
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <LazyPage>
            <Dashboard />
          </LazyPage>
        ),
      },
      {
        path: 'transacoes',
        element: (
          <LazyPage>
            <Transacoes />
          </LazyPage>
        ),
      },
      {
        path: 'despesas',
        element: (
          <LazyPage>
            <Despesas />
          </LazyPage>
        ),
      },
      {
        path: 'investimentos',
        element: (
          <LazyPage>
            <Investimentos />
          </LazyPage>
        ),
      },
      {
        path: 'metas',
        element: (
          <LazyPage>
            <Metas />
          </LazyPage>
        ),
      },
      {
        path: 'comparador',
        element: (
          <LazyPage>
            <Comparador />
          </LazyPage>
        ),
      },
      {
        path: 'perfil',
        element: (
          <LazyPage>
            <Perfil />
          </LazyPage>
        ),
      },
    ],
  },
]);
