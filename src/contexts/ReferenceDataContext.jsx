'use client';

import { createContext, useContext } from 'react';
import { useReferenceData } from '../lib/supabase/hooks/useReferenceData';

/**
 * Contexto para dados de referência (categorias, tipos, status, etc.)
 *
 * OTIMIZAÇÃO DE PERFORMANCE:
 * - Carrega dados de referência UMA VEZ no root layout
 * - Evita chamadas duplicadas em cada página
 * - Usa cache com TTL de 1 hora (dados mudam raramente)
 * - Reduz chamadas ao banco de dados em 80-90%
 */

const ReferenceDataContext = createContext(null);

export const useReferenceDataContext = () => {
  const context = useContext(ReferenceDataContext);
  if (!context) {
    throw new Error('useReferenceDataContext deve ser usado dentro de ReferenceDataProvider');
  }
  return context;
};

/**
 * Provider para dados de referência
 * Use no root layout para carregar dados uma vez
 */
export const ReferenceDataProvider = ({ children }) => {
  const referenceData = useReferenceData();

  return (
    <ReferenceDataContext.Provider value={referenceData}>
      {children}
    </ReferenceDataContext.Provider>
  );
};