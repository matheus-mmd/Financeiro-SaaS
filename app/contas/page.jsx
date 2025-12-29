"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../src/contexts/AuthContext";
import PageHeader from "../../src/components/PageHeader";
import PageSkeleton from "../../src/components/PageSkeleton";
import { Card, CardContent } from "../../src/components/ui/card";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
import { Label } from "../../src/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../src/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import { useBanks } from "../../src/lib/supabase/hooks/useBanks";
import { useCards } from "../../src/lib/supabase/hooks/useCards";
import { useReferenceData } from "../../src/lib/supabase/hooks/useReferenceData";
import { Plus, Trash2, Landmark, CreditCard } from "lucide-react";
import { getIconComponent } from "../../src/components/IconPicker";
import { formatCurrency } from "../../src/utils";
import ColorPicker from "../../src/components/ColorPicker";
import IconPickerModal from "../../src/components/IconPickerModal";
import FABMenu from "../../src/components/FABMenu";

/**
 * Página de Contas Financeiras - Gerenciamento de Bancos e Cartões
 * Visualização organizada por tipo: Bancos e Cartões
 */
export default function ContasPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();

  // Hooks com cache para carregamento instantâneo
  const {
    banks,
    loading: banksLoading,
    error: banksError,
    create: createBank,
    update: updateBank,
    remove: removeBank,
  } = useBanks();

  const {
    cards,
    loading: cardsLoading,
    error: cardsError,
    create: createCard,
    update: updateCard,
    remove: removeCard,
  } = useCards();

  const {
    data: referenceData,
    loading: referenceLoading,
    error: referenceError,
  } = useReferenceData({ resources: ["accountTypes", "cardTypes", "cardBrands"] });

  const { accountTypes, cardTypes, cardBrands } = referenceData;
  const loading = banksLoading || cardsLoading || referenceLoading;
  const error = banksError || cardsError || referenceError;

  // Estados para modal de banco
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [bankFormData, setBankFormData] = useState({
    name: "",
    color: "#6366f1",
    icon: "Wallet",
    agency: "",
    account: "",
    account_type: "corrente",
    initial_balance: 0,
  });

  // Estados para modal de cartão
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [cardFormData, setCardFormData] = useState({
    name: "",
    color: "#6366f1",
    icon: "CreditCard",
    card_type: "credito",
    card_brand: "Visa",
    limit: 0,
    closing_day: 1,
    due_day: 10,
    bank_id: null,
  });

  // Estados para IconPickerModal
  const [iconPickerModalOpen, setIconPickerModalOpen] = useState(false);
  const [iconPickerFor, setIconPickerFor] = useState("bank"); // "bank" ou "card"

  // Funções auxiliares para erros de autenticação
  const handleAuthFailure = async () => {
    await signOut();
    router.replace('/login');
  };

  const isAuthError = (err) => {
    return err?.code === 'AUTH_REQUIRED' || err?.message?.includes('Usuário não autenticado');
  };

  // Verificar erro de autenticação
  if (error && isAuthError(error)) {
    handleAuthFailure();
    return null;
  }

  // ===== FUNÇÕES PARA BANCOS =====

  const handleOpenBankModal = (bank = null) => {
    setEditingBank(bank);
    if (bank) {
      setBankFormData({
        name: bank.name,
        color: bank.color,
        icon: bank.icon || "Wallet",
        agency: bank.agency || "",
        account: bank.account || "",
        account_type: bank.account_type || "corrente",
        initial_balance: bank.initial_balance || 0,
      });
    } else {
      setBankFormData({
        name: "",
        color: "#6366f1",
        icon: "Wallet",
        agency: "",
        account: "",
        account_type: "corrente",
        initial_balance: 0,
      });
    }
    setBankModalOpen(true);
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();

    try {
      // Find account_type_id by internal_name
      const accountType = accountTypes.find(t => t.internal_name === bankFormData.account_type);

      const bankData = {
        name: bankFormData.name,
        iconId: bankFormData.icon,
        color: bankFormData.color,
        agency: bankFormData.agency,
        account: bankFormData.account,
        accountTypeId: accountType?.id,
        initialBalance: parseFloat(bankFormData.initial_balance) || 0,
      };

      let result;
      if (editingBank) {
        result = await updateBank(editingBank.id, bankData);
      } else {
        result = await createBank(bankData);
      }

      if (result.error) throw result.error;

      setBankModalOpen(false);
    } catch (err) {
      if (isAuthError(err)) {
        await handleAuthFailure();
      } else {
        console.error("Erro ao salvar banco:", err);
        alert("Erro ao salvar banco. Tente novamente.");
      }
    }
  };

  const handleDeleteBank = async (id) => {
    if (!confirm("Tem certeza que deseja deletar este banco?")) return;

    try {
      const result = await removeBank(id);
      if (result.error) throw result.error;
    } catch (err) {
      if (isAuthError(err)) {
        await handleAuthFailure();
      } else {
        console.error("Erro ao deletar banco:", err);
        alert("Erro ao deletar banco. Tente novamente.");
      }
    }
  };

  // ===== FUNÇÕES PARA CARTÕES =====

  const handleOpenCardModal = (card = null) => {
    setEditingCard(card);
    if (card) {
      setCardFormData({
        name: card.name,
        color: card.color,
        icon: card.icon || "CreditCard",
        card_type: card.card_type || "credito",
        card_brand: card.card_brand || "Visa",
        limit: card.limit || 0,
        closing_day: card.closing_day || 1,
        due_day: card.due_day || 10,
        bank_id: card.bank_id || null,
      });
    } else {
      setCardFormData({
        name: "",
        color: "#6366f1",
        icon: "CreditCard",
        card_type: "credito",
        card_brand: "Visa",
        limit: 0,
        closing_day: 1,
        due_day: 10,
        bank_id: null,
      });
    }
    setCardModalOpen(true);
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();

    try {
      // Find IDs by internal_name
      const cardType = cardTypes.find(t => t.internal_name === cardFormData.card_type);
      const cardBrand = cardBrands.find(b => b.name === cardFormData.card_brand);

      const cardData = {
        name: cardFormData.name,
        iconId: cardFormData.icon,
        color: cardFormData.color,
        cardTypeId: cardType?.id,
        cardBrandId: cardBrand?.id,
        bankId: cardFormData.bank_id,
        creditLimit: parseFloat(cardFormData.limit) || 0,
        closingDay: parseInt(cardFormData.closing_day) || 1,
        dueDay: parseInt(cardFormData.due_day) || 10,
      };

      let result;
      if (editingCard) {
        result = await updateCard(editingCard.id, cardData);
      } else {
        result = await createCard(cardData);
      }

      if (result.error) throw result.error;

      setCardModalOpen(false);
    } catch (err) {
      if (isAuthError(err)) {
        await handleAuthFailure();
      } else {
        console.error("Erro ao salvar cartão:", err);
        alert("Erro ao salvar cartão. Tente novamente.");
      }
    }
  };

  const handleDeleteCard = async (id) => {
    if (!confirm("Tem certeza que deseja deletar este cartão?")) return;

    try {
      const result = await removeCard(id);
      if (result.error) throw result.error;
    } catch (err) {
      if (isAuthError(err)) {
        await handleAuthFailure();
      } else {
        console.error("Erro ao deletar cartão:", err);
        alert("Erro ao deletar cartão. Tente novamente.");
      }
    }
  };

  // ===== FUNÇÕES AUXILIARES =====

  const getAccountTypeLabel = (type) => {
    const types = {
      corrente: "Conta Corrente",
      poupanca: "Poupança",
      pagamento: "Pagamento",
      investimento: "Investimento",
    };
    return types[type] || type;
  };

  const getCardTypeLabel = (type) => {
    const types = {
      credito: "Crédito",
      debito: "Débito",
      "pre-pago": "Pré-pago",
    };
    return types[type] || type;
  };

  // Função para renderizar seção de bancos
  const renderBanksSection = () => {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Landmark className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Bancos e Contas
              </h2>
              <p className="text-sm text-gray-500">
                Gerencie suas contas bancárias ({banks.length})
              </p>
            </div>
          </div>

          {banks.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                <Landmark className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-3">Nenhuma conta bancária cadastrada</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenBankModal(null)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Banco
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {banks.map((bank) => {
                const IconComponent = getIconComponent(bank.icon || "Wallet");

                return (
                  <div
                    key={bank.id}
                    onClick={() => handleOpenBankModal(bank)}
                    className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: bank.color + "20" }}
                      >
                        <IconComponent
                          className="w-6 h-6"
                          style={{ color: bank.color }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {bank.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {getAccountTypeLabel(bank.account_type)}
                        </p>
                        {bank.agency && bank.account && (
                          <p className="text-xs text-gray-400 mt-1">
                            Ag: {bank.agency} • Cc: {bank.account}
                          </p>
                        )}
                        {bank.current_balance !== null &&
                          bank.current_balance !== undefined && (
                            <p className="text-sm font-medium text-gray-700 mt-2">
                              Saldo: {formatCurrency(bank.current_balance)}
                            </p>
                          )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBank(bank.id);
                        }}
                        className="flex-shrink-0 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded-lg transition-all"
                        title="Deletar banco"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Função para renderizar seção de cartões
  const renderCardsSection = () => {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Cartões</h2>
              <p className="text-sm text-gray-500">
                Gerencie seus cartões de crédito e débito ({cards.length})
              </p>
            </div>
          </div>

          {cards.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-3">Nenhum cartão cadastrado</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenCardModal(null)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Cartão
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((card) => {
                const IconComponent = getIconComponent(card.icon || "CreditCard");
                const bank = banks.find((b) => b.id === card.bank_id);

                return (
                  <div
                    key={card.id}
                    onClick={() => handleOpenCardModal(card)}
                    className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: card.color + "20" }}
                      >
                        <IconComponent
                          className="w-6 h-6"
                          style={{ color: card.color }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {card.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {getCardTypeLabel(card.card_type)} • {card.card_brand}
                        </p>
                        {bank && (
                          <p className="text-xs text-gray-400 mt-1">
                            {bank.name}
                          </p>
                        )}
                        {card.card_type === "credito" && card.limit && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700">
                              Limite: {formatCurrency(card.limit)}
                            </p>
                            {card.current_balance !== null &&
                              card.current_balance !== undefined && (
                                <p className="text-xs text-gray-500">
                                  Usado: {formatCurrency(card.current_balance)}
                                </p>
                              )}
                          </div>
                        )}
                        {card.card_type === "credito" &&
                          card.closing_day &&
                          card.due_day && (
                            <p className="text-xs text-gray-400 mt-1">
                              Fecha dia {card.closing_day} • Vence dia{" "}
                              {card.due_day}
                            </p>
                          )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCard(card.id);
                        }}
                        className="flex-shrink-0 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded-lg transition-all"
                        title="Deletar cartão"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!authLoading && !user) {
    return null;
  }

  if (authLoading || loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader
        title="Contas Financeiras"
        description="Gerencie suas contas bancárias e cartões"
      />

      {/* Seção: Bancos */}
      {renderBanksSection()}

      {/* Seção: Cartões */}
      {renderCardsSection()}

      {/* Modal de Banco */}
      <Dialog open={bankModalOpen} onOpenChange={setBankModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-4 pt-4 pb-3 border-b flex-shrink-0">
            <DialogTitle>
              {editingBank ? "Editar Banco" : "Adicionar Novo Banco"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <form id="bank-form" onSubmit={handleBankSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bank-name">Nome do Banco</Label>
              <Input
                id="bank-name"
                name="bank_name"
                value={bankFormData.name}
                onChange={(e) =>
                  setBankFormData({ ...bankFormData, name: e.target.value })
                }
                placeholder="Ex: Nubank, Inter, Caixa..."
                autoComplete="organization"
                required
              />
            </div>

            {/* Seletor de Ícone */}
            <div className="space-y-2">
              <Label>Ícone do Banco</Label>
              <button
                type="button"
                onClick={() => {
                  setIconPickerFor("bank");
                  setIconPickerModalOpen(true);
                }}
                className="w-full flex items-center gap-3 p-3 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: bankFormData.color + "20" }}
                >
                  {(() => {
                    const IconComponent = getIconComponent(bankFormData.icon);
                    return (
                      <IconComponent
                        className="w-5 h-5"
                        style={{ color: bankFormData.color }}
                      />
                    );
                  })()}
                </div>
                <span className="text-sm text-gray-600">
                  Clique para escolher o ícone
                </span>
              </button>
            </div>

            {/* Seletor de Cor */}
            <ColorPicker
              selectedColor={bankFormData.color}
              onColorSelect={(color) =>
                setBankFormData({ ...bankFormData, color })
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank-agency">Agência</Label>
                <Input
                  id="bank-agency"
                  name="bank_agency"
                  value={bankFormData.agency}
                  onChange={(e) =>
                    setBankFormData({ ...bankFormData, agency: e.target.value })
                  }
                  placeholder="0001"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-account">Conta</Label>
                <Input
                  id="bank-account"
                  name="bank_account"
                  value={bankFormData.account}
                  onChange={(e) =>
                    setBankFormData({
                      ...bankFormData,
                      account: e.target.value,
                    })
                  }
                  placeholder="12345-6"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank-type">Tipo de Conta</Label>
              <Select
                value={bankFormData.account_type}
                onValueChange={(value) =>
                  setBankFormData({ ...bankFormData, account_type: value })
                }
              >
                <SelectTrigger id="bank-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrente">Conta Corrente</SelectItem>
                  <SelectItem value="poupanca">Poupança</SelectItem>
                  <SelectItem value="pagamento">Pagamento</SelectItem>
                  <SelectItem value="investimento">Investimento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank-balance">Saldo Inicial</Label>
              <Input
                id="bank-balance"
                name="bank_initial_balance"
                type="number"
                step="0.01"
                value={bankFormData.initial_balance}
                onChange={(e) =>
                  setBankFormData({
                    ...bankFormData,
                    initial_balance: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
                autoComplete="off"
              />
            </div>
            </form>
          </div>

          <DialogFooter className="px-4 py-3 border-t bg-gray-50 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setBankModalOpen(false)}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="bank-form"
              className="flex-1 sm:flex-none"
            >
              {editingBank ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Cartão */}
      <Dialog open={cardModalOpen} onOpenChange={setCardModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-4 pt-4 pb-3 border-b flex-shrink-0">
            <DialogTitle>
              {editingCard ? "Editar Cartão" : "Adicionar Novo Cartão"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <form id="card-form" onSubmit={handleCardSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-name">Nome do Cartão</Label>
              <Input
                id="card-name"
                name="card_name"
                value={cardFormData.name}
                onChange={(e) =>
                  setCardFormData({ ...cardFormData, name: e.target.value })
                }
                placeholder="Ex: Nubank Crédito, Inter Débito..."
                autoComplete="organization"
                required
              />
            </div>

            {/* Seletor de Ícone */}
            <div className="space-y-2">
              <Label>Ícone do Cartão</Label>
              <button
                type="button"
                onClick={() => {
                  setIconPickerFor("card");
                  setIconPickerModalOpen(true);
                }}
                className="w-full flex items-center gap-3 p-3 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: cardFormData.color + "20" }}
                >
                  {(() => {
                    const IconComponent = getIconComponent(cardFormData.icon);
                    return (
                      <IconComponent
                        className="w-5 h-5"
                        style={{ color: cardFormData.color }}
                      />
                    );
                  })()}
                </div>
                <span className="text-sm text-gray-600">
                  Clique para escolher o ícone
                </span>
              </button>
            </div>

            {/* Seletor de Cor */}
            <ColorPicker
              selectedColor={cardFormData.color}
              onColorSelect={(color) =>
                setCardFormData({ ...cardFormData, color })
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="card-type">Tipo</Label>
                <Select
                  value={cardFormData.card_type}
                  onValueChange={(value) =>
                    setCardFormData({ ...cardFormData, card_type: value })
                  }
                >
                  <SelectTrigger id="card-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credito">Crédito</SelectItem>
                    <SelectItem value="debito">Débito</SelectItem>
                    <SelectItem value="pre-pago">Pré-pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-brand">Bandeira</Label>
                <Select
                  value={cardFormData.card_brand}
                  onValueChange={(value) =>
                    setCardFormData({ ...cardFormData, card_brand: value })
                  }
                >
                  <SelectTrigger id="card-brand">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Visa">Visa</SelectItem>
                    <SelectItem value="Mastercard">Mastercard</SelectItem>
                    <SelectItem value="Elo">Elo</SelectItem>
                    <SelectItem value="American Express">
                      American Express
                    </SelectItem>
                    <SelectItem value="Hipercard">Hipercard</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-bank">Banco Associado (Opcional)</Label>
              <Select
                value={
                  cardFormData.bank_id ? String(cardFormData.bank_id) : "none"
                }
                onValueChange={(value) =>
                  setCardFormData({
                    ...cardFormData,
                    bank_id: value === "none" ? null : parseInt(value),
                  })
                }
              >
                <SelectTrigger id="card-bank">
                  <SelectValue placeholder="Selecione um banco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={String(bank.id)}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {cardFormData.card_type === "credito" && (
              <>
                <div className="space-y-2">
                <Label htmlFor="card-limit">Limite</Label>
                <Input
                  id="card-limit"
                  name="card_limit"
                  type="number"
                  step="0.01"
                  value={cardFormData.limit || ""}
                    onChange={(e) =>
                      setCardFormData({
                        ...cardFormData,
                        limit: parseFloat(e.target.value) || 0,
                      })
                  }
                  placeholder="0.00"
                  autoComplete="off"
                />
              </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-closing">Dia de Fechamento</Label>
                    <Input
                      id="card-closing"
                      name="card_closing_day"
                      type="number"
                      min="1"
                      max="31"
                      value={cardFormData.closing_day || ""}
                      onChange={(e) =>
                        setCardFormData({
                          ...cardFormData,
                          closing_day: parseInt(e.target.value) || 1,
                        })
                      }
                      placeholder="10"
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="card-due">Dia de Vencimento</Label>
                    <Input
                      id="card-due"
                      name="card_due_day"
                      type="number"
                      min="1"
                      max="31"
                      value={cardFormData.due_day || ""}
                      onChange={(e) =>
                        setCardFormData({
                          ...cardFormData,
                          due_day: parseInt(e.target.value) || 10,
                        })
                      }
                      placeholder="17"
                      autoComplete="off"
                    />
                  </div>
                </div>
              </>
            )}
            </form>
          </div>

          <DialogFooter className="px-4 py-3 border-t bg-gray-50 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCardModalOpen(false)}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="card-form"
              className="flex-1 sm:flex-none"
            >
              {editingCard ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Seleção de Ícone */}
      <IconPickerModal
        open={iconPickerModalOpen}
        onOpenChange={setIconPickerModalOpen}
        selectedIcon={
          iconPickerFor === "bank" ? bankFormData.icon : cardFormData.icon
        }
        onIconSelect={(iconName) => {
          if (iconPickerFor === "bank") {
            setBankFormData({ ...bankFormData, icon: iconName });
          } else {
            setCardFormData({ ...cardFormData, icon: iconName });
          }
        }}
        color={
          iconPickerFor === "bank" ? bankFormData.color : cardFormData.color
        }
      />

      {/* Floating Action Menu */}
      <FABMenu
        primaryIcon={<Plus className="w-6 h-6" />}
        primaryLabel="Adicionar Conta"
        actions={[
          {
            icon: <Landmark className="w-5 h-5" />,
            label: "Novo Banco",
            onClick: () => handleOpenBankModal(null),
          },
          {
            icon: <CreditCard className="w-5 h-5" />,
            label: "Novo Cartão",
            onClick: () => handleOpenCardModal(null),
          },
        ]}
      />
    </div>
  );
}