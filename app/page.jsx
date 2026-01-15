"use client";

import React from "react";
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
} from "lucide-react";

/**
 * Landing Page - Página inicial do Financeiro SaaS
 * Design moderno e responsivo com seções de hero, features, benefícios e CTA
 */
export default function LandingPage() {
  const features = [
    {
      icon: TrendingUp,
      title: "Controle Total",
      description: "Acompanhe todas as suas receitas, despesas e patrimônio em um só lugar",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: BarChart3,
      title: "Análises Inteligentes",
      description: "Gráficos e relatórios detalhados para entender seus hábitos financeiros",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: PiggyBank,
      title: "Gestão de Patrimônio",
      description: "Monitore seus investimentos e acompanhe o crescimento do seu patrimônio",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      icon: Target,
      title: "Metas Financeiras",
      description: "Defina objetivos e acompanhe seu progresso em tempo real",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      icon: Shield,
      title: "Segurança Garantida",
      description: "Seus dados protegidos com criptografia de ponta a ponta",
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      icon: Smartphone,
      title: "Acesso Multiplataforma",
      description: "Gerencie suas finanças de qualquer dispositivo, a qualquer hora",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Crie sua Conta",
      description: "Cadastre-se gratuitamente em menos de 2 minutos",
    },
    {
      step: "02",
      title: "Adicione suas Transações",
      description: "Registre receitas, despesas e investimentos facilmente",
    },
    {
      step: "03",
      title: "Visualize Resultados",
      description: "Acompanhe dashboards inteligentes e tome decisões melhores",
    },
  ];

  const benefits = [
    "Controle completo de receitas e despesas",
    "Gestão de patrimônio e investimentos",
    "Gráficos e relatórios personalizados",
    "Categorização automática de transações",
    "Alertas e notificações inteligentes",
    "Suporte prioritário",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header/Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-purple-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Financeiro SaaS</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Recursos
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
                Como Funciona
              </a>
              <a href="#benefits" className="text-gray-600 hover:text-gray-900 transition-colors">
                Benefícios
              </a>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:inline-flex">
                  Entrar
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700">
                  Começar Grátis
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>Controle Financeiro Inteligente</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Organize suas Finanças e{" "}
              <span className="bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
                Conquiste seus Objetivos
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Gerencie receitas, despesas e patrimônio em uma plataforma simples e intuitiva.
              Tome decisões financeiras mais inteligentes com dados em tempo real.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 text-lg px-8 py-6">
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Ver Demonstração
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Acesso completo</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">10k+</div>
              <div className="text-gray-600">Usuários Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">R$ 50M+</div>
              <div className="text-gray-600">Gerenciados</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">4.9/5</div>
              <div className="text-gray-600 flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                Avaliação
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa para{" "}
              <span className="text-purple-600">gerenciar suas finanças</span>
            </h2>
            <p className="text-lg text-gray-600">
              Ferramentas poderosas e intuitivas para transformar sua relação com o dinheiro
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Como Funciona
            </h2>
            <p className="text-lg text-gray-600">
              Comece a gerenciar suas finanças em 3 passos simples
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-purple-600 text-white text-2xl font-bold mb-6">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-purple-300 to-green-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Por que escolher o{" "}
                <span className="text-purple-600">Financeiro SaaS</span>?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Mais que uma ferramenta de controle financeiro, somos seu parceiro na
                construção de um futuro financeiro sólido.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              <Link href="/login">
                <Button size="lg" className="mt-8 bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700">
                  Começar Agora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            <div className="relative">
              <Card className="p-8 shadow-2xl">
                <CardContent className="p-0">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Receitas Mensais</div>
                          <div className="text-lg font-semibold text-gray-900">R$ 8.500,00</div>
                        </div>
                      </div>
                      <div className="text-green-600 text-sm font-medium">+12%</div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Despesas Mensais</div>
                          <div className="text-lg font-semibold text-gray-900">R$ 4.200,00</div>
                        </div>
                      </div>
                      <div className="text-red-600 text-sm font-medium">-5%</div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <PiggyBank className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Patrimônio Total</div>
                          <div className="text-lg font-semibold text-gray-900">R$ 45.300,00</div>
                        </div>
                      </div>
                      <div className="text-purple-600 text-sm font-medium">+8%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-600 to-purple-600 text-white overflow-hidden">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Pronto para transformar suas finanças?
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Junte-se a milhares de usuários que já estão no controle do seu dinheiro
              </p>
              <Link href="/login">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                  Criar Conta Gratuita
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <p className="mt-4 text-sm opacity-75">
                Sem compromisso • Cancele quando quiser
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-purple-600 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Financeiro SaaS</span>
              </div>
              <p className="text-gray-400 max-w-md">
                Sua plataforma completa para controle financeiro pessoal. Gerencie,
                analise e cresça seu patrimônio com inteligência.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Como Funciona</a></li>
                <li><a href="#benefits" className="hover:text-white transition-colors">Benefícios</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
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