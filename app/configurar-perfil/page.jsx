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
  LogOut,
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
                : 'w-2 bg-gray-200 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400">Passo {currentStep + 1} de {totalSteps}</span>
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
          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-200 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800'
      }`}
    >
      <Icon className={`w-8 h-8 mb-3 ${selected ? 'text-brand-600' : 'text-gray-400'}`} />
      <span className={`font-semibold ${selected ? 'text-brand-700' : 'text-gray-700 dark:text-gray-300'}`}>{title}</span>
      <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</span>
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

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Bem-vindo à Bússola Financeira!
      </h1>

      <p className="text-gray-600 dark:text-gray-400 mb-2 max-w-md mx-auto">
        Vamos configurar algumas informações iniciais para personalizar
        sua experiência e já criar suas primeiras transações recorrentes.
      </p>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Isso levará apenas alguns minutos.
      </p>
    </div>
  );
};

/**
 * Passo 2: Tipo de trabalho (multisseleção)
 */
const Step2WorkType = ({ workTypes, setWorkTypes }) => {
  const toggleWorkType = (type) => {
    if (type === 'nenhum') {
      // Se selecionar "nenhum", desmarca os outros
      setWorkTypes(['nenhum']);
    } else {
      // Se selecionar CLT ou Autônomo, remove "nenhum" se estiver selecionado
      let newTypes = workTypes.filter(t => t !== 'nenhum');

      if (newTypes.includes(type)) {
        // Remove se já está selecionado
        newTypes = newTypes.filter(t => t !== type);
      } else {
        // Adiciona se não está selecionado
        newTypes.push(type);
      }

      setWorkTypes(newTypes);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
        Qual é o seu tipo de trabalho?
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
        Isso nos ajuda a categorizar melhor suas receitas e despesas. Você pode selecionar mais de uma opção.
      </p>

      <div className="max-w-md mx-auto space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => toggleWorkType('clt')}
            className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 min-h-[140px] w-full ${
              workTypes.includes('clt')
                ? 'border-brand-500 bg-brand-50 shadow-md'
                : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-200 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800'
            }`}
          >
            <Building2 className={`w-8 h-8 mb-3 ${workTypes.includes('clt') ? 'text-brand-600' : 'text-gray-400'}`} />
            <span className={`font-semibold ${workTypes.includes('clt') ? 'text-brand-700' : 'text-gray-700 dark:text-gray-300'}`}>CLT</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Carteira assinada</span>
            {workTypes.includes('clt') && (
              <Check className="w-5 h-5 text-brand-600 mt-2" />
            )}
          </button>
          <button
            onClick={() => toggleWorkType('autonomo')}
            className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 min-h-[140px] w-full ${
              workTypes.includes('autonomo')
                ? 'border-brand-500 bg-brand-50 shadow-md'
                : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-200 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800'
            }`}
          >
            <Briefcase className={`w-8 h-8 mb-3 ${workTypes.includes('autonomo') ? 'text-brand-600' : 'text-gray-400'}`} />
            <span className={`font-semibold ${workTypes.includes('autonomo') ? 'text-brand-700' : 'text-gray-700 dark:text-gray-300'}`}>Autônomo</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Conta própria</span>
            {workTypes.includes('autonomo') && (
              <Check className="w-5 h-5 text-brand-600 mt-2" />
            )}
          </button>
        </div>

        {/* Opção Nenhum */}
        <label className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800 transition-colors ${
          workTypes.includes('nenhum') ? 'border-brand-500 bg-brand-50' : 'border-gray-200 dark:border-slate-700'
        }">
          <input
            type="checkbox"
            checked={workTypes.includes('nenhum')}
            onChange={() => toggleWorkType('nenhum')}
            className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
          />
          <span className={`${workTypes.includes('nenhum') ? 'text-brand-700 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
            Nenhum dos anteriores / Não se aplica
          </span>
        </label>

        <p className="text-sm text-gray-400 text-center">
          {workTypes.length === 0
            ? 'Selecione pelo menos uma opção para continuar'
            : workTypes.includes('nenhum')
            ? 'Você selecionou: Nenhum'
            : `Selecionado: ${workTypes.map(t => t === 'clt' ? 'CLT' : 'Autônomo').join(' e ')}`
          }
        </p>
      </div>
    </div>
  );
};

/**
 * Passo 3: Tipo de conta
 */
