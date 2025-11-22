import './globals.css';
import Layout from '../src/components/Layout';
import { AuthProvider } from '../src/contexts/AuthContext';

export const metadata = {
  title: 'Financeiro SaaS - Controle suas Finanças',
  description: 'Sistema de gestão financeira pessoal com dashboard, transações, despesas, investimentos e metas',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        <AuthProvider>
          <Layout>{children}</Layout>
        </AuthProvider>
      </body>
    </html>
  );
}
