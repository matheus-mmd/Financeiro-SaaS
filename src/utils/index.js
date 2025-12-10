/**
 * Utils - Exporta todas as funções utilitárias
 *
 * Para alternar entre Mock e Supabase, comente/descomente as linhas abaixo
 * ou configure NEXT_PUBLIC_USE_SUPABASE=true no .env.local
 */

// Escolher qual API usar
// Para usar Mock API (desenvolvimento/testes), comente a linha do Supabase e descomente a do Mock
// Para usar Supabase API (produção), comente a linha do Mock e descomente a do Supabase

// Modo Supabase (ATIVO)
export * from "./supabaseApi";

// Modo Mock (INATIVO - descomente para usar)
// export * from "./mockApi";

// Exportar formatadores e constantes (sempre os mesmos)
export * from "../formatters/currency";
export * from "../formatters/date";
export * from "../constants";
