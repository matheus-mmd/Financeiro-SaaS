'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import mockData from '../data/mockData.json';

/**
 * Contexto de Autenticação MOCK
 * Sistema de autenticação simulado para desenvolvimento/demonstração
 * Não usa banco de dados real - todos os dados são salvos em localStorage
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
  // Usuário mock do arquivo mockData.json
  const mockUser = mockData.users[0];

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento inicial
    const timer = setTimeout(() => {
      // Verifica se há sessão salva no localStorage
      const savedSession = localStorage.getItem('mock_auth_session');
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          setUser(session.user);
          setProfile(session.profile);
        } catch (error) {
          console.error('[AuthContext] Erro ao carregar sessão:', error);
          localStorage.removeItem('mock_auth_session');
        }
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const signIn = async (email, password) => {
    try {
      // Simula delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Validação básica mock - qualquer email/senha funciona
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

      // Criar sessão mock
      const mockSession = {
        user: {
          id: mockUser.id,
          email: email,
          created_at: mockUser.created_at,
        },
        profile: {
          id: mockUser.id,
          name: mockUser.name,
          email: email,
          currency: mockUser.currency,
        }
      };

      // Salvar sessão no localStorage
      localStorage.setItem('mock_auth_session', JSON.stringify(mockSession));

      // Atualizar estado
      setUser(mockSession.user);
      setProfile(mockSession.profile);

      return { data: mockSession, error: null };
    } catch (error) {
      console.error('[AuthContext] Erro ao fazer login:', error);
      return { data: null, error };
    }
  };

  const signUp = async (email, password, name) => {
    try {
      // Simula delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Validação básica
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

      // Criar sessão mock
      const mockSession = {
        user: {
          id: mockUser.id,
          email: email,
          created_at: new Date().toISOString(),
        },
        profile: {
          id: mockUser.id,
          name: name,
          email: email,
          currency: 'BRL',
        }
      };

      // Salvar sessão no localStorage
      localStorage.setItem('mock_auth_session', JSON.stringify(mockSession));

      // Atualizar estado
      setUser(mockSession.user);
      setProfile(mockSession.profile);

      return { data: mockSession, error: null };
    } catch (error) {
      console.error('[AuthContext] Erro ao criar conta:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      // Simula delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Limpar sessão
      localStorage.removeItem('mock_auth_session');
      setUser(null);
      setProfile(null);

      return { error: null };
    } catch (error) {
      console.error('[AuthContext] Erro ao fazer logout:', error);
      return { error };
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      // Simula delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Atualizar perfil
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);

      // Atualizar localStorage
      const savedSession = JSON.parse(localStorage.getItem('mock_auth_session') || '{}');
      savedSession.profile = updatedProfile;
      localStorage.setItem('mock_auth_session', JSON.stringify(savedSession));

      return { data: updatedProfile, error: null };
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