/**
 * RootLayout - Server Component
 * CORREÇÃO: Removido 'use client' para aproveitar Server Components do Next.js
 * Providers movidos para arquivo separado (providers.jsx)
 *
 * Benefícios:
 * - Menor JavaScript bundle enviado ao cliente
 * - Melhor performance (FCP, LCP)
 * - Streaming e Suspense funcionam corretamente
 * - Metadata pode ser exportada (não funciona em client components)
 */

import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Financeiro SaaS',
  description: 'Controle financeiro pessoal completo',
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}