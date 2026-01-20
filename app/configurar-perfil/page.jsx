'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/contexts/AuthContext';
import { Button } from '../../src/components/ui/button';
import { Card, CardContent } from '../../src/components/ui/card';
import { Input } from '../../src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../src/components/ui/select';
import {
  Compass,
  ChevronLeft,
  ChevronRight,
  Check,
  Building2,
  Briefcase,
  User,
  Users,
  Plus,
  Trash2,
  Home,
  Sparkles,
} from 'lucide-react';
import { saveUserSetup, parseMoneyToCents } from '../../src/lib/supabase/api/setup';

const TOTAL_STEPS = 6;

/**
 * Indicador de progresso dos passos
 */
const StepIndicator = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex flex-col items-center gap-2 mb-8">
      <div className="flex items-center gap-1">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i < currentStep
                ? 'w-8 bg-brand-600'
                : i === currentStep
                ? 'w-8 bg-brand-400'
                : 'w-2 bg-gray-200'
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-gray-500">Passo {currentStep + 1} de {totalSteps}</span>
    </div>
  );
};

/**
 * Card de opção selecionável
 */
const OptionCard = ({ icon: Icon, title, subtitle, selected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 min-h-[140px] w-full ${
        selected
          ? 'border-brand-500 bg-brand-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-brand-200 hover:bg-gray-50'
      }`}
    >
      <Icon className={`w-8 h-8 mb-3 ${selected ? 'text-brand-600' : 'text-gray-400'}`} />
      <span className={`font-semibold ${selected ? 'text-brand-700' : 'text-gray-700'}`}>{title}</span>
      <span className="text-sm text-gray-500 mt-1">{subtitle}</span>
    </button>
  );
};

/**
 * Passo 1: Boas-vindas
 */
const Step1Welcome = ({ onNext }) => {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-100 rounded-2xl mb-6">
        <Compass className="w-10 h-10 text-brand-600" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Bem-vindo à Bússola Financeira!
      </h1>

      <p className="text-gray-600 mb-2 max-w-md mx-auto">
        Vamos configurar algumas informações iniciais para personalizar
        sua experiência e já criar suas primeiras transações recorrentes.
      </p>

      <p className="text-sm text-gray-500 mb-8">
        Isso levará apenas alguns minutos.
      </p>
    </div>
  );
};

/**
 * Passo 2: Tipo de trabalho
 */
const Step2WorkType = ({ workType, setWorkType }) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
        Qual é o seu tipo de trabalho?
      </h2>
      <p className="text-gray-500 text-center mb-8">
        Isso nos ajuda a categorizar melhor suas receitas e despesas.
      </p>

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        <OptionCard
          icon={Building2}
          title="CLT"
          subtitle="Carteira assinada"
          selected={workType === 'clt'}
          onClick={() => setWorkType('clt')}
        />
        <OptionCard
          icon={Briefcase}
          title="Autônomo"
          subtitle="Conta própria"
          selected={workType === 'autonomo'}
          onClick={() => setWorkType('autonomo')}
        />
      </div>
    </div>
  );
};

/**
 * Passo 3: Tipo de conta
 */
const Step3AccountType = ({ accountType, setAccountType, members, setMembers, userEmail }) => {
  const addMember = () => {
    setMembers([...members, { email: '', phone: '', workType: '' }]);
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const formatPhone = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');

    // Formata como (XX) XXXXX-XXXX
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
        Este controle é individual ou conjunto?
      </h2>
      <p className="text-gray-500 text-center mb-8">
        Você pode gerenciar as finanças sozinho ou com outras pessoas.
      </p>

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
        <OptionCard
          icon={User}
          title="Individual"
          subtitle="Só para mim"
          selected={accountType === 'individual'}
          onClick={() => setAccountType('individual')}
        />
        <OptionCard
          icon={Users}
          title="Conjunta"
          subtitle="Com outras pessoas"
          selected={accountType === 'conjunta'}
          onClick={() => setAccountType('conjunta')}
        />
      </div>

      {/* Seção de integrantes (apenas para conta conjunta) */}
      {accountType === 'conjunta' && (
        <div className="max-w-md mx-auto mt-8 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Integrantes da conta</span>
            <Button
              variant="outline"
              size="sm"
              onClick={addMember}
              className="text-brand-600 border-brand-200 hover:bg-brand-50"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>

          {/* Usuário principal (sempre visível) */}
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Input
                type="email"
                value={userEmail}
                disabled
                className="bg-white mb-2"
              />
              <p className="text-xs text-gray-500">Você (proprietário da conta)</p>
            </div>

            {/* Membros adicionados */}
            {members.map((member, index) => (
              <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Integrante {index + 1}</span>
                  <button
                    onClick={() => removeMember(index)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Input
                  type="email"
                  placeholder="Email do integrante"
                  value={member.email}
                  onChange={(e) => updateMember(index, 'email', e.target.value)}
                />
                <Input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={member.phone}
                  onChange={(e) => updateMember(index, 'phone', formatPhone(e.target.value))}
                />
                <p className="text-xs text-gray-400">
                  O e-mail é usado para lembretes e o WhatsApp para registrar transações via mensagem.
                </p>

                {/* Tipo de trabalho do membro */}
                <div className="flex gap-2 mt-2">
                  <span className="text-sm text-gray-600 mr-2">Tipo de trabalho</span>
                  <button
                    onClick={() => updateMember(index, 'workType', 'clt')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      member.workType === 'clt'
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    CLT
                  </button>
                  <button
                    onClick={() => updateMember(index, 'workType', 'autonomo')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      member.workType === 'autonomo'
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    Autônomo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Passo 4: Fonte de renda
 */
const Step4Income = ({ accountType, members, userEmail, incomes, setIncomes }) => {
  // Inicializa as rendas se estiverem vazias
  useEffect(() => {
    if (incomes.length === 0) {
      const initialIncomes = [
        { memberEmail: null, amount: '', paymentDay: '' } // Renda do usuário principal
      ];

      // Adiciona renda para cada membro
      if (accountType === 'conjunta') {
        members.forEach(member => {
          if (member.email) {
            initialIncomes.push({ memberEmail: member.email, amount: '', paymentDay: '' });
          }
        });
      }

      setIncomes(initialIncomes);
    }
  }, [accountType, members, incomes.length, setIncomes]);

  const updateIncome = (index, field, value) => {
    const updated = [...incomes];
    updated[index][field] = value;
    setIncomes(updated);
  };

  const formatMoney = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');

    if (!numbers) return '';

    // Converte para número e formata
    const amount = parseInt(numbers, 10) / 100;
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const userIncome = incomes.find(i => i.memberEmail === null) || { amount: '', paymentDay: '' };
  const userIncomeIndex = incomes.findIndex(i => i.memberEmail === null);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
        Qual é sua principal fonte de renda?
      </h2>
      <p className="text-gray-500 text-center mb-8">
        Informe o valor líquido e o dia que você costuma receber.
      </p>

      <div className="max-w-md mx-auto space-y-6">
        {/* Renda do usuário principal */}
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-4">Sua renda principal</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Valor líquido (R$)</label>
              <Input
                type="text"
                placeholder="5.000,00"
                value={userIncome.amount}
                onChange={(e) => updateIncome(userIncomeIndex, 'amount', formatMoney(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Dia do recebimento</label>
              <Input
                type="number"
                placeholder="10"
                min="1"
                max="31"
                value={userIncome.paymentDay}
                onChange={(e) => updateIncome(userIncomeIndex, 'paymentDay', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Renda dos membros (conta conjunta) */}
        {accountType === 'conjunta' && members.filter(m => m.email).map((member, idx) => {
          const memberIncome = incomes.find(i => i.memberEmail === member.email) || { amount: '', paymentDay: '' };
          const memberIncomeIndex = incomes.findIndex(i => i.memberEmail === member.email);

          return (
            <div key={idx} className="p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-4">Renda de {member.email}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Valor líquido (R$)</label>
                  <Input
                    type="text"
                    placeholder="5.000,00"
                    value={memberIncome.amount}
                    onChange={(e) => updateIncome(memberIncomeIndex, 'amount', formatMoney(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Dia do recebimento</label>
                  <Input
                    type="number"
                    placeholder="10"
                    min="1"
                    max="31"
                    value={memberIncome.paymentDay}
                    onChange={(e) => updateIncome(memberIncomeIndex, 'paymentDay', e.target.value)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Passo 5: Moradia
 */
const Step5Housing = ({ housing, setHousing, accountType, members, userEmail }) => {
  const formatMoney = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    const amount = parseInt(numbers, 10) / 100;
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Lista de responsáveis (Titular + membros)
  const responsibleOptions = [
    { value: 'titular', label: 'Titular' },
    ...members.filter(m => m.email).map(m => ({ value: m.email, label: m.email }))
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
        Quanto você paga de moradia?
      </h2>
      <p className="text-gray-500 text-center mb-8">
        Informe o valor e dia de vencimento.
      </p>

      <div className="max-w-md mx-auto space-y-6">
        {/* Tipo de despesa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de despesa</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setHousing({ ...housing, type: 'aluguel' })}
              className={`p-4 rounded-xl border-2 text-center font-medium transition-all ${
                housing.type === 'aluguel'
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-brand-200'
              }`}
            >
              Aluguel
            </button>
            <button
              onClick={() => setHousing({ ...housing, type: 'financiamento' })}
              className={`p-4 rounded-xl border-2 text-center font-medium transition-all ${
                housing.type === 'financiamento'
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-brand-200'
              }`}
            >
              Financiamento
            </button>
          </div>
        </div>

        {/* Valor e Dia */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Valor (R$)</label>
            <Input
              type="text"
              placeholder="ex: 1.500,00"
              value={housing.amount}
              onChange={(e) => setHousing({ ...housing, amount: formatMoney(e.target.value) })}
              disabled={housing.skip}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Dia do vencimento</label>
            <Input
              type="number"
              placeholder="ex: 10"
              min="1"
              max="31"
              value={housing.dueDay}
              onChange={(e) => setHousing({ ...housing, dueDay: e.target.value })}
              disabled={housing.skip}
            />
          </div>
        </div>

        {/* Responsável */}
        {accountType === 'conjunta' && (
          <div>
            <label className="block text-sm text-gray-600 mb-1">Responsável</label>
            <Select
              value={housing.responsible}
              onValueChange={(value) => setHousing({ ...housing, responsible: value })}
              disabled={housing.skip}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o responsável" />
              </SelectTrigger>
              <SelectContent>
                {responsibleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Opção de pular */}
        <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={housing.skip}
            onChange={(e) => setHousing({ ...housing, skip: e.target.checked })}
            className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
          />
          <span className="text-gray-600">Não tenho essa despesa ou não quero informar agora</span>
        </label>

        <p className="text-sm text-gray-400 text-center">
          Deixe em branco se não tiver esse gasto. Se preencher um campo, preencha ambos.
        </p>
      </div>
    </div>
  );
};

/**
 * Passo 6: Serviços básicos mensais
 */
const Step6BasicServices = ({ basicServices, setBasicServices, accountType, members }) => {
  const formatMoney = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    const amount = parseInt(numbers, 10) / 100;
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Lista de responsáveis
  const responsibleOptions = [
    { value: 'titular', label: 'Titular' },
    ...members.filter(m => m.email).map(m => ({ value: m.email, label: m.email }))
  ];

  const updateService = (serviceName, field, value) => {
    setBasicServices({
      ...basicServices,
      [serviceName]: {
        ...basicServices[serviceName],
        [field]: value,
      },
    });
  };

  const services = [
    { key: 'condominio', label: 'Condomínio', placeholder: '500,00', dayPlaceholder: '10' },
    { key: 'energia', label: 'Energia', placeholder: '250,00', dayPlaceholder: '15' },
    { key: 'agua', label: 'Água', placeholder: '80,00', dayPlaceholder: '20' },
    { key: 'gas', label: 'Gás', placeholder: '50,00', dayPlaceholder: '25' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
        Serviços básicos mensais
      </h2>
      <p className="text-gray-500 text-center mb-8">
        Informe os valores médios que você paga por mês. Deixe em branco os que não se aplicam.
        Se preencher um campo, preencha ambos.
      </p>

      <div className="max-w-md mx-auto space-y-4">
        {services.map((service) => (
          <div key={service.key} className="p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">{service.label}</h3>
            <div className={`grid gap-3 ${accountType === 'conjunta' ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <div>
                <Input
                  type="text"
                  placeholder={`ex: ${service.placeholder}`}
                  value={basicServices[service.key]?.amount || ''}
                  onChange={(e) => updateService(service.key, 'amount', formatMoney(e.target.value))}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder={`ex: ${service.dayPlaceholder}`}
                  min="1"
                  max="31"
                  value={basicServices[service.key]?.dueDay || ''}
                  onChange={(e) => updateService(service.key, 'dueDay', e.target.value)}
                />
              </div>
              {accountType === 'conjunta' && (
                <div>
                  <Select
                    value={basicServices[service.key]?.responsible || 'titular'}
                    onValueChange={(value) => updateService(service.key, 'responsible', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Titular" />
                    </SelectTrigger>
                    <SelectContent>
                      {responsibleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Página principal de configuração
 */
export default function ConfigurarPerfilPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Estado do formulário
  const [workType, setWorkType] = useState('');
  const [accountType, setAccountType] = useState('individual');
  const [members, setMembers] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [housing, setHousing] = useState({
    type: 'aluguel',
    amount: '',
    dueDay: '',
    responsible: 'titular',
    skip: false,
  });
  const [basicServices, setBasicServices] = useState({
    condominio: { amount: '', dueDay: '', responsible: 'titular' },
    energia: { amount: '', dueDay: '', responsible: 'titular' },
    agua: { amount: '', dueDay: '', responsible: 'titular' },
    gas: { amount: '', dueDay: '', responsible: 'titular' },
  });

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  // Redirecionar para dashboard se setup já foi completado
  useEffect(() => {
    if (!authLoading && user && profile && profile.setup_completed === true) {
      router.replace('/dashboard');
    }
  }, [authLoading, user, profile, router]);

  // Verificação de se pode avançar em cada passo
  const canProceed = () => {
    switch (currentStep) {
      case 0: return true; // Boas-vindas
      case 1: return !!workType; // Tipo de trabalho
      case 2: return !!accountType; // Tipo de conta
      case 3: {
        // Verifica se renda do usuário foi preenchida
        const userIncome = incomes.find(i => i.memberEmail === null);
        return userIncome && userIncome.amount && userIncome.paymentDay;
      }
      case 4: return true; // Despesas (opcional)
      case 5: return true; // Metas (opcional)
      default: return true;
    }
  };

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Último passo - salvar e redirecionar
      await handleSave();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Preparar dados das rendas
      const incomesData = incomes
        .filter(i => i.amount && i.paymentDay)
        .map(i => ({
          memberEmail: i.memberEmail,
          amountCents: parseMoneyToCents(i.amount),
          paymentDay: parseInt(i.paymentDay, 10),
          isPrimary: true,
        }));

      // Preparar dados dos membros
      const membersData = accountType === 'conjunta'
        ? members.filter(m => m.email)
        : [];

      // Preparar despesas fixas (moradia + serviços básicos)
      const fixedExpenses = [];

      // Adicionar moradia se preenchida e não pulada
      if (!housing.skip && housing.amount && housing.dueDay) {
        fixedExpenses.push({
          type: housing.type,
          category: 'moradia',
          description: housing.type === 'aluguel' ? 'Aluguel' : 'Financiamento',
          amountCents: parseMoneyToCents(housing.amount),
          dueDay: parseInt(housing.dueDay, 10),
          responsible: housing.responsible,
        });
      }

      // Adicionar serviços básicos preenchidos
      const serviceLabels = {
        condominio: 'Condomínio',
        energia: 'Energia',
        agua: 'Água',
        gas: 'Gás',
      };

      Object.entries(basicServices).forEach(([key, service]) => {
        if (service.amount && service.dueDay) {
          fixedExpenses.push({
            type: key,
            category: 'servicos_basicos',
            description: serviceLabels[key],
            amountCents: parseMoneyToCents(service.amount),
            dueDay: parseInt(service.dueDay, 10),
            responsible: service.responsible || 'titular',
          });
        }
      });

      const setupData = {
        workType,
        accountType,
        members: membersData,
        incomes: incomesData,
        fixedExpenses,
      };

      const { success, error } = await saveUserSetup(user.id, setupData);

      if (success) {
        router.push('/dashboard');
      } else {
        console.error('Erro ao salvar setup:', error);
        alert('Erro ao salvar configurações. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao salvar setup:', err);
      alert('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  // Loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const userEmail = user?.email || profile?.email || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl">
          <CardContent className="p-8">
            {/* Indicador de progresso */}
            <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

            {/* Conteúdo do passo atual */}
            <div className="min-h-[400px] flex flex-col justify-center">
              {currentStep === 0 && <Step1Welcome />}
              {currentStep === 1 && (
                <Step2WorkType workType={workType} setWorkType={setWorkType} />
              )}
              {currentStep === 2 && (
                <Step3AccountType
                  accountType={accountType}
                  setAccountType={setAccountType}
                  members={members}
                  setMembers={setMembers}
                  userEmail={userEmail}
                />
              )}
              {currentStep === 3 && (
                <Step4Income
                  accountType={accountType}
                  members={members}
                  userEmail={userEmail}
                  incomes={incomes}
                  setIncomes={setIncomes}
                />
              )}
              {currentStep === 4 && (
                <Step5Housing
                  housing={housing}
                  setHousing={setHousing}
                  accountType={accountType}
                  members={members}
                  userEmail={userEmail}
                />
              )}
              {currentStep === 5 && (
                <Step6BasicServices
                  basicServices={basicServices}
                  setBasicServices={setBasicServices}
                  accountType={accountType}
                  members={members}
                />
              )}
            </div>

            {/* Navegação */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors ${
                  currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </button>

              <Button
                onClick={handleNext}
                disabled={!canProceed() || saving}
                className="bg-brand-600 hover:bg-brand-700 px-6"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : currentStep === TOTAL_STEPS - 1 ? (
                  <>
                    Concluir
                    <Sparkles className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}