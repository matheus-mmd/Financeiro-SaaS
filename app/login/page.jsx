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
 * Página de Login e Cadastro MOCK
 * Interface unificada para autenticação de usuários
 * MODO DESENVOLVIMENTO: Aceita qualquer email/senha (mínimo 6 caracteres)
 */
export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, signIn, signUp } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/');
    }
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
          setError(error.message);
          setLoading(false);
          return;
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.name);

        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }
        setError('');
        setIsLogin(true);
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      }
    } catch (err) {
      console.error('[LoginPage] Erro inesperado:', err);
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

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