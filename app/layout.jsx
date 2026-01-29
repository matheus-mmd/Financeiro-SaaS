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
  icons: {
    icon: '/favicon.svg',
  },
};

// CORREÇÃO: Viewport deve ser exportado separadamente (Next.js 14+)
// https://nextjs.org/docs/app/api-reference/functions/generate-viewport
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}