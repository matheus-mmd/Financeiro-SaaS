'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { getAuthenticatedUser } from '../lib/supabase/utils/auth';

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
        .select('id, email, name, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[AuthContext] Erro ao buscar perfil:', error);
        return { data: null, error, notFound: false };
      }

      return { data: data || null, error: null, notFound: !data };
    } catch (error) {
      console.error('[AuthContext] Erro ao buscar perfil:', error);
      return { data: null, error, notFound: false };
    }
  }, []);

  const resolveProfile = useCallback(async (userId) => {
    let attempts = 0;
    while (attempts < 2) {
      const { data, error, notFound } = await fetchProfile(userId);
      if (data) return data;

      if (error) {
        console.warn(`[AuthContext] Tentativa ${attempts + 1} falhou ao carregar perfil`, error);
      }

      if (!data && !error && notFound) {
        console.warn('[AuthContext] Perfil não encontrado, tentando novamente...');
      }

      attempts += 1;
    }

    return null;
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('[AuthContext] Erro ao fazer logout:', error);
        setUser(null);
        setProfile(null);
        setLoading(false);
        return { error };
      }

      setUser(null);
      setProfile(null);
      setLoading(false);
      return { error: null };
    } catch (error) {
      console.error('[AuthContext] Erro ao fazer logout:', error);
      setUser(null);
      setProfile(null);
      setLoading(false);
      return { error };
    }
  }, []);

  /**
   * Sincronizar estado de autenticação com Supabase
   */
  useEffect(() => {
    let isMounted = true;

    // TIMEOUT DE SEGURANÇA: Garantir que loading seja false após 10 segundos
    const safetyTimeout = setTimeout(() => {
      if (isMounted && loading) {
        setLoading(false);
      }
    }, 10000);

    const syncSession = async () => {
      try {
        const { user: currentUser, error } = await getAuthenticatedUser();

        if (!isMounted) return;

        if (error) {
          console.error('[AuthContext] Erro ao obter sessão:', error);
          setLoading(false);
          clearTimeout(safetyTimeout);
          return;
        }

        if (currentUser) {
          setUser(currentUser);
          const profileData = await resolveProfile(currentUser.id);

          if (isMounted) {
            setProfile(profileData);
            setLoading(false);
            clearTimeout(safetyTimeout);
          }
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
          clearTimeout(safetyTimeout);
        }
      } catch (error) {
        console.error('[AuthContext] Erro ao obter sessão:', error);
        if (isMounted) {
          setLoading(false);
          clearTimeout(safetyTimeout);
        }
      }
    };

    syncSession();

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Ignorar evento INITIAL_SESSION para evitar re-processamento desnecessário
      // O getSession() acima já trata da sessão inicial
      if (event === 'INITIAL_SESSION') {
        return;
      }

      if (!isMounted) return;

      if (session?.user) {
        setUser(session.user);

        // Buscar perfil (criado automaticamente pelo trigger do banco)
        const profileData = await resolveProfile(session.user.id);

        if (isMounted) {
          setProfile(profileData);
        }
      } else {
        setUser(null);
        setProfile(null);
      }

      if (isMounted) {
        setLoading(false);
      }
    });

    // Cleanup: desinscrever listener quando componente desmontar
    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [resolveProfile]);


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

      // Buscar perfil do usuário (criado pelo trigger do banco)
      if (data.user) {
        const profileData = await fetchProfile(data.user.id);
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