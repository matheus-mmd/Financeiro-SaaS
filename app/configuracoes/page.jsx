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
import { Switch } from "../../src/components/ui/switch";
import SegmentedControl from "../../src/components/ui/segmented-control";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../src/components/ui/dialog";
import { useToast } from "../../src/components/Toast";
import ConfirmDialog from "../../src/components/ConfirmDialog";
import { useSettings } from "../../src/lib/supabase/hooks/useSettings";
import {
  calculateTrialDaysRemaining,
} from "../../src/lib/supabase/api/settings";
import {
  ArrowLeft,
  Clock,
  User,
  Mail,
  Phone,
  Users,
  Trash2,
  Plus,
  Bell,
  BellOff,
  Moon,
  BookOpen,
  AlertTriangle,
  Check,
  Pencil,
  Info,
  Briefcase,
  Building2,
} from "lucide-react";

/**
 * Formata telefone para exibição (11) 99999-9999
 */
function formatPhone(phone) {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Formata data para exibição DD/MM/YYYY
 */
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR");
}

/**
 * Formata data e hora para exibição DD/MM/YYYY às HH:MM
 */
function formatDateTime(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return `${date.toLocaleDateString("pt-BR")} às ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

/**
 * Trunca string para exibição
 */
function truncateString(str, maxLength = 10) {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut, refreshProfile } = useAuth();
  const toast = useToast();

  // Hook de settings com cache
  const {
    settings,
    loading,
    error: settingsError,
    subscriptionInfo,
    trialDaysRemaining,
    refresh: refreshSettings,
    updatePersonalInfo: updatePersonalInfoAPI,
    updatePreferences: updatePreferencesAPI,
    addMember: addMemberAPI,
    updateMember: updateMemberAPI,
    removeMember: removeMemberAPI,
    resetAccount: resetAccountAPI,
  } = useSettings();

  // Estado de saving
  const [saving, setSaving] = useState(false);

  // Estado de edição de informações pessoais
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({ name: "", phone: "" });

  // Estado de modal de integrante
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberData, setMemberData] = useState({
    name: "",
    email: "",
    phone: "",
    workType: "clt",
  });

  // Estado de confirmação de exclusão
  const [confirmDeleteMemberOpen, setConfirmDeleteMemberOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  // Estado de confirmação de reset
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Estado de modal de alterar email
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  // Sincronizar personalInfo quando settings carrega
  React.useEffect(() => {
    if (settings) {
      setPersonalInfo({
        name: settings.name || "",
        phone: settings.phone || "",
      });
    }
  }, [settings]);

  // Tratar erro de autenticacao
  React.useEffect(() => {
    if (settingsError?.code === "AUTH_REQUIRED") {
      signOut();
      router.replace("/");
    }
  }, [settingsError, signOut, router]);

  // Handlers
  const handleSavePersonalInfo = async () => {
    try {
      setSaving(true);
      const { error } = await updatePersonalInfoAPI(personalInfo);

      if (error) throw error;

      setEditingPersonalInfo(false);
      await refreshProfile();
      toast.success("Informacoes atualizadas com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar informacoes:", err);
      toast.error("Erro ao salvar informacoes");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleNotifications = async () => {
    try {
      const newValue = !settings.push_notifications_enabled;
      const { error } = await updatePreferencesAPI({
        push_notifications_enabled: newValue,
      });

      if (error) throw error;

      toast.success(newValue ? "Notificacoes ativadas" : "Notificacoes desativadas");
    } catch (err) {
      console.error("Erro ao atualizar notificacoes:", err);
      toast.error("Erro ao atualizar preferencia");
    }
  };

  const handleToggleDarkMode = async () => {
    try {
      const newValue = !settings.dark_mode_enabled;
      const { error } = await updatePreferencesAPI({ dark_mode_enabled: newValue });

      if (error) throw error;

      toast.success(newValue ? "Modo escuro ativado" : "Modo escuro desativado");
    } catch (err) {
      console.error("Erro ao atualizar modo escuro:", err);
      toast.error("Erro ao atualizar preferencia");
    }
  };

  const handleOpenMemberModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setMemberData({
        name: member.name || "",
        email: member.email || "",
        phone: member.phone || "",
        workType: member.work_type || "clt",
      });
    } else {
      setEditingMember(null);
      setMemberData({ name: "", email: "", phone: "", workType: "clt" });
    }
    setMemberModalOpen(true);
  };

  const handleSaveMember = async () => {
    if (!memberData.name.trim()) {
      toast.warning("Por favor, informe o nome do integrante");
      return;
    }

    try {
      setSaving(true);

      if (editingMember) {
        const { error } = await updateMemberAPI(editingMember.id, memberData);
        if (error) throw error;

        toast.success("Integrante atualizado com sucesso!");
      } else {
        const { error } = await addMemberAPI(memberData);
        if (error) throw error;

        toast.success("Integrante adicionado com sucesso!");
      }

      setMemberModalOpen(false);
    } catch (err) {
      console.error("Erro ao salvar integrante:", err);
      toast.error("Erro ao salvar integrante");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      const { error } = await removeMemberAPI(memberToDelete.id);
      if (error) throw error;

      toast.success("Integrante removido com sucesso!");
    } catch (err) {
      console.error("Erro ao remover integrante:", err);
      toast.error("Erro ao remover integrante");
    } finally {
      setMemberToDelete(null);
    }
  };

  const handleResetAccount = async () => {
    try {
      setSaving(true);
      const { success, error } = await resetAccountAPI();

      if (error) throw error;

      if (success) {
        toast.success("Conta resetada com sucesso!");
        router.push("/configurar-perfil");
      }
    } catch (err) {
      console.error("Erro ao resetar conta:", err);
      toast.error("Erro ao resetar conta");
    } finally {
      setSaving(false);
      setConfirmResetOpen(false);
    }
  };

  const handleRestartTutorial = () => {
    // TODO: Implementar lógica de reiniciar tutorial
    toast.info("Tutorial reiniciado! Recarregue a página para ver o tour.");
  };

  // Verificar autenticacao
  if (!authLoading && !user) {
    router.replace("/");
    return <PageSkeleton />;
  }

  // Mostrar skeleton apenas se auth estiver carregando E nao houver dados em cache
  if (authLoading && !settings) {
    return <PageSkeleton />;
  }

  // Calcular valores derivados
  const trialDays = trialDaysRemaining;
  const hasUsedTrial = settings?.trial_ends_at && new Date(settings.trial_ends_at) < new Date();

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Status da Assinatura - Renderiza com skeleton se carregando */}
      <Card>
        <CardContent className="p-4">
          {loading && !settings ? (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 animate-pulse">
              <div className="p-3 bg-gray-200 rounded-full w-12 h-12" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-3 bg-gray-200 rounded w-48" />
              </div>
              <div className="h-9 bg-gray-200 rounded w-28" />
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
              <div className="p-3 bg-amber-100 rounded-full">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-700">{subscriptionInfo?.label || "Carregando..."}</p>
                <p className="text-sm text-amber-600">
                  {subscriptionInfo?.expired
                    ? "Seu periodo de teste expirou"
                    : `Menos de ${trialDays} dias restantes • Expira em ${formatDateTime(settings?.trial_ends_at)}`}
                </p>
              </div>
              <Button
                onClick={() => router.push("/escolher-plano")}
                className="bg-brand-500 hover:bg-brand-600"
              >
                Fazer upgrade
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Header com botão voltar */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuracoes</h1>
          <p className="text-sm text-gray-500">Gerencie seu perfil e assinatura</p>
        </div>
      </div>

      {/* Informações Pessoais */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Informacoes Pessoais</h2>
          <p className="text-sm text-gray-500 mb-4">Atualize seus dados de perfil</p>

          <div className="space-y-4">
            {/* Nome */}
            <div>
              <Label className="text-sm text-gray-600">Nome completo</Label>
              <div className="flex items-center gap-3 mt-1 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-400" />
                {editingPersonalInfo ? (
                  <Input
                    value={personalInfo.name}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                    className="flex-1 bg-white"
                    placeholder="Seu nome"
                  />
                ) : (
                  <span className="flex-1 text-gray-900">{settings?.name || "-"}</span>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <Label className="text-sm text-gray-600">Email</Label>
              <div className="flex items-center gap-3 mt-1 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="flex-1 text-gray-900">{settings?.email || "-"}</span>
                <button
                  onClick={() => setEmailModalOpen(true)}
                  className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
                >
                  <Pencil className="w-4 h-4" />
                  Alterar
                </button>
              </div>
            </div>

            {/* Celular */}
            <div>
              <Label className="text-sm text-gray-600">Celular</Label>
              <div className="flex items-center gap-3 mt-1 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-400" />
                {editingPersonalInfo ? (
                  <Input
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    className="flex-1 bg-white"
                    placeholder="(11) 99999-9999"
                  />
                ) : (
                  <span className="flex-1 text-gray-900">
                    {formatPhone(settings?.phone) || "-"}
                  </span>
                )}
              </div>
            </div>

            {/* Botões de ação */}
            {editingPersonalInfo ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingPersonalInfo(false);
                    setPersonalInfo({ name: settings?.name || "", phone: settings?.phone || "" });
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSavePersonalInfo}
                  disabled={saving}
                  className="flex-1 bg-brand-500 hover:bg-brand-600"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Salvar alteracoes
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setEditingPersonalInfo(true)}
                className="bg-brand-500 hover:bg-brand-600"
              >
                <Check className="w-4 h-4 mr-2" />
                Editar informacoes
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Integrantes da Conta Conjunta */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-1">
            <Users className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Integrantes da Conta Conjunta</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4 ml-8">
            Gerencie os integrantes e configure emails para lembretes
          </p>

          {/* Lista de integrantes */}
          <div className="space-y-4">
            {settings?.members?.length > 0 ? (
              settings.members.map((member) => (
                <div key={member.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-medium text-gray-900">{member.name || member.email}</span>
                    <button
                      onClick={() => {
                        setMemberToDelete(member);
                        setConfirmDeleteMemberOpen(true);
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover integrante"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{member.email || "email@exemplo.com"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{formatPhone(member.phone) || "(11) 99999-9999"}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mt-3 mb-2">
                    O e-mail e usado para lembretes e o WhatsApp para registrar transacoes via mensagem
                  </p>

                  {/* Tipo de trabalho */}
                  <div>
                    <Label className="text-xs text-gray-500 mb-2 block">Tipo de trabalho</Label>
                    <SegmentedControl
                      options={[
                        { value: "clt", label: "CLT", icon: Briefcase },
                        { value: "autonomo", label: "Autonomo", icon: Building2 },
                      ]}
                      value={member.work_type || "clt"}
                      onChange={async (value) => {
                        try {
                          await updateMemberAPI(member.id, { workType: value });
                        } catch (err) {
                          toast.error("Erro ao atualizar tipo de trabalho");
                        }
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Nenhum integrante adicionado</p>
              </div>
            )}

            {/* Adicionar novo integrante */}
            <div className="flex gap-2">
              <Input
                placeholder="Nome do integrante"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    setMemberData({ ...memberData, name: e.target.value });
                    handleOpenMemberModal();
                  }
                }}
              />
              <Button
                onClick={() => handleOpenMemberModal()}
                className="bg-brand-500 hover:bg-brand-600"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <Button
              onClick={() => refreshSettings(true)}
              disabled={saving}
              className="w-full bg-brand-500 hover:bg-brand-600"
            >
              Salvar alteracoes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informações da Conta */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informacoes da Conta</h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">ID da conta</span>
              <span className="text-gray-900 font-mono text-sm">
                {truncateString(settings?.id, 8)}...
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Conta criada em</span>
              <span className="text-gray-900">{formatDate(settings?.created_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferências do App */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Preferencias do App</h2>
          <p className="text-sm text-gray-500 mb-4">Configuracoes e ajustes do aplicativo</p>

          <div className="space-y-4">
            {/* Notificações */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Notificacoes</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BellOff className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Notificacoes Push</p>
                    <p className="text-xs text-gray-500">
                      {settings?.push_notifications_enabled ? "Ativadas" : "Desativadas"}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleToggleNotifications}
                  variant={settings?.push_notifications_enabled ? "outline" : "default"}
                  size="sm"
                  className={settings?.push_notifications_enabled ? "" : "bg-brand-500 hover:bg-brand-600"}
                >
                  {settings?.push_notifications_enabled ? "Desativar" : "Ativar"}
                </Button>
              </div>
            </div>

            {/* Modo escuro */}
            <div className="flex items-center justify-between py-3 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Modo escuro</p>
                  <p className="text-xs text-gray-500">Ativar tema escuro no app</p>
                </div>
              </div>
              <Switch
                checked={settings?.dark_mode_enabled || false}
                onCheckedChange={handleToggleDarkMode}
              />
            </div>

            {/* Tutorial */}
            <div className="flex items-center justify-between py-3 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Tutorial do app</p>
                  <p className="text-xs text-gray-500">Reveja o tour de introducao</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleRestartTutorial}>
                Reiniciar tutorial
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zona de Perigo */}
      <Card className="border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-red-600">Zona de Perigo</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Acoes irreversiveis que afetam todos os dados da sua conta
          </p>

          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold text-red-700">Resetar conta</p>
                <p className="text-sm text-red-600 mt-1">
                  Apaga todas as transacoes, cartoes, investimentos, metas e configuracoes. Sua
                  conta permanece ativa, mas voce recomeca do zero.
                </p>
                {hasUsedTrial && (
                  <div className="flex items-start gap-2 mt-3 p-2 bg-red-100 rounded">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">
                      Atencao: Voce ja utilizou o periodo de teste. Apos resetar, NAO sera possivel
                      fazer um novo trial.
                    </p>
                  </div>
                )}
              </div>
              <Button
                variant="destructive"
                onClick={() => setConfirmResetOpen(true)}
                className="flex-shrink-0"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Resetar tudo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Alterar Email */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Email</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                Para alterar seu email, entre em contato com o suporte ou acesse as configuracoes
                de autenticacao do Supabase.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Integrante */}
      <Dialog open={memberModalOpen} onOpenChange={setMemberModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Editar Integrante" : "Adicionar Integrante"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="member-name">Nome</Label>
              <Input
                id="member-name"
                value={memberData.name}
                onChange={(e) => setMemberData({ ...memberData, name: e.target.value })}
                placeholder="Nome do integrante"
              />
            </div>

            <div>
              <Label htmlFor="member-email">Email</Label>
              <Input
                id="member-email"
                type="email"
                value={memberData.email}
                onChange={(e) => setMemberData({ ...memberData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <Label htmlFor="member-phone">Telefone</Label>
              <Input
                id="member-phone"
                value={memberData.phone}
                onChange={(e) => setMemberData({ ...memberData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <Label>Tipo de trabalho</Label>
              <SegmentedControl
                options={[
                  { value: "clt", label: "CLT", icon: Briefcase },
                  { value: "autonomo", label: "Autonomo", icon: Building2 },
                ]}
                value={memberData.workType}
                onChange={(value) => setMemberData({ ...memberData, workType: value })}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveMember} disabled={saving}>
              {editingMember ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão de integrante */}
      <ConfirmDialog
        open={confirmDeleteMemberOpen}
        onOpenChange={setConfirmDeleteMemberOpen}
        title="Remover integrante"
        description={
          memberToDelete
            ? `Tem certeza que deseja remover "${memberToDelete.name || memberToDelete.email}" da conta conjunta?`
            : ""
        }
        confirmText="Remover"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDeleteMember}
      />

      {/* Confirmação de reset */}
      <ConfirmDialog
        open={confirmResetOpen}
        onOpenChange={setConfirmResetOpen}
        title="Resetar conta"
        description="Esta acao ira apagar TODOS os seus dados: transacoes, cartoes, contas bancarias, investimentos, metas e configuracoes. Esta acao NAO pode ser desfeita. Tem certeza?"
        confirmText="Sim, resetar tudo"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleResetAccount}
      />
    </div>
  );
}