'use client';

import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Check, Star, MessageCircle } from 'lucide-react';

/**
 * Cards de Planos para o Dashboard
 * Exibe os planos BASIC e PRO de forma alinhada e visualmente atraente
 */
export default function PricingCards() {
  const plans = [
    {
      id: 'basic',
      name: 'BASIC',
      description: 'Para organizar seus gastos',
      features: [
        'Controle de receitas e despesas',
        'Conta individual ou conjunta',
        'Importação de fatura com IA',
        'Gráficos e relatórios',
        'Transações recorrentes',
        'App para Android e iOS',
      ],
      priceOriginal: 70.80,
      price: 25.97,
      monthlyPrice: 5.90,
      discount: 63,
      isRecommended: false,
      buttonVariant: 'outline',
      buttonText: 'Escolher BASIC',
    },
    {
      id: 'pro',
      name: 'PRO',
      description: 'Para tomar decisões financeiras melhores com ajuda da IA',
      features: [
        'Tudo do plano BASIC',
        'Assistente IA via WhatsApp 💬',
        'Metas financeiras com acompanhamento',
        'Orçamento por categoria',
        'Comparativo mensal detalhado',
        'Insights personalizados com IA',
      ],
      highlightedFeature: 'Assistente IA via WhatsApp 💬',
      priceOriginal: 178.80,
      price: 69.90,
      monthlyPrice: 14.90,
      discount: 61,
      isRecommended: true,
      buttonVariant: 'default',
      buttonText: 'Escolher PRO',
      ctaText: 'Controle total pelo WhatsApp + Insights com IA!',
    },
  ];

  const handleSelectPlan = (planId) => {
    // TODO: Implementar navegação para página de checkout
    console.log('Plano selecionado:', planId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
            plan.isRecommended
              ? 'border-2 border-brand-500 shadow-lg'
              : 'border border-gray-200 shadow-md'
          }`}
        >
          {/* Badge Recomendado */}
          {plan.isRecommended && (
            <div className="absolute top-0 left-0 right-0 bg-brand-600 text-white text-center py-2 text-xs font-semibold">
              <div className="flex items-center justify-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-white" />
                RECOMENDADO
              </div>
            </div>
          )}

          <CardContent className={`p-6 ${plan.isRecommended ? 'pt-12' : ''}`}>
            {/* Nome e descrição */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                {plan.name}
                {plan.id === 'pro' && <MessageCircle className="w-5 h-5 text-brand-600" />}
              </h3>
              <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
            </div>

            {/* Features */}
            <ul className="space-y-2.5 mb-6 min-h-[180px]">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <Check
                    className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                      feature === plan.highlightedFeature ? 'text-brand-600' : 'text-gray-400'
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      feature === plan.highlightedFeature
                        ? 'text-brand-700 font-medium'
                        : 'text-gray-600'
                    }`}
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA especial para PRO */}
            {plan.isRecommended && plan.ctaText && (
              <div className="mb-4 p-3 bg-brand-50 border border-brand-200 rounded-lg text-center">
                <p className="text-xs text-brand-700 font-medium flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  {plan.ctaText}
                </p>
              </div>
            )}

            {/* Preço */}
            <div className="text-center mb-4">
              <p className="text-gray-500 text-sm mb-1">A partir de</p>
              <div className="flex items-baseline justify-center gap-2 mb-1">
                <span className="text-gray-400 line-through text-lg">
                  R$ {plan.priceOriginal.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-4xl font-bold text-brand-600">
                  R$ {plan.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-gray-500 text-sm">/ano</span>
              </div>
              <p className="text-brand-600 text-sm font-semibold mb-1">
                Economize {plan.discount}%!
              </p>
              <p className="text-gray-400 text-xs">
                ou R$ {plan.monthlyPrice.toFixed(2).replace('.', ',')}/mês
              </p>
            </div>

            {/* Botão */}
            <Button
              onClick={() => handleSelectPlan(plan.id)}
              variant={plan.buttonVariant}
              className={`w-full h-11 font-semibold ${
                plan.isRecommended
                  ? 'bg-brand-600 hover:bg-brand-700 text-white'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {plan.buttonText}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}