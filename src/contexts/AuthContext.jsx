'use client';

console.log('🔷 [AuthContext.jsx] ===== MÓDULO INICIANDO CARREGAMENTO =====');

import React, { createContext, useContext, useEffect, useState } from 'react';

console.log('🔷 [AuthContext.jsx] React importado OK');
console.log('🔷 [AuthContext.jsx] Tentando importar supabase...');
console.log('🔷 [AuthContext.jsx] NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'DEFINIDO' : 'UNDEFINED');
console.log('🔷 [AuthContext.jsx] NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'DEFINIDO (primeiros 20 chars)' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'UNDEFINED');

import { supabase } from '../utils/supabase';

console.log('✅ [AuthContext.jsx] Supabase importado com sucesso');
console.log('✅ [AuthContext.jsx] supabase object:', supabase ? 'VÁLIDO' : 'NULL/UNDEFINED');

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
  console.log('🔵 [AuthProvider] COMPONENTE RENDERIZOU');
  console.log('🔵 [AuthProvider] Ambiente:', typeof window !== 'undefined' ? 'CLIENTE' : 'SERVIDOR');
  console.log('🔵 [AuthProvider] window:', typeof window);

  const [user, setUser] = useState(() => {
    console.log('🟢 [AuthProvider] useState(user) inicializado com null');
    return null;
  });
  const [profile, setProfile] = useState(() => {
    console.log('🟢 [AuthProvider] useState(profile) inicializado com null');
    return null;
  });

  // CORREÇÃO DO LOOP INFINITO:
  // Durante SSR (Server-Side Rendering), useEffect NÃO executa no servidor
  // Portanto, se inicializarmos loading=true no servidor, ele nunca muda para false
  // Solução: Inicializar loading=false no servidor, e true apenas no cliente
  const [loading, setLoading] = useState(() => {
    const isServer = typeof window === 'undefined';
    const initialLoading = isServer ? false : true;
    console.log(`🟢 [AuthProvider] useState(loading) inicializado com ${initialLoading} (isServer=${isServer})`);
    return initialLoading;
  });

  console.log(`🔵 [AuthProvider] Estado atual: loading=${loading}, user=${user?.email || 'null'}, profile=${profile?.name || 'null'}`);
  console.log('⚠️ [AuthProvider] PRESTES A DECLARAR useEffect...');
  console.log('⚠️ [AuthProvider] children:', children ? 'PRESENTE' : 'AUSENTE');
  console.log('⚠️ [AuthProvider] React.useEffect:', typeof useEffect);

  // TESTE: useEffect simples para confirmar que effects executam
  useEffect(() => {
    console.log('🧪🧪🧪 [TESTE] useEffect SIMPLES executou! Effects funcionam!');
  }, []);

  // CORREÇÃO: Setar loading=true quando o componente montar no CLIENTE
  // Isso garante que mesmo após a hidratação, loading será true até a auth ser verificada
  useEffect(() => {
    console.log('🟦 [AuthProvider MOUNT] useEffect de montagem executou no CLIENTE');
    console.log('🟦 [AuthProvider MOUNT] Setando loading=true para iniciar verificação de autenticação');
    setLoading(true);
  }, []);

  useEffect(() => {
    console.log('🟡🟡🟡 [AuthContext useEffect] ===== EXECUTANDO - INÍCIO DO EFFECT =====');
    console.log('🟡🟡🟡 [AuthContext useEffect] Este log DEVE aparecer se o useEffect está funcionando!');

    let mounted = true;
    let isInitialized = false;

    console.log('🟡 [AuthContext useEffect] Variáveis locais criadas (mounted=true, isInitialized=false)');
    console.log('🟡 [AuthContext useEffect] Tentando registrar listener onAuthStateChange...');

    try {
      // Registrar listener ÚNICO que trata TANTO a sessão inicial QUANTO mudanças futuras
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          const timestamp = new Date().toISOString();
          console.log(`🔴 [${timestamp}] [AuthContext onAuthStateChange] ===== INÍCIO =====`);
          console.log(`🔴 [AuthContext onAuthStateChange] Evento: ${event}`);
          console.log(`🔴 [AuthContext onAuthStateChange] Sessão: ${session?.user?.email || 'sem sessão'}`);
          console.log(`🔴 [AuthContext onAuthStateChange] mounted=${mounted}, isInitialized=${isInitialized}`);

          // Prevenir execução se componente foi desmontado
          if (!mounted) {
            console.log('⚠️ [AuthContext onAuthStateChange] ABORTADO - componente desmontado');
            return;
          }

          try {
            if (session?.user) {
              console.log('✅ [AuthContext onAuthStateChange] Sessão válida detectada');
              console.log(`📝 [AuthContext onAuthStateChange] Chamando setUser() com: ${session.user.email}`);
              setUser(session.user);
              console.log('✅ [AuthContext onAuthStateChange] setUser() chamado');

              // Carregar perfil do usuário
              console.log(`📝 [AuthContext onAuthStateChange] Chamando loadProfile(${session.user.id})...`);
              await loadProfile(session.user.id);
              console.log('✅ [AuthContext onAuthStateChange] loadProfile() completou');
            } else {
              console.log('❌ [AuthContext onAuthStateChange] Sem sessão ativa, limpando estados');
              console.log('📝 [AuthContext onAuthStateChange] Chamando setUser(null)');
              setUser(null);
              console.log('📝 [AuthContext onAuthStateChange] Chamando setProfile(null)');
              setProfile(null);
              console.log('✅ [AuthContext onAuthStateChange] Estados limpos');
            }
          } catch (error) {
            console.error('💥 [AuthContext onAuthStateChange] ERRO ao processar auth state:', error);
            console.error('💥 [AuthContext onAuthStateChange] Stack:', error.stack);
            // Mesmo com erro, limpar estados para evitar inconsistência
            if (mounted) {
              console.log('⚠️ [AuthContext onAuthStateChange] Limpando estados após erro');
              setUser(null);
              setProfile(null);
            }
          } finally {
            console.log(`🔍 [AuthContext onAuthStateChange finally] isInitialized=${isInitialized}, mounted=${mounted}`);
            // Só setar loading = false na PRIMEIRA execução (sessão inicial)
            // Eventos subsequentes (SIGNED_IN, SIGNED_OUT) não precisam mudar loading
            if (!isInitialized && mounted) {
              console.log('🎯 [AuthContext onAuthStateChange] PRIMEIRA EXECUÇÃO - setando loading = false');
              setLoading(false);
              isInitialized = true;
              console.log('✅ [AuthContext onAuthStateChange] setLoading(false) chamado, isInitialized=true');
            } else {
              console.log(`⏭️ [AuthContext onAuthStateChange] NÃO é primeira execução (isInitialized=${isInitialized}) - mantendo loading como está`);
            }
            console.log(`🔴 [${timestamp}] [AuthContext onAuthStateChange] ===== FIM =====`);
          }
        }
      );

      console.log('✅ [AuthContext useEffect] Listener registrado com sucesso!');
      console.log('✅ [AuthContext useEffect] subscription:', subscription ? 'VÁLIDO' : 'INVÁLIDO/NULL');
      console.log('✅ [AuthContext useEffect] Retornando função de cleanup...');

      return () => {
        console.log('🧹 [AuthContext useEffect cleanup] ===== EXECUTANDO CLEANUP =====');
        mounted = false;
        console.log('🧹 [AuthContext useEffect cleanup] mounted setado para false');
        subscription?.unsubscribe();
        console.log('✅ [AuthContext useEffect cleanup] Unsubscribe chamado, cleanup completo');
      };
    } catch (error) {
      console.error('💥💥💥 [AuthContext useEffect] ERRO CRÍTICO ao registrar listener:', error);
      console.error('💥💥💥 [AuthContext useEffect] Stack:', error.stack);
      // Fallback: setar loading=false para não travar a aplicação
      console.log('⚠️ [AuthContext useEffect] FALLBACK - setando loading=false devido a erro');
      setLoading(false);
      return () => {
        console.log('🧹 [AuthContext useEffect cleanup] Cleanup (após erro)');
      };
    }
  }, []);

  console.log('⚠️ [AuthProvider] useEffect DECLARADO (não necessariamente executado ainda)');

  const loadProfile = async (userId) => {
    const timestamp = new Date().toISOString();
    console.log(`🟣 [${timestamp}] [loadProfile] ===== INÍCIO =====`);
    console.log(`🟣 [loadProfile] userId: ${userId}`);

    try {
      console.log('🟣 [loadProfile] Chamando supabase.from("users").select()...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('🟣 [loadProfile] Resposta do Supabase recebida');
      console.log(`🟣 [loadProfile] error: ${error?.message || 'null'}`);
      console.log(`🟣 [loadProfile] data: ${data ? JSON.stringify(data) : 'null'}`);

      if (error) {
        console.warn('⚠️ [loadProfile] Erro ao buscar perfil (pode não existir):', error.message);
        console.log('📝 [loadProfile] Chamando setProfile(null)');
        setProfile(null);
        console.log('✅ [loadProfile] setProfile(null) chamado');
        console.log(`🟣 [${timestamp}] [loadProfile] ===== FIM (com erro) =====`);
        return;
      }

      console.log('✅ [loadProfile] Perfil encontrado:', data);
      console.log('📝 [loadProfile] Chamando setProfile(data)');
      setProfile(data);
      console.log('✅ [loadProfile] setProfile(data) chamado');
      console.log(`🟣 [${timestamp}] [loadProfile] ===== FIM (sucesso) =====`);
    } catch (error) {
      console.error('💥 [loadProfile] Erro inesperado:', error);
      console.error('💥 [loadProfile] Stack:', error.stack);
      console.log('📝 [loadProfile] Chamando setProfile(null) após exceção');
      setProfile(null);
      console.log(`🟣 [${timestamp}] [loadProfile] ===== FIM (exceção) =====`);
    }
  };

  const signIn = async (email, password) => {
    console.log('🟢 [signIn] ===== INÍCIO =====');
    console.log(`🟢 [signIn] email: ${email}`);
    try {
      console.log('🟢 [signIn] Chamando supabase.auth.signInWithPassword()...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('🟢 [signIn] Resposta recebida');
      console.log(`🟢 [signIn] error: ${error?.message || 'null'}`);
      console.log(`🟢 [signIn] data.user: ${data?.user?.email || 'null'}`);

      if (error) {
        console.error('❌ [signIn] Erro de autenticação:', error.message);
        throw error;
      }

      console.log('✅ [signIn] Login bem-sucedido');
      console.log('🟢 [signIn] ===== FIM (sucesso) =====');
      return { data, error: null };
    } catch (error) {
      console.error('💥 [signIn] Exceção capturada:', error);
      console.log('🟢 [signIn] ===== FIM (erro) =====');
      return { data: null, error };
    }
  };

  const signUp = async (email, password, name) => {
    console.log('🟠 [signUp] ===== INÍCIO =====');
    console.log(`🟠 [signUp] email: ${email}, name: ${name}`);
    try {
      console.log('🟠 [signUp] Chamando supabase.auth.signUp()...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      console.log('🟠 [signUp] Resposta recebida');
      console.log(`🟠 [signUp] error: ${error?.message || 'null'}`);
      console.log(`🟠 [signUp] data.user: ${data?.user?.email || 'null'}`);

      if (error) {
        console.error('❌ [signUp] Erro ao criar conta:', error.message);
        throw error;
      }

      console.log('✅ [signUp] Cadastro bem-sucedido');
      console.log('🟠 [signUp] ===== FIM (sucesso) =====');
      return { data, error: null };
    } catch (error) {
      console.error('💥 [signUp] Exceção capturada:', error);
      console.log('🟠 [signUp] ===== FIM (erro) =====');
      return { data: null, error };
    }
  };

  const signOut = async () => {
    console.log('🔴 [signOut] ===== INÍCIO =====');
    try {
      console.log('🔴 [signOut] Limpando estados localmente...');
      console.log('📝 [signOut] Chamando setUser(null)');
      setUser(null);
      console.log('📝 [signOut] Chamando setProfile(null)');
      setProfile(null);
      console.log('✅ [signOut] Estados locais limpos');

      console.log('🔴 [signOut] Chamando supabase.auth.signOut()...');
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('💥 [signOut] Erro ao fazer logout no Supabase:', error);
        throw error;
      }

      console.log('✅ [signOut] Logout no Supabase bem-sucedido');
      console.log('🔴 [signOut] ===== FIM (sucesso) =====');
      return { error: null };
    } catch (error) {
      console.error('💥 [signOut] Exceção no signOut:', error);
      console.log('🔴 [signOut] ===== FIM (erro) =====');
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

  console.log('🎯 [AuthProvider] PRESTES A RETORNAR JSX - se você vê isso, o componente renderizou até o fim');
  console.log('🎯 [AuthProvider] Agora o React deveria executar os useEffects...');

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};