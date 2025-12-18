'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
  const isRevalidatingRef = useRef(false);
  const lastRevalidationRef = useRef(0);
  const userRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

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
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          console.error('[AuthContext] Erro ao obter sessão:', error);
          setLoading(false);
          clearTimeout(safetyTimeout);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          const profileData = await resolveProfile(session.user.id);

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
  }, [resolveProfile, signOut]);

  useEffect(() => {
    const handleVisibilityOrFocus = async () => {
      if (document.visibilityState === 'hidden') return;

      const now = Date.now();
      if (isRevalidatingRef.current) return;
      if (now - lastRevalidationRef.current < 30000) return;

      isRevalidatingRef.current = true;

      let timeoutId;
      try {
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('SESSION_REVALIDATION_TIMEOUT')), 10000);
        });

        const { data: { session }, error } = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise,
        ]);

        if (error) {
          console.error('[AuthContext] Erro ao revalidar sessão:', error);
          return;
        }

        if (session?.user) {
          const currentUserId = userRef.current?.id;
          if (currentUserId !== session.user.id) {
            setUser(session.user);
          }

          const hasProfileForUser = profileRef.current?.id === session.user.id;
          if (!hasProfileForUser) {
            const profileData = await resolveProfile(session.user.id);
            if (profileData) {
              setProfile(profileData);
            }
          }
        } else {
          console.warn('[AuthContext] Sessão expirada ao retomar foco/visibilidade');
          await signOut();
        }
      } catch (error) {
        if (error?.message === 'SESSION_REVALIDATION_TIMEOUT') {
          console.warn('[AuthContext] Timeout ao revalidar sessão após retorno do app');
        } else {
          console.error('[AuthContext] Erro ao revalidar sessão (focus/visibility):', error);
        }
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        isRevalidatingRef.current = false;
        lastRevalidationRef.current = Date.now();
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [resolveProfile, signOut]);

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