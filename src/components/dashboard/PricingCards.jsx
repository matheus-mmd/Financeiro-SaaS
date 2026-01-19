'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Check, Star, MessageCircle } from 'lucide-react';
import { getPlans, formatPrice, calculateDiscount } from '../../lib/supabase/api/plans';

/**
 * Cards de Planos para o Dashboard
 * Exibe os planos BASIC e PRO de forma alinhada e visualmente atraente
 * Busca dados dinamicamente do banco de dados
 */
export default function PricingCards() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Buscar planos do banco de dados
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
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const handleSelectPlan = (planId) => {
    // TODO: Implementar navegação para página de checkout
    console.log('Plano selecionado:', planId);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="border border-gray-200 shadow-md">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Se não houver planos, não renderizar nada
  if (plans.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {plans.map((plan) => {
        const isRecommended = plan.is_recommended;
        const yearlyDiscount = calculateDiscount(
          plan.price_original_yearly_cents,
          plan.price_yearly_cents
        );
        const monthlyEquivalent = plan.price_yearly_cents / 12 / 100; // Preço mensal equivalente ao anual

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
              <div className="absolute top-0 left-0 right-0 bg-brand-600 text-white text-center py-2 text-xs font-semibold">
                <div className="flex items-center justify-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-white" />
                  RECOMENDADO
                </div>
              </div>
            )}

            <CardContent className={`p-6 ${isRecommended ? 'pt-12' : ''}`}>
              {/* Nome e descrição */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                  {plan.name}
                  {plan.slug === 'pro' && <MessageCircle className="w-5 h-5 text-brand-600" />}
                </h3>
                <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-6 min-h-[180px]">
                {plan.features?.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        feature.is_highlighted ? 'text-brand-600' : 'text-gray-400'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        feature.is_highlighted
                          ? 'text-brand-700 font-medium'
                          : 'text-gray-600'
                      }`}
                    >
                      {feature.feature_text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA especial para PRO */}
              {isRecommended && (
                <div className="mb-4 p-3 bg-brand-50 border border-brand-200 rounded-lg text-center">
                  <p className="text-xs text-brand-700 font-medium flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Controle total pelo WhatsApp + Insights com IA!
                  </p>
                </div>
              )}

              {/* Preço */}
              <div className="text-center mb-4">
                <p className="text-gray-500 text-sm mb-1">A partir de</p>
                <div className="flex items-baseline justify-center gap-2 mb-1">
                  {plan.price_original_yearly_cents && (
                    <span className="text-gray-400 line-through text-lg">
                      R$ {formatPrice(plan.price_original_yearly_cents)}
                    </span>
                  )}
                  <span className="text-4xl font-bold text-brand-600">
                    R$ {formatPrice(plan.price_yearly_cents)}
                  </span>
                  <span className="text-gray-500 text-sm">/ano</span>
                </div>
                {yearlyDiscount > 0 && (
                  <p className="text-brand-600 text-sm font-semibold mb-1">
                    Economize {yearlyDiscount}%!
                  </p>
                )}
                <p className="text-gray-400 text-xs">
                  ou R$ {monthlyEquivalent.toFixed(2).replace('.', ',')}/mês
                </p>
              </div>

              {/* Botão */}
              <Button
                onClick={() => handleSelectPlan(plan.id)}
                variant={isRecommended ? 'default' : 'outline'}
                className={`w-full h-11 font-semibold ${
                  isRecommended
                    ? 'bg-brand-600 hover:bg-brand-700 text-white'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                Escolher {plan.name}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}