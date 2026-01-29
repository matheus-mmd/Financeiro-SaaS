'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/contexts/AuthContext';
import { Button } from '../../src/components/ui/button';
import { Input } from '../../src/components/ui/input';
import { Card, CardContent } from '../../src/components/ui/card';
import { Compass, Mail, Lock, User, Phone, Eye, EyeOff, ArrowLeft, Check, X } from 'lucide-react';
import Link from 'next/link';

/**
 * Traduz mensagens de erro do Supabase para português
 */
const translateError = (errorMessage) => {
  const translations = {
    'Invalid login credentials': 'E-mail ou senha incorretos',
    'Email not confirmed': 'E-mail não confirmado. Verifique sua caixa de entrada',
    'User already registered': 'Este e-mail já está cadastrado',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
    'Unable to validate email address: invalid format': 'Formato de e-mail inválido',
    'User not found': 'Usuário não encontrado',
    'Invalid email or password': 'E-mail ou senha inválidos',
    'Email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos',
    'Invalid Refresh Token': 'Sessão expirada. Faça login novamente',
    'Signup requires a valid password': 'Informe uma senha válida',
    'Failed to fetch': 'Erro de conexão. Verifique sua internet',
    'Network request failed': 'Falha na conexão. Tente novamente',
    'An error occurred': 'Ocorreu um erro. Tente novamente',
  };

  if (translations[errorMessage]) {
    return translations[errorMessage];
  }

  for (const [english, portuguese] of Object.entries(translations)) {
    if (errorMessage?.includes(english)) {
      return portuguese;
    }
  }

  return errorMessage || 'Ocorreu um erro. Tente novamente';
};

/**
 * Formata o celular no padrão (XX) XXXXX-XXXX
 */
const formatPhone = (value) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers.length ? `(${numbers}` : '';
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

/**
 * Componente de validação visual da senha
 */
