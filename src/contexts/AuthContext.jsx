'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';

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

  // Fetch user profile from public.users table
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

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    let loadingTimeout;

    const initializeAuth = async () => {
      try {
        console.log('[AuthContext] Inicializando autenticação...');

        // Timeout de segurança (5 segundos)
        loadingTimeout = setTimeout(() => {
          if (mounted) {
            console.warn('[AuthContext] Timeout - forçando loading=false');
            setLoading(false);
          }
        }, 5000);

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[AuthContext] Erro ao obter sessão:', error);
          if (mounted) setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('[AuthContext] Sessão encontrada:', session.user.email);
          if (mounted) {
            setUser(session.user);
            const userProfile = await fetchProfile(session.user.id);
            setProfile(userProfile);
          }
        } else {
          console.log('[AuthContext] Nenhuma sessão ativa');
        }

        if (mounted) {
          clearTimeout(loadingTimeout);
          setLoading(false);
        }
      } catch (error) {
        console.error('[AuthContext] Erro na inicialização:', error);
        if (mounted) {
          clearTimeout(loadingTimeout);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] Auth event:', event);

        if (!mounted) return;

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
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []); // Removido fetchProfile das dependências

  const signIn = useCallback(async (email, password) => {
    try {
      if (!email || !password) {
        return {
          data: null,
          error: new Error('Email e senha são obrigatórios')
        };
      }

      if (password.length < 6) {
        return {
          data: null,
          error: new Error('A senha deve ter pelo menos 6 caracteres')
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

      return { data, error: null };
    } catch (error) {
      console.error('[AuthContext] Erro ao fazer login:', error);
      return { data: null, error };
    }
  }, []);

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

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          }
        }
      });

      if (error) {
        console.error('[AuthContext] Erro ao criar conta:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('[AuthContext] Erro ao criar conta:', error);
      return { data: null, error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('[AuthContext] Erro ao fazer logout:', error);
        return { error };
      }

      setUser(null);
      setProfile(null);
      return { error: null };
    } catch (error) {
      console.error('[AuthContext] Erro ao fazer logout:', error);
      return { error };
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      const updateData = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.currency !== undefined) updateData.currency = updates.currency;

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('[AuthContext] Erro ao atualizar perfil:', error);
        return { data: null, error };
      }

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