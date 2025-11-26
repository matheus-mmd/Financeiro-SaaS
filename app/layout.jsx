'use client';

import './globals.css';
import Layout from '../src/components/Layout';
import { AuthProvider } from '../src/contexts/AuthContext';
import { NotificationProvider } from '../src/contexts/NotificationContext';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        <AuthProvider>
          <NotificationProvider>
            <Layout>{children}</Layout>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}