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

  /**
   * Buscar perfil do usuário no banco de dados
   */
  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

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
   * Criar perfil do usuário no banco de dados
   */
  const createProfile = useCallback(async (userId, email, name) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            email,
            name,
          },
        ])
        .select()
        .maybeSingle();

      if (error) {
        console.error('[AuthContext] Erro ao criar perfil:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[AuthContext] Erro ao criar perfil:', error);
      return null;
    }
  }, []);

  /**
   * Sincronizar estado de autenticação com Supabase
   */
  useEffect(() => {
    // Verificar sessão existente
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        let profileData = await fetchProfile(session.user.id);

        // Se o perfil não existe, criar automaticamente
        if (!profileData) {
          console.log('[AuthContext] Perfil não encontrado, criando...');
          profileData = await createProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata?.name || session.user.email
          );
        }

        setProfile(profileData);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth state changed:', event);

      if (session?.user) {
        setUser(session.user);
        let profileData = await fetchProfile(session.user.id);

        // Se o perfil não existe, criar automaticamente
        if (!profileData) {
          console.log('[AuthContext] Perfil não encontrado, criando...');
          profileData = await createProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata?.name || session.user.email
          );
        }

        setProfile(profileData);
      } else {
        setUser(null);
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, createProfile]);

  /**
   * Fazer login com email e senha
   */
  const signIn = useCallback(async (email, password) => {
    try {
      if (!email || !password) {
        return {
          data: null,
          error: new Error('Email e senha são obrigatórios'),
        };
      }

      if (password.length < 6) {
        return {
          data: null,
          error: new Error('A senha deve ter pelo menos 6 caracteres'),
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

      // Buscar ou criar perfil do usuário
      if (data.user) {
        let profileData = await fetchProfile(data.user.id);

        // Se o perfil não existe, criar automaticamente
        if (!profileData) {
          console.log('[AuthContext] Perfil não encontrado no login, criando...');
          profileData = await createProfile(
            data.user.id,
            data.user.email,
            data.user.user_metadata?.name || data.user.email
          );
        }

        setProfile(profileData);
      }

      return { data, error: null };
    } catch (error) {
      console.error('[AuthContext] Erro ao fazer login:', error);
      return { data: null, error };
    }
  }, [fetchProfile]);

  /**
   * Criar nova conta com email, senha e nome
   */
  const signUp = useCallback(async (email, password, name) => {
    try {
      if (!email || !password || !name) {
        return {
          data: null,
          error: new Error('Todos os campos são obrigatórios'),
        };
      }

      if (password.length < 6) {
        return {
          data: null,
          error: new Error('A senha deve ter pelo menos 6 caracteres'),
        };
      }

      // Criar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        console.error('[AuthContext] Erro ao criar conta:', error);
        return { data: null, error };
      }

      // NOTA: O perfil é criado automaticamente pelo trigger do banco de dados (on_auth_user_created)
      // O onAuthStateChange irá buscar o perfil quando a sessão for estabelecida

      return { data, error: null };
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

      setUser(null);
      setProfile(null);
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
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .maybeSingle();

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