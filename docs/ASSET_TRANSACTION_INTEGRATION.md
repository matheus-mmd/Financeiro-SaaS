# 🔗 Integração Automática: Ativos ↔ Transações

## 📋 Resumo

Implementada integração automática entre **Patrimônio e Ativos** e **Transações**. Agora, quando você cria/atualiza/deleta um ativo, uma transação de tipo "Aporte" é automaticamente criada/atualizada/deletada.

---

## ✅ O Que Foi Implementado

### 1. **Migration 008** (`008_add_asset_transaction_link.sql`)
Adiciona campos de vínculo bidirecional:
- `assets.related_transaction_id` → ID da transação de aporte
- `transactions.related_asset_id` → ID do ativo relacionado

### 2. **API de Assets Atualizada**

#### `createAsset()` - Criar Ativo
1. ✅ Cria uma **transação de aporte** automaticamente
   - Tipo: INVESTMENT (Aporte)
   - Status: Pago
   - Descrição: "Aporte: [Nome do Ativo]"
   - Valor: Negativo (saída de dinheiro)
   - Data: Data de compra ou avaliação do ativo
2. ✅ Cria o **ativo** vinculado à transação
3. ✅ Estabelece **vínculo bidirecional** entre os dois registros

#### `updateAsset()` - Atualizar Ativo
1. ✅ Atualiza o **ativo**
2. ✅ Atualiza a **transação vinculada** (se existir)
   - Nome → Descrição da transação
   - Valor → Amount da transação
   - Data → Data da transação

#### `deleteAsset()` - Deletar Ativo
1. ✅ Soft delete do **ativo**
2. ✅ Soft delete da **transação vinculada** (se existir)

---

## 🚀 Como Usar

### PASSO 1: Executar Migration no Supabase

Acesse o **Supabase Dashboard** → SQL Editor e execute:

```sql
-- Migration 008
-- Copie e cole o conteúdo de: supabase/migrations/008_add_asset_transaction_link.sql
```

Ou execute via arquivo:
1. Abra `supabase/migrations/008_add_asset_transaction_link.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run**

### PASSO 2: Testar a Integração

#### Teste 1: Criar Ativo
1. Vá para **Patrimônio e Ativos**
2. Clique em **"+ Novo Ativo"**
3. Preencha:
   - Nome: "Ações Magazine Luiza"
   - Tipo: "Ações"
   - Valor: R$ 5.000,00
   - Data: hoje
4. **Salve**

**Resultado esperado:**
- ✅ Ativo criado na página de Patrimônio
- ✅ **Transação de Aporte** criada automaticamente na página de Transações
  - Descrição: "Aporte: Ações Magazine Luiza"
  - Valor: -R$ 5.000,00 (negativo)
  - Tipo: Aporte

#### Teste 2: Verificar nas Transações
1. Vá para **Transações**
2. Verifique se aparece a transação "Aporte: Ações Magazine Luiza"
3. Valor deve ser **negativo** (saída de dinheiro)

#### Teste 3: Atualizar Ativo
1. Volte para **Patrimônio e Ativos**
2. Edite o ativo criado
3. Mude o nome para "Ações MGLU3"
4. **Salve**

**Resultado esperado:**
- ✅ Ativo atualizado
- ✅ Transação atualizada automaticamente: "Aporte: Ações MGLU3"

#### Teste 4: Deletar Ativo
1. Delete o ativo
2. Vá para **Transações**
3. A transação vinculada também deve ter sido deletada

---

## 🔍 Detalhes Técnicos

### Fluxo de Criação

```
CRIAR ATIVO
    ↓
1. Criar Transação (tipo: INVESTMENT)
    ↓
2. Criar Asset (com related_transaction_id)
    ↓
3. Atualizar Transaction (com related_asset_id)
    ↓
✅ CONCLUÍDO (vínculo bidirecional estabelecido)
```

### Campos da Transação Automática

| Campo | Valor |
|-------|-------|
| `description` | "Aporte: [nome do ativo]" |
| `transaction_type_id` | 3 (INVESTMENT) |
| `payment_status_id` | 2 (Pago) |
| `amount` | -abs(purchase_value \|\| value) |
| `transaction_date` | purchase_date \|\| valuation_date \|\| date |
| `category_id` | Mesma categoria do ativo |
| `notes` | Descrição do ativo |
| `related_asset_id` | ID do ativo criado |

### Campos do Ativo

| Campo Novo | Descrição |
|------------|-----------|
| `related_transaction_id` | ID da transação de aporte |

---

## 🎯 Benefícios

1. ✅ **Automatização**: Não precisa criar transação manualmente
2. ✅ **Consistência**: Ativo e transação sempre sincronizados
3. ✅ **Rastreabilidade**: Fácil visualizar origem do ativo
4. ✅ **Fluxo de Caixa Completo**: Dashboard mostra corretamente saídas de investimento

---

## 📊 Exemplo Prático

**Cenário**: Comprei R$ 10.000 em ações

**Antes da integração:**
- Criava o ativo manualmente ✅
- Criava a transação manualmente ✅
- Poderia esquecer um dos dois ❌
- Poderia haver inconsistência entre valores ❌

**Depois da integração:**
- Cria apenas o ativo ✅
- Transação criada automaticamente ✅
- Valores sempre consistentes ✅
- Vínculo bidirecional estabelecido ✅

---

## 🔧 Troubleshooting

### Migration 008 falha
**Solução**: Verifique se migrations 001-007 foram executadas

### Transação não aparece
**Solução**:
1. Verifique console do navegador
2. Verifique se migration 008 foi executada
3. Verifique se TRANSACTION_TYPE_IDS.INVESTMENT = 3

### Erro ao criar ativo
**Solução**: Se houver erro na transação, o ativo não será criado (rollback automático)

---

## 📝 Próximas Melhorias (Opcional)

1. **UI indicator**: Mostrar na lista de ativos que há uma transação vinculada
2. **Link direto**: Botão para navegar do ativo para a transação
3. **Relatório**: Dashboard mostrando ativos vs transações de aporte
4. **Notificação**: Toast confirmando criação da transação automática

---

**Data de Implementação**: Dezembro 2025
**Versão**: 1.0
