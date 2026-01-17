'use client';

import React from 'react';
import { Card, CardContent } from '../../src/components/ui/card';
import { Compass, ArrowLeft, Shield, Lock, Eye, UserCheck, Bell, Database, Trash2, Mail } from 'lucide-react';
import Link from 'next/link';

/**
 * Página de Política de Privacidade
 */
export default function PoliticaPrivacidadePage() {
  const sections = [
    {
      icon: Database,
      title: '1. Coleta de Dados',
      content: `Coletamos informações que você nos fornece diretamente ao criar uma conta e usar nossos serviços:

• Dados de identificação: nome completo, endereço de e-mail e número de telefone
• Dados de acesso: credenciais de login (senha armazenada de forma criptografada)
• Dados financeiros: informações sobre receitas, despesas, investimentos e patrimônio que você cadastrar voluntariamente
• Dados de uso: informações sobre como você utiliza nosso aplicativo, incluindo acessos e interações

Não coletamos dados financeiros de contas bancárias ou cartões de crédito automaticamente. Todas as informações são inseridas manualmente por você.`
    },
    {
      icon: Eye,
      title: '2. Uso dos Dados',
      content: `Utilizamos suas informações para:

• Fornecer e manter nossos serviços de controle financeiro
• Personalizar sua experiência no aplicativo
• Enviar notificações sobre atualizações, novas funcionalidades e dicas financeiras (mediante consentimento)
• Comunicar sobre promoções e ofertas especiais (mediante consentimento)
• Melhorar nossos serviços e desenvolver novas funcionalidades
• Prevenir fraudes e garantir a segurança da plataforma
• Cumprir obrigações legais e regulatórias`
    },
    {
      icon: Shield,
      title: '3. Proteção dos Dados',
      content: `Implementamos medidas técnicas e organizacionais para proteger seus dados:

• Criptografia de ponta a ponta para dados sensíveis
• Senhas armazenadas com hash seguro (bcrypt)
• Conexões seguras via HTTPS/TLS
• Servidores em data centers com certificações de segurança
• Controle de acesso restrito aos dados
• Monitoramento contínuo contra ameaças
• Backups regulares e seguros

Suas informações financeiras são armazenadas de forma segura e nunca são compartilhadas com terceiros para fins comerciais.`
    },
    {
      icon: UserCheck,
      title: '4. Compartilhamento de Dados',
      content: `Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto nas seguintes situações:

• Prestadores de serviço: empresas que nos auxiliam na operação do serviço (hospedagem, email), sob acordos de confidencialidade
• Obrigação legal: quando exigido por lei, ordem judicial ou autoridade competente
• Proteção de direitos: para proteger nossos direitos, propriedade ou segurança, e de nossos usuários
• Consentimento: quando você autorizar expressamente o compartilhamento

Em caso de fusão, aquisição ou venda de ativos, seus dados poderão ser transferidos, mediante aviso prévio.`
    },
    {
      icon: Bell,
      title: '5. Comunicações',
      content: `Podemos enviar comunicações por email e/ou WhatsApp:

• Transacionais: confirmações de cadastro, recuperação de senha, alertas de segurança
• Informativas: atualizações do serviço, novas funcionalidades
• Promocionais: ofertas, promoções e conteúdo relevante (apenas com seu consentimento)

Você pode gerenciar suas preferências de comunicação a qualquer momento nas configurações da sua conta ou clicando em "cancelar inscrição" nos emails recebidos.`
    },
    {
      icon: Lock,
      title: '6. Seus Direitos',
      content: `De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:

• Acesso: solicitar uma cópia dos seus dados pessoais
• Correção: atualizar dados incorretos ou desatualizados
• Exclusão: solicitar a remoção dos seus dados
• Portabilidade: receber seus dados em formato estruturado
• Revogação: retirar o consentimento a qualquer momento
• Oposição: opor-se ao tratamento de dados em determinadas situações

Para exercer seus direitos, entre em contato através do email disponível no final desta política.`
    },
    {
      icon: Trash2,
      title: '7. Retenção e Exclusão',
      content: `Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário para fornecer nossos serviços.

Após a exclusão da conta:
• Dados pessoais são removidos em até 30 dias
• Alguns dados podem ser retidos por mais tempo para cumprimento de obrigações legais
• Backups são excluídos conforme nossa política de retenção (até 90 dias)

Você pode solicitar a exclusão completa da sua conta e dados a qualquer momento através das configurações ou entrando em contato conosco.`
    },
    {
      icon: Database,
      title: '8. Cookies e Tecnologias',
      content: `Utilizamos cookies e tecnologias similares para:

• Manter você conectado à sua conta
• Lembrar suas preferências
• Analisar o uso do serviço para melhorias
• Garantir a segurança da plataforma

Tipos de cookies utilizados:
• Essenciais: necessários para o funcionamento do site
• Funcionais: melhoram sua experiência de uso
• Analíticos: nos ajudam a entender como o site é usado

Você pode gerenciar cookies através das configurações do seu navegador.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <Card className="shadow-2xl mb-6">
          <CardContent className="p-8">
            {/* Botão Voltar */}
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Link>

            {/* Logo e Título */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-xl mb-4">
                <Compass className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Política de Privacidade
              </h1>
              <p className="text-gray-500 text-sm">
                Financeiro SaaS
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Última atualização: Janeiro de 2026
              </p>
            </div>

            {/* Introdução */}
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 text-sm leading-relaxed">
                A sua privacidade é importante para nós. Esta Política de Privacidade explica como coletamos,
                usamos, armazenamos e protegemos suas informações pessoais quando você utiliza o Financeiro SaaS.
                Ao utilizar nossos serviços, você concorda com as práticas descritas nesta política.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Seções */}
        {sections.map((section, index) => (
          <Card key={index} className="shadow-lg mb-4">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-brand-100 rounded-lg">
                    <section.icon className="w-5 h-5 text-brand-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    {section.title}
                  </h2>
                  <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Contato */}
        <Card className="shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-brand-100 rounded-lg">
                  <Mail className="w-5 h-5 text-brand-600" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  9. Contato
                </h2>
                <div className="text-gray-600 text-sm leading-relaxed">
                  <p className="mb-3">
                    Se você tiver dúvidas sobre esta Política de Privacidade ou quiser exercer seus direitos,
                    entre em contato conosco:
                  </p>
                  <p className="mb-2">
                    <strong>E-mail:</strong> privacidade@financeirosaas.com.br
                  </p>
                  <p>
                    Responderemos sua solicitação em até 15 dias úteis, conforme previsto na LGPD.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs py-4">
          <p>
            Esta política pode ser atualizada periodicamente. Recomendamos que você a revise regularmente.
          </p>
          <p className="mt-2">
            © 2026 Financeiro SaaS. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}