const Step3AccountType = ({ accountType, setAccountType, members, setMembers, userEmail }) => {
  const addMember = () => {
    setMembers([...members, { email: '', phone: '', workTypes: [] }]);
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const toggleMemberWorkType = (index, type) => {
    const member = members[index];
    const currentTypes = member.workTypes || [];

    if (type === 'nenhum') {
      // Se selecionar "nenhum", desmarca os outros
      updateMember(index, 'workTypes', ['nenhum']);
    } else {
      // Se selecionar CLT ou Autônomo, remove "nenhum" se estiver selecionado
      let newTypes = currentTypes.filter(t => t !== 'nenhum');

      if (newTypes.includes(type)) {
        // Remove se já está selecionado
        newTypes = newTypes.filter(t => t !== type);
      } else {
        // Adiciona se não está selecionado
        newTypes.push(type);
      }

      updateMember(index, 'workTypes', newTypes);
    }
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
      <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
        Este controle é individual ou conjunto?
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
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
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Integrantes da conta</span>
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
            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <Input
                type="email"
                value={userEmail}
                disabled
                className="bg-white dark:bg-slate-800 mb-2"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">Você (proprietário da conta)</p>
            </div>

            {/* Membros adicionados */}
            {members.map((member, index) => {
              const memberWorkTypes = member.workTypes || [];

              return (
                <div key={index} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Integrante {index + 1}</span>
                    <button
                      onClick={() => removeMember(index)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-md transition-colors"
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

                  {/* Tipo de trabalho do membro (multisseleção) */}
                  <div className="mt-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 block mb-2">Tipo de trabalho</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleMemberWorkType(index, 'clt')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          memberWorkTypes.includes('clt')
                            ? 'bg-brand-600 text-white'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 dark:bg-slate-600'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        CLT
                        {memberWorkTypes.includes('clt') && <Check className="w-3 h-3 ml-1" />}
                      </button>
                      <button
                        onClick={() => toggleMemberWorkType(index, 'autonomo')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          memberWorkTypes.includes('autonomo')
                            ? 'bg-brand-600 text-white'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 dark:bg-slate-600'
                        }`}
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        Autônomo
                        {memberWorkTypes.includes('autonomo') && <Check className="w-3 h-3 ml-1" />}
                      </button>
                      <button
                        onClick={() => toggleMemberWorkType(index, 'nenhum')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          memberWorkTypes.includes('nenhum')
                            ? 'bg-gray-600 text-white'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 dark:bg-slate-600'
                        }`}
                      >
                        Nenhum
                        {memberWorkTypes.includes('nenhum') && <Check className="w-3 h-3 ml-1" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {memberWorkTypes.length === 0
                        ? 'Selecione o tipo de trabalho'
                        : memberWorkTypes.includes('nenhum')
                        ? 'Nenhum'
                        : memberWorkTypes.map(t => t === 'clt' ? 'CLT' : 'Autônomo').join(' e ')
                      }
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Gera as opções de dia (Dia 1 a Dia 31)
 */
const dayOptions = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1),
  label: `Dia ${i + 1}`,
}));

/**
 * Gera os tipos de renda baseados nos workTypes selecionados
 */
const getIncomeTypesForWorkTypes = (workTypes) => {
  if (!workTypes || workTypes.length === 0 || workTypes.includes('nenhum')) {
    return [{ type: 'principal', label: 'Renda principal' }];
  }

  const types = [];
  if (workTypes.includes('clt')) {
    types.push({ type: 'clt', label: 'Renda CLT' });
  }
  if (workTypes.includes('autonomo')) {
    types.push({ type: 'autonomo', label: 'Renda Autônomo' });
  }

  return types.length > 0 ? types : [{ type: 'principal', label: 'Renda principal' }];
};

/**
 * Passo 4: Fonte de renda
 */
const Step4Income = ({ accountType, members, userEmail, workTypes, incomes, setIncomes }) => {
  // Sincroniza as rendas com os tipos de trabalho e membros atuais
  useEffect(() => {
    let updatedIncomes = [...incomes];

    // Tipos de renda do usuário principal baseados em seus workTypes
    const userIncomeTypes = getIncomeTypesForWorkTypes(workTypes);

    // Garante que as rendas do usuário principal existam para cada tipo
    userIncomeTypes.forEach(({ type }) => {
      const hasIncome = updatedIncomes.some(i => i.memberEmail === null && i.incomeType === type);
      if (!hasIncome) {
        updatedIncomes.push({ memberEmail: null, incomeType: type, amount: '', paymentDay: '' });
      }
    });

    // Remove rendas do usuário que não correspondem aos tipos atuais
    updatedIncomes = updatedIncomes.filter(i => {
      if (i.memberEmail !== null) return true;
      return userIncomeTypes.some(({ type }) => type === i.incomeType);
    });

    // Se for conta conjunta, sincroniza com os membros
    if (accountType === 'conjunta') {
      members.filter(m => m.email).forEach(member => {
        const memberIncomeTypes = getIncomeTypesForWorkTypes(member.workTypes);

        // Adiciona rendas para cada tipo do membro
        memberIncomeTypes.forEach(({ type }) => {
          const hasIncome = updatedIncomes.some(
            i => i.memberEmail === member.email && i.incomeType === type
          );
          if (!hasIncome) {
            updatedIncomes.push({ memberEmail: member.email, incomeType: type, amount: '', paymentDay: '' });
          }
        });

        // Remove rendas do membro que não correspondem aos tipos atuais
        updatedIncomes = updatedIncomes.filter(i => {
          if (i.memberEmail !== member.email) return true;
          return memberIncomeTypes.some(({ type }) => type === i.incomeType);
        });
      });

      // Remove rendas de membros que não existem mais
      const memberEmails = members.filter(m => m.email).map(m => m.email);
      updatedIncomes = updatedIncomes.filter(i =>
        i.memberEmail === null || memberEmails.includes(i.memberEmail)
      );
    } else {
      // Se for individual, remove rendas de membros
      updatedIncomes = updatedIncomes.filter(i => i.memberEmail === null);
    }

    // Só atualiza se houver mudanças
    if (JSON.stringify(updatedIncomes) !== JSON.stringify(incomes)) {
      setIncomes(updatedIncomes);
    }
  }, [accountType, members, workTypes, incomes, setIncomes]);

  const updateIncome = (memberEmail, incomeType, field, value) => {
    setIncomes(prevIncomes => {
      return prevIncomes.map(income => {
        if (income.memberEmail === memberEmail && income.incomeType === incomeType) {
          return { ...income, [field]: value };
        }
        return income;
      });
    });
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

  // Tipos de renda do usuário
  const userIncomeTypes = getIncomeTypesForWorkTypes(workTypes);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
        Qual é sua principal fonte de renda?
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
        Informe o valor líquido e o dia que você costuma receber.
      </p>

      <div className="max-w-md mx-auto space-y-6">
        {/* Rendas do usuário principal */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Suas rendas</h3>
            <span className="text-xs px-2 py-1 bg-brand-100 text-brand-700 rounded-full">
              Titular
            </span>
          </div>

          <div className="space-y-4">
            {userIncomeTypes.map(({ type, label }) => {
              const income = incomes.find(i => i.memberEmail === null && i.incomeType === type) || { amount: '', paymentDay: '' };

              return (
                <div key={type} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Valor líquido (R$)</label>
                      <Input
                        type="text"
                        placeholder="5.000,00"
                        value={income.amount}
                        onChange={(e) => updateIncome(null, type, 'amount', formatMoney(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Dia do recebimento</label>
                      <Select
                        value={income.paymentDay}
                        onValueChange={(value) => updateIncome(null, type, 'paymentDay', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {dayOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Renda dos membros (conta conjunta) */}
        {accountType === 'conjunta' && members.filter(m => m.email).map((member, idx) => {
          const memberIncomeTypes = getIncomeTypesForWorkTypes(member.workTypes);

          return (
            <div key={member.email || idx} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]" title={member.email}>
                  {member.email}
                </h3>
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-full">
                  Dependente
                </span>
              </div>

              <div className="space-y-4">
                {memberIncomeTypes.map(({ type, label }) => {
                  const income = incomes.find(
                    i => i.memberEmail === member.email && i.incomeType === type
                  ) || { amount: '', paymentDay: '' };

                  return (
                    <div key={type} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Valor líquido (R$)</label>
                          <Input
                            type="text"
                            placeholder="5.000,00"
                            value={income.amount}
                            onChange={(e) => updateIncome(member.email, type, 'amount', formatMoney(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Dia do recebimento</label>
                          <Select
                            value={income.paymentDay}
                            onValueChange={(value) => updateIncome(member.email, type, 'paymentDay', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {dayOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
      <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
        Quanto você paga de moradia?
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
        Informe o valor e dia de vencimento.
      </p>

      <div className="max-w-md mx-auto space-y-6">
        {/* Tipo de despesa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de despesa</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setHousing({ ...housing, type: 'aluguel' })}
              className={`p-4 rounded-xl border-2 text-center font-medium transition-all ${
                housing.type === 'aluguel'
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:border-brand-200'
              }`}
            >
              Aluguel
            </button>
            <button
              onClick={() => setHousing({ ...housing, type: 'financiamento' })}
              className={`p-4 rounded-xl border-2 text-center font-medium transition-all ${
                housing.type === 'financiamento'
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:border-brand-200'
              }`}
            >
              Financiamento
            </button>
          </div>
        </div>

        {/* Valor e Dia */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Valor (R$)</label>
            <Input
              type="text"
              placeholder="ex: 1.500,00"
              value={housing.amount}
              onChange={(e) => setHousing({ ...housing, amount: formatMoney(e.target.value) })}
              disabled={housing.skip}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Dia do vencimento</label>
            <Select
              value={housing.dueDay}
              onValueChange={(value) => setHousing({ ...housing, dueDay: value })}
              disabled={housing.skip}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o dia" />
              </SelectTrigger>
              <SelectContent>
                {dayOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Responsável */}
        {accountType === 'conjunta' && (
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Responsável</label>
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
        <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-800 transition-colors">
          <input
            type="checkbox"
            checked={housing.skip}
            onChange={(e) => setHousing({ ...housing, skip: e.target.checked })}
            className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
          />
          <span className="text-gray-600 dark:text-gray-400">Não tenho essa despesa ou não quero informar agora</span>
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
      <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
        Serviços básicos mensais
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
        Informe os valores médios que você paga por mês. Deixe em branco os que não se aplicam.
        Se preencher um campo, preencha ambos.
      </p>

      <div className="max-w-md mx-auto space-y-4">
        {services.map((service) => (
          <div key={service.key} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">{service.label}</h3>
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
                <Select
                  value={basicServices[service.key]?.dueDay || ''}
                  onValueChange={(value) => updateService(service.key, 'dueDay', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Dia" />
                  </SelectTrigger>
                  <SelectContent>
                    {dayOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
  const { user, profile, loading: authLoading, refreshProfile, signOut } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Estado do formulário
  const [workTypes, setWorkTypes] = useState([]);
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
      case 1: return workTypes.length > 0; // Tipo de trabalho (pelo menos uma opção)
      case 2: return !!accountType; // Tipo de conta
      case 3: {
        // Verifica se pelo menos uma renda do usuário foi preenchida
        const userIncomes = incomes.filter(i => i.memberEmail === null);
        return userIncomes.some(i => i.amount && i.paymentDay);
      }
      case 4: return true; // Moradia (opcional)
      case 5: return true; // Serviços básicos (opcional)
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
          incomeType: i.incomeType || 'principal',
          description: i.incomeType === 'clt' ? 'Renda CLT' : i.incomeType === 'autonomo' ? 'Renda Autônomo' : 'Renda principal',
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
        workTypes,
        accountType,
        members: membersData,
        incomes: incomesData,
        fixedExpenses,
      };

      const { success, error } = await saveUserSetup(user.id, setupData);

      if (success) {
        // Atualizar o perfil no contexto antes de redirecionar
        // para evitar que o dashboard redirecione de volta
        await refreshProfile();
        router.push('/dashboard');
      } else {
        console.error('Erro ao salvar setup:', error);
        const errorMessage = error?.message || error?.details || JSON.stringify(error);
        alert(`Erro ao salvar configurações: ${errorMessage}`);
      }
    } catch (err) {
      console.error('Erro ao salvar setup:', err);
      alert(`Erro ao salvar configurações: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  // Loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 dark:from-slate-900 dark:to-slate-800">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const userEmail = user?.email || profile?.email || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl">
          <CardContent className="p-8">
            {/* Header com botão de logout */}
            <div className="flex justify-end mb-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair da conta
              </button>
            </div>

            {/* Indicador de progresso */}
            <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

            {/* Conteúdo do passo atual */}
            <div className="min-h-[400px] flex flex-col justify-center">
              {currentStep === 0 && <Step1Welcome />}
              {currentStep === 1 && (
                <Step2WorkType workTypes={workTypes} setWorkTypes={setWorkTypes} />
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
                  workTypes={workTypes}
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
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors ${
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