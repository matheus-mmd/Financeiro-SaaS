'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/contexts/AuthContext';
import { Button } from '../../src/components/ui/button';
import { Card, CardContent } from '../../src/components/ui/card';
import {
  Compass,
  Check,
  Star,
  Zap,
  Clock,
  LogOut,
  MessageCircle,
  CreditCard,
  FileText,
  QrCode,
  Shield,
  X,
} from 'lucide-react';
import { getPlans, formatPrice, calculateDiscount } from '../../src/lib/supabase/api/plans';

/**
 * Modal de Checkout
 */
const CheckoutModal = ({ isOpen, onClose, plan, billingCycle }) => {
  const [selectedPayment, setSelectedPayment] = useState('credit_card');

  if (!isOpen || !plan) return null;

  const price = billingCycle === 'yearly' ? plan.price_yearly_cents : plan.price_monthly_cents;
  const priceFormatted = formatPrice(price);

  const paymentMethods = [
    {
      id: 'credit_card',
      name: 'Cartão de Crédito',
      description: 'Renovação automática • Cancele quando quiser',
      icon: CreditCard,
      badge: 'Automático',
      badgeColor: 'bg-brand-100 text-brand-700',
    },
    {
      id: 'boleto',
      name: 'Boleto Bancário',
      description: 'Pagamento único • Vencimento em 3 dias',
      icon: FileText,
      badge: null,
    },
    {
      id: 'pix',
      name: 'PIX',
      description: 'Pagamento único • Aprovação instantânea',
      icon: QrCode,
      badge: null,
    },
  ];

  const handleConfirm = () => {
    // TODO: Integrar com gateway de pagamento (Mercado Pago, Stripe, etc.)
    // Por enquanto, redireciona para configuração do perfil
    onClose();
    window.location.href = '/configurar-perfil';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-brand-100 rounded-full">
              <Zap className="w-6 h-6 text-brand-600" />
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-1">Falta pouco...</h2>
          <p className="text-gray-500 text-sm mb-6">Complete sua assinatura do plano escolhido</p>

          {/* Plano selecionado */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {plan.name} {billingCycle === 'yearly' ? 'Anual' : 'Mensal'}
                  </span>
                  <span className="px-2 py-0.5 bg-brand-100 text-brand-700 text-xs font-medium rounded-full">
                    Promoção 2026
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Cobrança {billingCycle === 'yearly' ? 'anual' : 'mensal'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">R$ {priceFormatted}</span>
              </div>
            </div>
          </div>

          {/* Formas de pagamento */}
          <p className="text-sm font-medium text-gray-700 mb-3">Escolha a forma de pagamento:</p>
          <div className="space-y-3 mb-6">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                  selectedPayment === method.id
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedPayment === method.id ? 'bg-brand-100' : 'bg-gray-100'
                }`}>
                  <method.icon className={`w-5 h-5 ${
                    selectedPayment === method.id ? 'text-brand-600' : 'text-gray-500'
                  }`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{method.name}</span>
                    {method.badge && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${method.badgeColor}`}>
                        {method.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{method.description}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPayment === method.id
                    ? 'border-brand-500 bg-brand-500'
                    : 'border-gray-300'
                }`}>
                  {selectedPayment === method.id && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Segurança */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-6">
            <Shield className="w-4 h-4" />
            <span>Pagamento 100% seguro via Mercado Pago</span>
          </div>

          {/* Botão confirmar */}
          <Button
            onClick={handleConfirm}
            className="w-full h-12 bg-brand-600 hover:bg-brand-700 text-base font-semibold"
          >
            Confirmar Pagamento
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Página de Seleção de Planos
 */
export default function EscolherPlanoPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [checkoutModal, setCheckoutModal] = useState({ isOpen: false, plan: null, billingCycle: 'yearly' });

  // Buscar planos
  useEffect(() => {
    async function fetchPlans() {
      try {
        const { data, error } = await getPlans();
        if (!error && data) {
          setPlans(data);
        }
      } catch (err) {
        console.error('Erro ao buscar planos:', err);
      } finally {
        setLoadingPlans(false);
      }
    }
    fetchPlans();
  }, []);

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const handleSelectPlan = (plan, billingCycle) => {
    setCheckoutModal({ isOpen: true, plan, billingCycle });
  };

  const handleStartTrial = () => {
    // Redirecionar para configuração do perfil antes do dashboard
    router.push('/configurar-perfil');
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-xl mb-4">
            <Compass className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Financeiro SaaS</h1>
          <p className="text-gray-500">Escolha o plano ideal para você</p>
        </div>

        {/* Banner Promocional */}
        <Card className="mb-8 border-2 border-brand-200 bg-gradient-to-r from-brand-50 to-white">
          <CardContent className="p-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-2">
              <Zap className="w-4 h-4" />
              OFERTA EXCLUSIVA 2026
            </div>
            <h2 className="text-xl font-bold text-brand-700 mb-1">🔥 Preços PROMOCIONAIS!</h2>
            <p className="text-brand-600 font-medium mb-2">Restam 36 de 50 vagas</p>
            <p className="text-sm text-gray-500">✨ Preço garantido enquanto você for assinante ✨</p>
          </CardContent>
        </Card>

        {/* Planos */}
        {loadingPlans ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[1, 2].map((i) => (
              <Card key={i} className="overflow-hidden border border-gray-200 shadow-md">
                <CardContent className="p-6 animate-pulse">
                  {/* Nome e descricao */}
                  <div className="text-center mb-6">
                    <div className="h-7 bg-gray-200 rounded w-24 mx-auto mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-48 mx-auto" />
                  </div>
                  {/* Features */}
                  <div className="space-y-2.5 mb-6">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <div key={j} className="flex items-center gap-2.5">
                        <div className="w-4 h-4 bg-gray-200 rounded-full flex-shrink-0" />
                        <div className="h-4 bg-gray-100 rounded flex-1" />
                      </div>
                    ))}
                  </div>
                  {/* Vagas */}
                  <div className="text-center mb-4">
                    <div className="h-3 bg-gray-100 rounded w-40 mx-auto mb-1" />
                    <div className="h-3 bg-gray-100 rounded w-24 mx-auto" />
                  </div>
                  {/* Precos */}
                  <div className="space-y-3">
                    <div className="h-16 bg-gray-50 rounded-lg" />
                    <div className="h-20 bg-gray-50 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {plans.map((plan) => {
              const isRecommended = plan.is_recommended;
              const yearlyDiscount = calculateDiscount(plan.price_original_yearly_cents, plan.price_yearly_cents);
              const monthlyDiscount = calculateDiscount(plan.price_original_monthly_cents, plan.price_monthly_cents);

              return (
                <Card
                  key={plan.id}
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    isRecommended
                      ? 'border-2 border-brand-500 shadow-lg'
                      : 'border border-gray-200 shadow-md'
                  }`}
                >
                  {/* Badge Recomendado */}
                  {isRecommended && (
                    <div className="absolute top-0 left-0 right-0 bg-brand-600 text-white text-center py-2 text-sm font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <Star className="w-4 h-4 fill-white" />
                        RECOMENDADO
                      </div>
                    </div>
                  )}

                  <CardContent className={`p-6 ${isRecommended ? 'pt-14' : ''}`}>
                    {/* Nome e descrição */}
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                        {plan.name}
                        {plan.slug === 'pro' && <MessageCircle className="w-5 h-5 text-brand-600" />}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5 mb-6">
                      {plan.features?.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            feature.is_highlighted ? 'text-brand-600' : 'text-gray-400'
                          }`} />
                          <span className={`text-sm ${
                            feature.is_highlighted ? 'text-brand-700 font-medium' : 'text-gray-600'
                          }`}>
                            {feature.feature_text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA especial para PRO */}
                    {isRecommended && (
                      <div className="mb-6 p-3 bg-brand-50 border border-brand-200 rounded-lg text-center">
                        <p className="text-sm text-brand-700 font-medium flex items-center justify-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Converse com a IA para controlar finanças!
                        </p>
                      </div>
                    )}

                    {/* Badge de vagas */}
                    <div className="text-center mb-4">
                      <span className="text-xs text-amber-600 font-medium">
                        {isRecommended ? '⚡ Preços promocionais esgotando!' : '⚡ Lote 1 esgotado! Lote 2 disponível'}
                      </span>
                      <p className="text-xs text-gray-400">Restam 36 vagas!</p>
                    </div>

                    {/* Preços */}
                    <div className="space-y-3">
                      {/* Mensal */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="text-sm text-gray-500">Mensal</span>
                          <div className="flex items-baseline gap-2">
                            {plan.price_original_monthly_cents && (
                              <span className="text-sm text-gray-400 line-through">
                                R$ {formatPrice(plan.price_original_monthly_cents)}
                              </span>
                            )}
                            <span className="text-xl font-bold text-gray-900">
                              R$ {formatPrice(plan.price_monthly_cents)}
                            </span>
                            <span className="text-sm text-gray-500">/mês</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectPlan(plan, 'monthly')}
                          className="border-gray-300"
                        >
                          Assinar
                        </Button>
                      </div>

                      {/* Anual */}
                      <div className={`flex items-center justify-between p-3 rounded-lg ${
                        isRecommended ? 'bg-brand-50 border border-brand-200' : 'bg-gray-50'
                      }`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Anual</span>
                            {isRecommended && (
                              <span className="px-2 py-0.5 bg-brand-600 text-white text-xs font-medium rounded">
                                MELHOR VALOR
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-2">
                            {plan.price_original_yearly_cents && (
                              <span className="text-sm text-gray-400 line-through">
                                R$ {formatPrice(plan.price_original_yearly_cents)}
                              </span>
                            )}
                            <span className="text-xl font-bold text-gray-900">
                              R$ {formatPrice(plan.price_yearly_cents)}
                            </span>
                            <span className="text-sm text-gray-500">/ano</span>
                          </div>
                          {yearlyDiscount > 0 && (
                            <span className="text-xs text-brand-600 font-medium">
                              Economize {yearlyDiscount}%!
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSelectPlan(plan, 'yearly')}
                          className={isRecommended ? 'bg-brand-600 hover:bg-brand-700' : ''}
                          variant={isRecommended ? 'default' : 'outline'}
                        >
                          Assinar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Teste Grátis */}
        <Card className="mb-6 bg-white">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-4">
              <Clock className="w-4 h-4" />
              Teste Grátis por 3 Dias
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Ainda não decidiu? Teste grátis!</h3>
            <p className="text-gray-600 mb-6">
              Acesso completo a todas as funcionalidades. <strong>Sem precisar de cartão.</strong>
            </p>
            <Button
              size="lg"
              onClick={handleStartTrial}
              className="bg-brand-600 hover:bg-brand-700 text-lg px-8"
            >
              <Zap className="w-5 h-5 mr-2" />
              Começar Teste Grátis Agora
            </Button>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-brand-600" />
                <span>Sem compromisso</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-brand-600" />
                <span>Cancele quando quiser</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-brand-600" />
                <span>Sem cartão de crédito</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sair da conta */}
        <div className="text-center">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da conta</span>
          </button>
        </div>
      </div>

      {/* Modal de Checkout */}
      <CheckoutModal
        isOpen={checkoutModal.isOpen}
        onClose={() => setCheckoutModal({ isOpen: false, plan: null, billingCycle: 'yearly' })}
        plan={checkoutModal.plan}
        billingCycle={checkoutModal.billingCycle}
      />
    </div>
  );
}