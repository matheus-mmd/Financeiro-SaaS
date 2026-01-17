"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "../src/components/ui/button";
import { Card, CardContent } from "../src/components/ui/card";
import {
  ArrowRight,
  TrendingUp,
  PiggyBank,
  BarChart3,
  Shield,
  Smartphone,
  Zap,
  CheckCircle2,
  Target,
  Users,
  Star,
  XCircle,
  CreditCard,
  Bell,
  Calendar,
  FileText,
  Repeat,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Lock,
  Globe,
  Compass,
  CircleDollarSign,
  Wallet,
  Calculator,
  TrendingDown,
  HeartCrack,
  FileSpreadsheet,
  Check,
  X,
} from "lucide-react";

/**
 * Landing Page - Página inicial do Financeiro SaaS
 * Design moderno inspirado em aplicativos financeiros de sucesso
 */
export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const problems = [
    {
      icon: HelpCircle,
      title: "Você não sabe para onde vai seu dinheiro?",
      description: "Final do mês chega e a grana já era? Você trabalha sem parar e nunca sobra nada...",
      color: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      icon: FileSpreadsheet,
      title: "Planilhas confusas e desatualizadas?",
      description: "Aquela planilha do Excel que você começou com empolgação, mas abandonou na segunda semana...",
      color: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: TrendingDown,
      title: "Contas atrasadas e juros acumulando?",
      description: "Sempre se enganar nas contas? E os juros vão crescendo... até você perceber, o buraco já cresceu.",
      color: "bg-rose-100",
      iconColor: "text-rose-600",
    },
    {
      icon: HeartCrack,
      title: "Casal brigando por dinheiro?",
      description: "Falta de transparência nas finanças é uma das maiores causas de conflito entre casais.",
      color: "bg-violet-100",
      iconColor: "text-violet-600",
    },
  ];

  const features = [
    {
      icon: TrendingUp,
      title: "Controle Total",
      description: "Registre receitas e despesas em segundos. Visualize tudo em um só lugar de forma organizada.",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      icon: Repeat,
      title: "Transações Recorrentes",
      description: "Cadastre uma vez, replique todo mês automaticamente. Economize tempo com contas fixas.",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: Bell,
      title: "Lembretes Inteligentes",
      description: "Alerta das suas contas antes do vencimento. Nunca mais pague juros por esquecimento.",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      icon: CreditCard,
      title: "Cartões de Crédito",
      description: "Registre suas faturas, importe faturas por PDF com IA. Saiba exatamente o que deve em cada cartão.",
      color: "text-violet-600",
      bgColor: "bg-violet-100",
    },
    {
      icon: Users,
      title: "Conta Conjunta",
      description: "Gerencie as finanças com seu parceiro(a) com visão individual e compartilhada. Transparência total.",
      color: "text-pink-600",
      bgColor: "bg-pink-100",
    },
    {
      icon: PiggyBank,
      title: "Investimentos",
      description: "Acompanhe a evolução do seu patrimônio. Veja quanto você tem investido e como está rendendo.",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      icon: Calendar,
      title: "Visão Anual",
      description: "Análise completa com gráficos da sua trajetória. Entenda sua evolução ao longo do tempo.",
      color: "text-brand-600",
      bgColor: "bg-brand-100",
    },
    {
      icon: FileText,
      title: "Importação de Faturas",
      description: "Importe PDF de qualquer banco. IA extrai automaticamente todas as transações para você.",
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
    },
    {
      icon: Zap,
      title: "Assistente IA",
      description: "Assistente inteligente que entende suas finanças, dá dicas e ajuda no dia a dia.",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
  ];

  const comparisonPlanilhas = [
    "Precisa criar fórmulas manualmente",
    "Fácil de esquecer de atualizar",
    "Não avisa sobre contas a vencer",
    "Difícil de usar no celular",
    "Sem gráficos automáticos",
    "Trabalhoso para usar a longo prazo",
    "Não sincroniza entre dispositivos",
    "Sem assistente para tirar dúvidas",
  ];

  const comparisonApp = [
    "Tudo calculado automaticamente",
    "Transações recorrentes automáticas",
    "Lembretes de contas a vencer",
    "Funciona perfeitamente no celular",
    "Gráficos e relatórios instantâneos",
    "Importe faturas de cartão por IA",
    "Acesse de qualquer dispositivo",
    "Baseado IA para ajudar você",
  ];

  const whyChoose = [
    {
      icon: Zap,
      title: "Simples e Direto",
      description: "Sem complicação. Interface limpa e fácil, pra que você realmente preenche.",
    },
    {
      icon: Shield,
      title: "Dados Seguros",
      description: "Seus dados ficam sempre seguros. Criptografia de ponta a ponta.",
    },
    {
      icon: Globe,
      title: "Feito para Brasileiros",
      description: "Pensado para o dia a dia do brasileiro. De PIX ao parcelamento.",
    },
    {
      icon: Smartphone,
      title: "Acesse de Qualquer Lugar",
      description: "Funciona em celular, tablet ou computador. Seus dados sempre com você.",
    },
  ];

  const testimonials = [
    {
      name: "Maria S.",
      location: "CLT, São Paulo",
      text: "Finalmente consegui ver para onde meu dinheiro ia! Em 2 meses economizei R$ 600.",
      rating: 5,
    },
    {
      name: "João P.",
      location: "Autônomo, Rio de Janeiro",
      text: "Como autônomo, era difícil controlar entradas irregulares. O dashboard me salvou.",
      rating: 5,
    },
    {
      name: "Ana e Carlos",
      location: "Casal, Belo Horizonte",
      text: "A conta conjunta salvou nosso casamento! Agora temos total transparência financeira.",
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: "Quanto custa o Financeiro SaaS?",
      answer: "Oferecemos um plano gratuito com recursos essenciais e planos pagos com funcionalidades avançadas como importação de faturas por IA, conta conjunta e assistente inteligente.",
    },
    {
      question: "Funciona para autônomos?",
      answer: "Sim! O app é perfeito para autônomos. Você pode registrar receitas variáveis, controlar despesas do negócio e ter uma visão clara do seu fluxo de caixa.",
    },
    {
      question: "Posso usar com meu parceiro(a)?",
      answer: "Sim! Com a conta conjunta, vocês podem gerenciar as finanças juntos, com visão individual e compartilhada. Perfeito para casais que querem transparência financeira.",
    },
    {
      question: "Meus dados estão seguros?",
      answer: "Absolutamente! Utilizamos criptografia de ponta a ponta, servidores seguros e seguimos todas as normas da LGPD. Seus dados financeiros são 100% protegidos.",
    },
    {
      question: "Posso testar antes de comprar?",
      answer: "Claro! Oferecemos um período de teste gratuito para você conhecer todas as funcionalidades antes de decidir. Sem compromisso.",
    },
    {
      question: "Como funciona a importação de faturas?",
      answer: "Basta fazer upload do PDF da fatura do seu cartão de crédito. Nossa IA extrai automaticamente todas as transações e categoriza para você. Simples e rápido!",
    },
  ];

  const stats = [
    { value: "200+", label: "clientes ativos" },
    { value: "R$ 500K+", label: "em finanças gerenciadas" },
    { value: "4.9", label: "avaliação 5 estrelas", hasStar: true },
    { value: "98%", label: "taxa de satisfação" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Financeiro SaaS</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:inline-flex text-gray-700 hover:text-gray-900">
                  Entrar
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-600/25">
                  Começar Agora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>Controle Financeiro Inteligente</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Seu dinheiro sob controle.
            </h1>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-600 mb-6">
              De verdade.
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              O Financeiro SaaS é o app que <strong>controla seu dinheiro</strong> de forma simples,
              mostrando exatamente para onde vai cada centavo.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link href="/login">
                <Button size="lg" className="bg-brand-600 hover:bg-brand-700 text-lg px-8 py-6 shadow-lg shadow-brand-600/25">
                  Começar Grátis Agora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-600" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-600" />
                <span>Dados 100% seguros</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-600" />
                <span>Cancele quando quiser</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section - "Você se identifica?" */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Você se identifica?
            </h2>
            <p className="text-lg text-gray-600">
              Milhões de brasileiros vivem perdidos financeiramente. Não precisa ser assim.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {problems.map((problem, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${problem.color} flex items-center justify-center flex-shrink-0`}>
                      <problem.icon className={`w-6 h-6 ${problem.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{problem.title}</h3>
                      <p className="text-gray-600 text-sm">{problem.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-brand-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            E se existisse uma solução para suas finanças?
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Um app que mostra exatamente onde você está e para onde seu dinheiro vai.
            Simples, visual e direto ao ponto.
          </p>
        </div>
      </section>

      {/* Comparison Section - Planilhas vs App */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Planilhas vs Financeiro SaaS
            </h2>
            <p className="text-lg text-gray-600">
              Veja por que milhares de pessoas estão trocando as planilhas pelo Financeiro SaaS
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Planilhas */}
            <Card className="border-2 border-rose-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-rose-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Planilhas</h3>
                </div>
                <ul className="space-y-3">
                  {comparisonPlanilhas.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <X className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Financeiro SaaS */}
            <Card className="border-2 border-brand-300 shadow-lg relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-brand-600 text-white text-xs font-semibold rounded-full">
                  Grátis
                </span>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                    <Compass className="w-5 h-5 text-brand-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Financeiro SaaS</h3>
                </div>
                <ul className="space-y-3">
                  {comparisonApp.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-10">
            <Link href="/login">
              <Button size="lg" className="bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-600/25">
                Trocar Planilha pelo App
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa. Nada que não precisa.
            </h2>
            <p className="text-lg text-gray-600">
              Funcionalidades pensadas para resolver problemas reais do seu dia a dia financeiro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 flex items-center justify-center gap-1">
                  {stat.value}
                  {stat.hasStar && <Star className="w-6 h-6 fill-amber-400 text-amber-400" />}
                </div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o Financeiro SaaS?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {whyChoose.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Quem usa, recomenda
            </h2>
            <p className="text-lg text-gray-600">
              Veja o que nossos usuários estão dizendo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.location}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border border-gray-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Pronto para organizar suas finanças?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de brasileiros que finalmente têm controle sobre suas finanças.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Testar Grátis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-white/75">
            Sem compromisso • Cancele quando quiser
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Financeiro SaaS</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/politica-privacidade" className="hover:text-white transition-colors">
                Política de Privacidade
              </Link>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Financeiro SaaS. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}