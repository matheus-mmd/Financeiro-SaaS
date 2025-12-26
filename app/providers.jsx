'use client';

/**
 * Providers - Client Component
 * Wrappa todos os providers client-side (AuthProvider, ReferenceDataProvider, etc.)
 * Separado do RootLayout para permitir que ele seja Server Component
 *
 * OTIMIZAÇÃO DE PERFORMANCE:
 * - ReferenceDataProvider carrega dados de referência UMA VEZ
 * - Evita chamadas duplicadas em cada página (reduz 5-9 queries por navegação)
 * - Usa cache localStorage com TTL de 1 hora
 */

import { AuthProvider } from '../src/contexts/AuthContext';
import { ReferenceDataProvider } from '../src/contexts/ReferenceDataContext';
import Layout from '../src/components/Layout';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <ReferenceDataProvider>
        <Layout>{children}</Layout>
      </ReferenceDataProvider>
    </AuthProvider>
  );
}