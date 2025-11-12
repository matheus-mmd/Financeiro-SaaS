import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import Transacoes from '../pages/Transacoes';
import Despesas from '../pages/Despesas';
import Investimentos from '../pages/Investimentos';
import Metas from '../pages/Metas';
import Comparador from '../pages/Comparador';
import Perfil from '../pages/Perfil';

/**
 * Configuração de rotas da aplicação
 * Usa React Router v6 com createBrowserRouter
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'transacoes',
        element: <Transacoes />,
      },
      {
        path: 'despesas',
        element: <Despesas />,
      },
      {
        path: 'investimentos',
        element: <Investimentos />,
      },
      {
        path: 'metas',
        element: <Metas />,
      },
      {
        path: 'comparador',
        element: <Comparador />,
      },
      {
        path: 'perfil',
        element: <Perfil />,
      },
    ],
  },
]);
