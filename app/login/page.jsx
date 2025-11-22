'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/contexts/AuthContext';
import { Button } from '../../src/components/ui/button';
import { Input } from '../../src/components/ui/input';
import { Label } from '../../src/components/ui/label';
import { Card, CardContent } from '../../src/components/ui/card';
import { Wallet, ArrowRight, Mail, Lock, User } from 'lucide-react';

/**
 * Página de Login e Cadastro
 * Interface unificada para autenticação de usuários
 */
export default function LoginPage() {
  console.log('🟧 [LoginPage] ===== COMPONENTE RENDERIZOU =====');

  const router = useRouter();
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  console.log(`🟧 [LoginPage] useAuth retornou: authLoading=${authLoading}, user=${user?.email || 'null'}`);

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: 'matheus_meneses2011@hotmail.com', // TODO: Remover antes de produção
    password: 'matheus_meneses2011@hotmail.com', // TODO: Remover antes de produção
    confirmPassword: '',
  });

  console.log(`🟧 [LoginPage] Estado local: isLogin=${isLogin}, loading=${loading}, error="${error}"`);

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`🟠 [${timestamp}] [LoginPage useEffect] ===== EXECUTANDO =====`);
    console.log(`🟠 [LoginPage useEffect] authLoading: ${authLoading}`);
    console.log(`🟠 [LoginPage useEffect] user: ${user?.email || 'null'}`);

    const shouldRedirect = !authLoading && user;
    console.log(`🟠 [LoginPage useEffect] shouldRedirect: ${shouldRedirect} (!authLoading=${!authLoading} && user=${!!user})`);

    if (shouldRedirect) {
      console.log('🔴 [LoginPage useEffect] ⚠️ USUÁRIO JÁ AUTENTICADO - REDIRECIONANDO PARA /');
      router.replace('/');
      console.log('🔴 [LoginPage useEffect] router.replace("/") chamado');
    } else {
      console.log('✅ [LoginPage useEffect] Não precisa redirecionar (usuário não autenticado ou ainda carregando)');
    }

    console.log(`🟠 [${timestamp}] [LoginPage useEffect] ===== FIM =====`);
  }, [user, authLoading, router]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return false;
    }

    if (!isLogin && !formData.name) {
      setError('Por favor, informe seu nome');
      return false;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, informe um e-mail válido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    console.log('🟢 [LoginPage handleSubmit] ===== INÍCIO =====');
    e.preventDefault();
    console.log(`🟢 [LoginPage handleSubmit] isLogin: ${isLogin}`);
    console.log(`🟢 [LoginPage handleSubmit] email: ${formData.email}`);

    console.log('🟢 [LoginPage handleSubmit] Limpando erro anterior');
    setError('');

    console.log('🟢 [LoginPage handleSubmit] Validando form...');
    if (!validateForm()) {
      console.log('❌ [LoginPage handleSubmit] Validação falhou, abortando');
      return;
    }
    console.log('✅ [LoginPage handleSubmit] Validação OK');

    console.log('🟢 [LoginPage handleSubmit] Setando loading=true');
    setLoading(true);

    try {
      if (isLogin) {
        console.log('🟢 [LoginPage handleSubmit] Modo LOGIN - chamando signIn()...');
        const { error } = await signIn(formData.email, formData.password);
        console.log('🟢 [LoginPage handleSubmit] signIn() retornou');
        console.log(`🟢 [LoginPage handleSubmit] error: ${error?.message || 'null'}`);

        if (error) {
          console.log('❌ [LoginPage handleSubmit] Erro no login, mostrando mensagem');
          if (error.message.includes('Invalid login credentials')) {
            setError('E-mail ou senha incorretos');
          } else {
            setError(error.message);
          }
          console.log('🟢 [LoginPage handleSubmit] Setando loading=false');
          setLoading(false);
          console.log('🟢 [LoginPage handleSubmit] ===== FIM (erro no login) =====');
          return;
        }
        console.log('✅ [LoginPage handleSubmit] Login bem-sucedido! useEffect fará o redirect');
      } else {
        console.log('🟢 [LoginPage handleSubmit] Modo CADASTRO - chamando signUp()...');
        const { error } = await signUp(formData.email, formData.password, formData.name);
        console.log('🟢 [LoginPage handleSubmit] signUp() retornou');
        console.log(`🟢 [LoginPage handleSubmit] error: ${error?.message || 'null'}`);

        if (error) {
          console.log('❌ [LoginPage handleSubmit] Erro no cadastro, mostrando mensagem');
          if (error.message.includes('already registered')) {
            setError('Este e-mail já está cadastrado');
          } else {
            setError(error.message);
          }
          console.log('🟢 [LoginPage handleSubmit] Setando loading=false');
          setLoading(false);
          console.log('🟢 [LoginPage handleSubmit] ===== FIM (erro no cadastro) =====');
          return;
        }
        console.log('✅ [LoginPage handleSubmit] Cadastro bem-sucedido! Alternando para modo login');
        setError('');
        setIsLogin(true);
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      }
    } catch (err) {
      console.error('💥 [LoginPage handleSubmit] Exceção capturada:', err);
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      console.log('🟢 [LoginPage handleSubmit] Finally - setando loading=false');
      setLoading(false);
      console.log('🟢 [LoginPage handleSubmit] ===== FIM =====');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  if (authLoading) {
    console.log('⏳ [LoginPage] authLoading=true - MOSTRANDO SPINNER');
    console.log('🟧 [LoginPage] ===== FIM (authLoading) =====');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  console.log('✅ [LoginPage] RENDERIZANDO FORMULÁRIO DE LOGIN');
  console.log('🟧 [LoginPage] ===== FIM (renderizando form) =====');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8">
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-full mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Financeiro SaaS
            </h1>
            <p className="text-gray-600">
              {isLogin ? 'Entre na sua conta' : 'Crie sua conta gratuitamente'}
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome (apenas no cadastro) */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome completo
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={loading}
                  required={!isLogin}
                />
              </div>
            )}

            {/* E-mail */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* Confirmar senha (apenas no cadastro) */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirmar senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  disabled={loading}
                  required={!isLogin}
                />
              </div>
            )}

            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Botão de submit */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  {isLogin ? 'Entrando...' : 'Cadastrando...'}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {isLogin ? 'Entrar' : 'Criar conta'}
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>

          {/* Toggle entre Login e Cadastro */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              disabled={loading}
              className="text-brand-600 hover:text-brand-700 font-medium text-sm transition-colors disabled:opacity-50"
            >
              {isLogin ? (
                <>
                  Não tem uma conta? <span className="underline">Cadastre-se</span>
                </>
              ) : (
                <>
                  Já tem uma conta? <span className="underline">Faça login</span>
                </>
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}