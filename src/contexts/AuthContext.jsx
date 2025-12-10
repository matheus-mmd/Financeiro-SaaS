'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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
  const [loading, setLoading] = useState(true);

  /**
   * Busca o perfil do usuário do banco de dados
   */
  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AuthContext] Erro ao buscar perfil:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[AuthContext] Erro ao buscar perfil:', error);
      return null;
    }
  }, []);

  /**
   * Inicializa a sessão e monitora mudanças de autenticação
   */
  useEffect(() => {
    // Verificar sessão atual
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[AuthContext] Erro ao obter sessão:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        }

        setLoading(false);
      } catch (error) {
        console.error('[AuthContext] Erro ao inicializar auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    // Monitorar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] Auth state changed:', event);

        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        } else {
          setUser(null);
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  /**
   * Fazer login com email e senha
   */
  const signIn = useCallback(async (email, password) => {
    try {
      if (!email || !password) {
        return {
          data: null,
          error: new Error('Email e senha são obrigatórios')
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AuthContext] Erro ao fazer login:', error);
        return { data: null, error };
      }

      // O perfil será carregado automaticamente pelo onAuthStateChange
      return { data, error: null };
    } catch (error) {
      console.error('[AuthContext] Erro ao fazer login:', error);
      return { data: null, error };
    }
  }, []);

  /**
   * Criar nova conta com email, senha e nome
   */
  const signUp = useCallback(async (email, password, name) => {
    try {
      if (!email || !password || !name) {
        return {
          data: null,
          error: new Error('Todos os campos são obrigatórios')
        };
      }

      if (password.length < 6) {
        return {
          data: null,
          error: new Error('A senha deve ter pelo menos 6 caracteres')
        };
      }

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error('[AuthContext] Erro ao criar conta:', authError);
        return { data: null, error: authError };
      }

      if (!authData.user) {
        return {
          data: null,
          error: new Error('Erro ao criar usuário')
        };
      }

      // Criar perfil do usuário na tabela users
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email,
            name,
          }
        ])
        .select()
        .single();

      if (profileError) {
        console.error('[AuthContext] Erro ao criar perfil:', profileError);
        // Mesmo com erro no perfil, o usuário foi criado no Auth
        // Retornar sucesso mas logar o erro
      }

      // O perfil será carregado automaticamente pelo onAuthStateChange
      return { data: authData, error: null };
    } catch (error) {
      console.error('[AuthContext] Erro ao criar conta:', error);
      return { data: null, error };
    }
  }, []);

  /**
   * Fazer logout
   */
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('[AuthContext] Erro ao fazer logout:', error);
        return { error };
      }

      // O estado será limpo automaticamente pelo onAuthStateChange
      return { error: null };
    } catch (error) {
      console.error('[AuthContext] Erro ao fazer logout:', error);
      return { error };
    }
  }, []);

  /**
   * Atualizar perfil do usuário
   */
  const updateProfile = useCallback(async (updates) => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Atualizar perfil no banco de dados
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('[AuthContext] Erro ao atualizar perfil:', error);
        return { data: null, error };
      }

      // Atualizar estado local
      setProfile(data);

      return { data, error: null };
    } catch (error) {
      console.error('[AuthContext] Erro ao atualizar perfil:', error);
      return { data: null, error };
    }
  }, [user]);

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};