import { Inter } from 'next/font/google';
import './globals.css';
import Layout from '../src/components/Layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Financeiro SaaS - Controle suas Finanças',
  description: 'Sistema de gestão financeira pessoal com dashboard, transações, despesas, investimentos e metas',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