const PasswordStrengthIndicator = ({ password }) => {
  const requirements = useMemo(() => [
    { label: 'Mínimo 8 caracteres', test: (p) => p.length >= 8 },
    { label: 'Uma letra maiúscula', test: (p) => /[A-Z]/.test(p) },
    { label: 'Uma letra minúscula', test: (p) => /[a-z]/.test(p) },
    { label: 'Um número', test: (p) => /\d/.test(p) },
    { label: 'Um caractere especial (!@#$%...)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
  ], []);

  const passedRequirements = requirements.filter((req) => req.test(password)).length;
  const strengthPercentage = (passedRequirements / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strengthPercentage <= 20) return 'bg-red-50 dark:bg-red-9500';
    if (strengthPercentage <= 40) return 'bg-orange-500';
    if (strengthPercentage <= 60) return 'bg-amber-500';
    if (strengthPercentage <= 80) return 'bg-lime-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strengthPercentage <= 20) return { text: 'Muito fraca', color: 'text-red-500' };
    if (strengthPercentage <= 40) return { text: 'Fraca', color: 'text-orange-500' };
    if (strengthPercentage <= 60) return { text: 'Média', color: 'text-amber-500' };
    if (strengthPercentage <= 80) return { text: 'Boa', color: 'text-lime-600' };
    return { text: 'Forte', color: 'text-green-600' };
  };

  const strength = getStrengthText();

  if (!password) return null;

  return (
    <div className="mt-3 space-y-3">
      {/* Barra de força */}
      <div className="space-y-1">
        <div className="h-1.5 w-full bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
        <div className="flex justify-end">
          <span className={`text-xs font-medium ${strength.color}`}>
            {strength.text}
          </span>
        </div>
      </div>

      {/* Lista de requisitos */}
      <ul className="space-y-1.5">
        {requirements.map((req, index) => {
          const passed = req.test(password);
          return (
            <li key={index} className="flex items-center gap-2 text-xs">
              {passed ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-gray-300" />
              )}
              <span className={passed ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}>
                {req.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

/**
 * Página de Login e Cadastro
 */
export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, signIn, signUp } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false); // Flag para evitar redirect durante cadastro
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Carregar email salvo se existir
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    // Não redirecionar se estiver no processo de cadastro
    // O cadastro tem seu próprio fluxo de redirecionamento para /escolher-plano
    if (!authLoading && user && !isSigningUp) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router, isSigningUp]);

  const handleInputChange = (field, value) => {
    if (field === 'phone') {
      value = formatPhone(value);
    }
    setFormData({ ...formData, [field]: value });
    setError('');
  };

  // Validação de senha forte para cadastro
  const isPasswordStrong = (password) => {
    const requirements = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    ];
    return requirements.every(Boolean);
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

    // Validação de senha forte apenas no cadastro
    if (!isLogin && !isPasswordStrong(formData.password)) {
      setError('A senha não atende todos os requisitos de segurança');
      return false;
    }

    // Validação básica para login (mínimo 6 caracteres)
    if (isLogin && formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, informe um e-mail válido');
      return false;
    }

    if (!isLogin && !acceptTerms) {
      setError('Você precisa aceitar a Política de Privacidade');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);

        if (error) {
          setError(translateError(error.message));
          setLoading(false);
          return;
        }

        // Salvar ou remover email do localStorage
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        router.replace('/dashboard');
      } else {
        // Marca que está em processo de cadastro para evitar redirect automático para dashboard
        setIsSigningUp(true);

        const { error } = await signUp(formData.email, formData.password, formData.name);

        if (error) {
          setError(translateError(error.message));
          setIsSigningUp(false);
          setLoading(false);
          return;
        }

        const { error: signInError } = await signIn(formData.email, formData.password);

        if (signInError) {
          setError('');
          setIsLogin(true);
          setIsSigningUp(false);
          setFormData({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
        } else {
          // Novos usuários vão diretamente para a página de escolha de planos
          router.replace('/escolher-plano');
        }
      }
    } catch (err) {
      console.error('[LoginPage] Erro inesperado:', err);
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (mode) => {
    setIsLogin(mode === 'login');
    setError('');
    setFormData({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
    setAcceptTerms(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8">
          {/* Botão Voltar */}
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para página inicial</span>
          </Link>

          {/* Logo e Título */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-xl mb-4">
              <Compass className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Financeiro SaaS
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Organize suas finanças de forma simples e eficiente
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-slate-700 rounded-full p-1 mb-6">
            <button
              type="button"
              onClick={() => toggleMode('login')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all ${
                isLogin
                  ? 'bg-white text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => toggleMode('register')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all ${
                !isLogin
                  ? 'bg-white text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome (apenas no cadastro) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nome completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={loading}
                    className="pl-10 h-11"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Celular (apenas no cadastro) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Celular
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={loading}
                    className="pl-10 h-11"
                    autoComplete="tel"
                    maxLength={15}
                  />
                </div>
              </div>
            )}

            {/* E-mail */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={loading}
                  className="pl-10 h-11"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Senha
                </label>
                {isLogin && (
                  <Link
                    href="/esqueci-senha"
                    className="text-sm text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    Esqueci minha senha
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={loading}
                  className="pl-10 pr-10 h-11"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Indicador de força da senha (apenas no cadastro) */}
              {!isLogin && <PasswordStrengthIndicator password={formData.password} />}
            </div>

            {/* Confirmar senha (apenas no cadastro) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirmar senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    disabled={loading}
                    className="pl-10 pr-10 h-11"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-400"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Lembrar de mim (apenas no login) */}
            {isLogin && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                  disabled={loading}
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-600 dark:text-gray-400">
                  Lembrar meu e-mail
                </label>
              </div>
            )}

            {/* Checkbox de termos (apenas no cadastro) */}
            {!isLogin && (
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                  disabled={loading}
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-600 dark:text-gray-400">
                  Aceito receber novidades, promoções e comunicações por email ou WhatsApp. Consulte nossa{' '}
                  <Link href="/politica-privacidade" className="text-brand-600 hover:underline">
                    Política de Privacidade
                  </Link>.
                </label>
              </div>
            )}

            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Botão de submit */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-brand-600 hover:bg-brand-700"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  {isLogin ? 'Entrando...' : 'Cadastrando...'}
                </div>
              ) : (
                isLogin ? 'Entrar' : 'Concluir cadastro'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}