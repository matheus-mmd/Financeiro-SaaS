'use client';

import React, { useState } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { Button } from '../../src/components/ui/button';
import { Input } from '../../src/components/ui/input';
import { Card, CardContent } from '../../src/components/ui/card';
import { Compass, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

/**
 * Página de Recuperação de Senha
 * Permite ao usuário solicitar um email para redefinir sua senha
 */
export default function EsqueciSenhaPage() {
  const { sendPasswordResetCode } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Por favor, informe seu e-mail');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, informe um e-mail válido');
      return;
    }

    setLoading(true);

    try {
      const { error } = await sendPasswordResetCode(email);

      if (error) {
        if (error.message?.includes('rate limit')) {
          setError('Muitas tentativas. Aguarde alguns minutos.');
        } else {
          setError('Ocorreu um erro. Tente novamente.');
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error('[EsqueciSenhaPage] Erro:', err);
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="p-8">
            {/* Logo e Título */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-xl mb-4">
                <Compass className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Email Enviado!
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Verifique sua caixa de entrada
              </p>
            </div>

            {/* Mensagem de sucesso */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Enviamos um link de recuperação para <strong>{email}</strong>.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Clique no link do email para criar uma nova senha. Se não encontrar, verifique a pasta de spam.
              </p>
            </div>

            <div className="mt-6">
              <Link href="/login">
                <Button variant="outline" className="w-full h-12">
                  Voltar para login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8">
          {/* Logo e Título */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-xl mb-4">
              <Compass className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Redefinir Senha
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Digite seu e-mail para receber um código de verificação
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* E-mail */}
            <div className="space-y-1.5">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  disabled={loading}
                  className="pl-10 h-11"
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

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
                  Enviando...
                </div>
              ) : (
                'Enviar Código'
              )}
            </Button>
          </form>

          {/* Link para voltar */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}