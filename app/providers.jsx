'use client';

/**
 * Providers - Client Component
 * Wrappa todos os providers client-side (AuthProvider, etc.)
 * Separado do RootLayout para permitir que ele seja Server Component
 */

import { AuthProvider } from '../src/contexts/AuthContext';
import Layout from '../src/components/Layout';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <Layout>{children}</Layout>
    </AuthProvider>
  );
}