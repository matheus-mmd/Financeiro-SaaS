'use client';

import './globals.css';
import Layout from '../src/components/Layout';
import { AuthProvider } from '../src/contexts/AuthContext';

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