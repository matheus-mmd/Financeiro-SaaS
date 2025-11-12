import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

/**
 * Componente App principal
 * Configura o RouterProvider com as rotas da aplicação
 */
function App() {
  return <RouterProvider router={router} />;
}

export default App;
