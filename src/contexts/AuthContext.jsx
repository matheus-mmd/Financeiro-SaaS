'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

/**
 * Contexto de Autenticação
 * Gerencia o estado de autenticação do usuário em toda a aplicação
 */

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // CORREÇÃO DEFINITIVA DO LOOP INFINITO:
  // Durante SSR, useEffect NÃO executa no servidor
  // Se loading=true no servidor, ele NUNCA muda para false (loop infinito)
  // Solução: Detectar servidor e inicializar loading=false no servidor, true no cliente
  const [loading, setLoading] = useState(() => {
    const isServer = typeof window === 'undefined';
    return !isServer; // false no servidor, true no cliente
  });

  useEffect(() => {
    let mounted = true;
    let isInitialized = false;

    try {
      // Registrar listener ÚNICO que trata TANTO a sessão inicial QUANTO mudanças futuras
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          // Prevenir execução se componente foi desmontado
          if (!mounted) return;

          try {
            if (session?.user) {
              setUser(session.user);
              await loadProfile(session.user.id);
            } else {
              setUser(null);
              setProfile(null);
            }
          } catch (error) {
            console.error('[AuthContext] Erro ao processar estado de autenticação:', error);
            // Mesmo com erro, limpar estados para evitar inconsistência
            if (mounted) {
              setUser(null);
              setProfile(null);
            }
          } finally {
            // Só setar loading = false na PRIMEIRA execução (sessão inicial)
            if (!isInitialized && mounted) {
              setLoading(false);
              isInitialized = true;
            }
          }
        }
      );

      return () => {
        mounted = false;
        subscription?.unsubscribe();
      };
    } catch (error) {
      console.error('[AuthContext] ERRO CRÍTICO ao registrar listener:', error);
      // Fallback: setar loading=false para não travar a aplicação
      setLoading(false);
      return () => {};
    }
  }, []);

  const loadProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('[AuthContext] Erro ao buscar perfil:', error.message);
        setProfile(null);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('[AuthContext] Erro inesperado ao carregar perfil:', error);
      setProfile(null);
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('[AuthContext] Erro ao fazer login:', error);
      return { data: null, error };
    }
  };

  const signUp = async (email, password, name) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('[AuthContext] Erro ao criar conta:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setProfile(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('[AuthContext] Erro ao fazer logout:', error);
      return { error };
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const value = React.useMemo(() => ({
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }), [user, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};