'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { localStorageAdapter } from '../lib/storage/storageAdapter';
import mockData from '../data/mockData.json';

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

  useEffect(() => {
    const timer = setTimeout(() => {
      const savedSession = localStorageAdapter.get(SESSION_KEY);
      if (savedSession) {
        setUser(savedSession.user);
        setProfile(savedSession.profile);
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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

      if (password.length < 6) {
        return {
          data: null,
          error: new Error('A senha deve ter pelo menos 6 caracteres')
        };
      }

      const mockSession = {
        user: {
          id: mockUser.id,
          email,
          created_at: mockUser.created_at,
        },
        profile: {
          id: mockUser.id,
          name: mockUser.name,
          email,
          currency: mockUser.currency,
        }
      };

      localStorageAdapter.set(SESSION_KEY, mockSession);
      setUser(mockSession.user);
      setProfile(mockSession.profile);

      return { data: mockSession, error: null };
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

      const mockSession = {
        user: {
          id: mockUser.id,
          email,
          created_at: new Date().toISOString(),
        },
        profile: {
          id: mockUser.id,
          name,
          email,
          currency: 'BRL',
        }
      };

      localStorageAdapter.set(SESSION_KEY, mockSession);
      setUser(mockSession.user);
      setProfile(mockSession.profile);

      return { data: mockSession, error: null };
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
      await new Promise(resolve => setTimeout(resolve, 300));
      localStorageAdapter.remove(SESSION_KEY);
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

      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);

      const savedSession = localStorageAdapter.get(SESSION_KEY) || {};
      savedSession.profile = updatedProfile;
      localStorageAdapter.set(SESSION_KEY, savedSession);

      return { data: updatedProfile, error: null };
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