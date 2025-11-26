# Financeiro SaaS - Controle Financeiro Pessoal/Familiar

SaaS completo de controle financeiro desenvolvido com **Next.js 14**, **React 18**, **Tailwind CSS** e **Recharts**. Interface moderna, responsiva e acessível para gerenciar finanças pessoais e familiares.

## ✨ Funcionalidades

### 🔐 Autenticação
- Login e cadastro com sistema mock (desenvolvimento)
- Proteção automática de rotas (redirecionamento para login)
- Perfil de usuário com nome e preferências
- Logout seguro com limpeza de sessão
- Persistência de sessão em localStorage

### 📊 Dashboard
- Resumo mensal de receitas, despesas e saldo
- Gráfico de rosca (donut) interativo para despesas por categoria
- Gráfico de área com gradiente para evolução do saldo
- Tabela de transações com ordenação e paginação
- Preview de metas em andamento com barra de progresso

### 💰 Transações
- Visualização completa de todas as transações (créditos e débitos)
- Cards com estatísticas: Total de Créditos, Total de Débitos e Saldo
- Filtros por tipo de transação (Todas, Créditos, Débitos) e intervalo de datas
- CRUD completo: Adicionar, editar e excluir transações
- Tabela com todas as transações ordenáveis por data, descrição e valor
- Interface preparada para exportação de dados

### 🧾 Despesas
- Gerenciamento detalhado de despesas por categoria
- 12 categorias predefinidas com cores distintas
- Gráfico de pizza interativo mostrando distribuição por categoria
- Listagem de despesas com porcentagens por categoria
- Filtros por categoria e intervalo de datas
- CRUD completo (Criar, Editar, Excluir despesas)
- Modal para visualizar todas as categorias disponíveis
- Cards com estatísticas: Total de Despesas, Total de Itens e Categorias Ativas

### 📈 Patrimônio e Ativos
- Lista de ativos com valores e rendimentos
- Modal de detalhes com histórico de evolução
- Gráficos de performance individual
- Funcionalidade de aporte e retirada em patrimônio e ativos
- Comparação com indicadores de referência (CDI)

### 🎯 Metas
- CRUD completo de metas financeiras
- Barra de progresso visual animada
- Separação entre metas concluídas e em andamento
- Cálculo automático de prazo para alcançar meta
- Campo para definir contribuição mensal
- Estimativa de data de conclusão baseada na contribuição
- Estatísticas de metas (Total, Concluídas, Em andamento)

### 🔄 Comparador de Ativos
- Seleção de 2 ativos para comparação lado a lado
- Gráfico comparativo de desempenho histórico
- Métricas detalhadas: retorno acumulado, volatilidade, drawdown
- Análise resumida automática
- Comparação visual com cores distintas

### 👤 Perfil
- Informações do usuário e conta familiar
- Resumo patrimonial completo
- Distribuição de ativos com gráficos
- Configuração de perfil de risco (Conservador, Moderado, Arrojado)
- Dados de receita mensal
- Avatar personalizável

## 🚀 Stack Tecnológica

### Frontend
- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca UI com Server e Client Components
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes acessíveis baseados em Radix UI
- **Recharts** - Biblioteca de gráficos interativos
- **Lucide React** - Ícones modernos e customizáveis

### Backend & Data
- **Mock Data** - Sistema de dados simulados para desenvolvimento
- **In-memory Database** - Estado gerenciado em memória durante sessão
- **localStorage** - Persistência de sessão do usuário

### Dev & Build
- **TypeScript Ready** - Preparado para migração
- **ESLint** - Linter JavaScript/React

## 📁 Estrutura do Projeto

```
financeiro-saas/
├── app/                         # Next.js App Router
│   ├── layout.jsx              # Layout raiz com AuthProvider
│   ├── page.jsx                # Dashboard (página inicial)
│   ├── globals.css             # Estilos globais
│   ├── login/
│   │   └── page.jsx            # Página de Login/Cadastro
│   ├── transacoes/
│   │   └── page.jsx            # Página de Transações
│   ├── despesas/
│   │   └── page.jsx            # Página de Despesas
│   ├── patrimonio-ativos/
│   │   └── page.jsx            # Página de Patrimônio e Ativos
│   ├── metas/
│   │   └── page.jsx            # Página de Metas
│   ├── comparador/
│   │   └── page.jsx            # Comparador de Ativos
│   └── perfil/
│       └── page.jsx            # Perfil do Usuário
├── src/
│   ├── components/             # Componentes reutilizáveis
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── badge.jsx
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── dialog.jsx
│   │   │   ├── dropdown-menu.jsx
│   │   │   ├── input.jsx
│   │   │   ├── label.jsx
│   │   │   ├── select.jsx
│   │   │   └── table.jsx
│   │   ├── Avatar.jsx
│   │   ├── BalanceCard.jsx
│   │   ├── EmptyState.jsx
│   │   ├── Layout.jsx          # Layout com proteção de rotas
│   │   ├── PageHeader.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── Select.jsx
│   │   ├── Sidebar.jsx         # Menu lateral de navegação
│   │   ├── Spinner.jsx
│   │   ├── StatsCard.jsx
│   │   ├── Table.jsx
│   │   ├── Topbar.jsx          # Barra superior com logout
│   │   └── charts/             # Componentes de gráficos
│   │       ├── DoughnutChart.jsx    # Gráfico de rosca interativo
│   │       ├── LineChart.jsx        # Gráfico de área/linha
│   │       └── MultiLineChart.jsx   # Múltiplas linhas
│   ├── contexts/               # Contextos React
│   │   └── AuthContext.jsx    # Contexto de autenticação
│   ├── data/                   # Dados mock (legado)
│   │   └── mockData.json
│   ├── utils/                  # Utilitários
│   │   ├── cn.js              # Utility para merge de classes
│   │   ├── supabase.js        # Cliente Supabase
│   │   ├── supabaseApi.js     # API Supabase (CRUD e queries)
│   │   ├── mockApi.js         # API simulada (legado)
│   │   └── index.js           # Exports
├── supabase/                   # Configuração Supabase
│   ├── schema.sql             # Schema completo do banco
│   ├── seed.sql               # Dados iniciais (categorias, tipos)
│   ├── enable-rls.sql         # Script para habilitar RLS
│   └── disable-rls-dev.sql    # Script para dev (não usar em prod)
├── next.config.js              # Configuração do Next.js
├── tailwind.config.js          # Configuração do Tailwind
├── postcss.config.js           # Configuração do PostCSS
└── package.json
```

## 🎨 Design System

### Tokens de Cores

```css
--brand-500: #0ea5a4  /* Cor primária (Teal) */
--brand-600: #0d8f8e  /* Hover primário */
--brand-700: #0f766e  /* Ativo primário */
--muted: #6b7280      /* Texto secundário */
--bg: #f8fafc         /* Background da aplicação */
```

### Componentes UI (shadcn/ui + Radix UI)

Todos os componentes foram migrados para usar a biblioteca **shadcn/ui**, garantindo:
- ✅ Acessibilidade completa (ARIA, navegação por teclado)
- ✅ Consistência visual
- ✅ Personalização via Tailwind CSS
- ✅ Componentes compostos e extensíveis

#### Button
Variantes: `default`, `secondary`, `outline`, `ghost`, `destructive`
Tamanhos: `sm`, `md` (default), `lg`, `icon`

```jsx
<Button variant="default" size="md">Clique aqui</Button>
```

#### Input
Campo de entrada acessível com label

```jsx
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" placeholder="seu@email.com" />
```

#### Card
Container com sombra e border radius

```jsx
<Card>
  <CardContent>Conteúdo do card</CardContent>
</Card>
```

#### Badge
Tags para status e categorias

```jsx
<Badge variant="default">Ativo</Badge>
<Badge variant="destructive">Excluído</Badge>
```

#### Dialog
Modal acessível e responsivo

```jsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
    </DialogHeader>
    <DialogFooter>
      <Button>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### Table
Tabela acessível com ordenação e paginação

```jsx
<Table columns={columns} data={data} pageSize={10} />
```

### Gráficos Interativos

#### DoughnutChart
- Hover com destaque e ampliação do setor
- Labels com percentuais dentro dos setores
- Legenda interativa sincronizada
- Tooltip com informações detalhadas
- Animações suaves

#### LineChart/AreaChart
- Gráfico de área com gradiente
- Tooltip mostrando variação entre períodos
- Eixos formatados (K, M para milhares/milhões)
- Indicadores de tendência (alta/baixa)

### Responsividade

Breakpoints Tailwind:
- `sm`: ≥640px
- `md`: ≥768px
- `lg`: ≥1024px
- `xl`: ≥1280px
- `2xl`: ≥1400px (container máximo)

Layout mobile-first com:
- Sidebar colapsável em desktop
- Menu lateral deslizante em mobile
- Cards empilhados em telas pequenas
- Gráficos responsivos

## 📦 Instalação e Execução

### Pré-requisitos

- Node.js 18+ e npm

### Passos

1. **Instalar dependências**

```bash
npm install
```

2. **Iniciar servidor de desenvolvimento**

```bash
npm run dev
```

Acesse: `http://localhost:3000`

3. **Build para produção**

```bash
npm run build
```

4. **Iniciar servidor de produção**

```bash
npm start
```

## 🗄️ Configuração do Banco de Dados (Supabase)

O projeto foi migrado de dados mock para **Supabase** como banco de dados real. Abaixo estão as instruções completas para configurar e popular o banco.

### 🔧 Pré-requisitos Supabase

1. **Criar uma conta Supabase**
   - Acesse [https://supabase.com](https://supabase.com)
   - Crie uma conta gratuita
   - Crie um novo projeto

2. **Obter credenciais do projeto**
   - No dashboard do Supabase, vá em **Settings** → **API**
   - Anote as seguintes informações:
     - **Project URL** (URL do projeto)
     - **anon/public key** (chave pública)

### ⚙️ Configuração das Variáveis de Ambiente

1. **Criar arquivo `.env.local`** na raiz do projeto:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica-anon
```

2. **Substituir valores**:
   - `https://seu-projeto.supabase.co` → URL do seu projeto Supabase
   - `sua-chave-publica-anon` → Chave pública (anon/public) do Supabase

> **⚠️ IMPORTANTE:** Nunca faça commit do arquivo `.env.local` no Git. Ele já está incluído no `.gitignore`.

### 🗃️ Criação do Schema do Banco

1. **Acessar SQL Editor no Supabase**
   - No dashboard do Supabase, vá em **SQL Editor**
   - Clique em **New Query**

2. **Executar schema SQL**
   - Copie todo o conteúdo do arquivo `supabase/schema.sql`
   - Cole no SQL Editor
   - Clique em **Run** para executar

O script irá criar:
- ✅ 7 tabelas principais (categories, asset_types, transaction_types, expenses, assets, targets, transactions)
- ✅ Relacionamentos via Foreign Keys
- ✅ Índices para performance
- ✅ Row Level Security (RLS) policies para segurança
- ✅ Views enriquecidas (_enriched) para queries otimizadas
- ✅ Triggers para atualização automática de `updated_at`

### 📊 Popular o Banco com Dados Iniciais (Seed)

**Execute o seed para popular as tabelas de lookup:**

1. **Abrir SQL Editor** no Supabase
2. **Copiar todo o conteúdo** do arquivo `supabase/seed.sql`
3. **Colar no SQL Editor**
4. **Clicar em Run**

O script irá popular:
- ✅ **11 categorias** de despesas (Moradia, Transporte, Alimentação, etc)
- ✅ **7 tipos de ativos** (Poupança, CDB, Ações, etc)
- ✅ **3 tipos de transações** (Crédito, Débito, Aporte)

> **📝 NOTA:** As tabelas de dados do usuário (expenses, assets, targets, transactions) **não são populadas** pelo seed. Elas começam vazias e devem ser preenchidas através da própria aplicação após criar uma conta de usuário.

### 🔐 Configuração de Autenticação

O projeto já vem com autenticação completa integrada ao **Supabase Auth**. Siga os passos abaixo para ativar:

#### 1. Habilitar Autenticação por Email no Supabase

1. **Acesse o dashboard do Supabase**
2. Vá em **Authentication** → **Providers**
3. **Habilite "Email"** (já vem habilitado por padrão)
4. Configure as opções de e-mail:
   - **Enable Email Confirmations** (recomendado): Usuários precisam confirmar e-mail
   - Ou desabilite para testes (permite login imediato sem confirmação)

#### 2. Configurar URL de Redirecionamento

1. Vá em **Authentication** → **URL Configuration**
2. Adicione as URLs permitidas:
   - `http://localhost:3000` (desenvolvimento)
   - Sua URL de produção (quando deployar)

#### 3. Executar Schema com Tabela de Usuários

O arquivo `supabase/schema.sql` já inclui:
- ✅ Tabela `users` para perfil estendido (nome, moeda preferida)
- ✅ Trigger automático que cria perfil quando usuário se registra
- ✅ Policies RLS para proteger dados do perfil

Certifique-se de executar o `schema.sql` completo no SQL Editor.

#### 4. Habilitar Row Level Security

Após configurar autenticação, habilite RLS executando o script `supabase/enable-rls.sql`:

```bash
# No SQL Editor do Supabase, execute:
supabase/enable-rls.sql
```

Isso garante que cada usuário só veja seus próprios dados.

#### 5. Primeiro Acesso

1. **Inicie a aplicação**: `npm run dev`
2. **Acesse**: http://localhost:3000
3. **Você será redirecionado** automaticamente para `/login`
4. **Crie sua conta**:
   - Clique em "Cadastre-se"
   - Preencha nome, e-mail e senha (mínimo 6 caracteres)
   - Se confirmação de e-mail estiver habilitada, verifique sua caixa de entrada
5. **Faça login** com suas credenciais
6. **Comece a usar** a aplicação!

#### 6. Gerenciar Usuários

- **Ver usuários**: Supabase Dashboard → **Authentication** → **Users**
- **Redefinir senha**: Use a funcionalidade de "Esqueci minha senha" (em desenvolvimento)
- **Deletar usuário**: Pelo dashboard do Supabase

### 👤 Como Criar Seus Dados

Após fazer login na aplicação:

1. **Use a interface** para criar:
   - **Despesas**: Vá em "Despesas" e clique em "Nova Despesa"
   - **Ativos**: Vá em "Patrimônio & Ativos" e adicione seus ativos
   - **Metas**: Vá em "Metas" e defina seus objetivos financeiros
   - **Transações**: Vá em "Transações" e registre suas movimentações
   - **Importar OFX**: Na página de Transações, use "Importar Extrato" para carregar arquivo OFX do banco

2. **Dados automáticos no Dashboard**:
   - Todos os gráficos e análises são gerados automaticamente
   - O Dashboard calcula: saúde financeira, projeções, alertas, etc.

Todos os dados são **automaticamente vinculados ao seu usuário** e **protegidos pelas políticas RLS**.

### 🔐 Row Level Security (RLS)

O schema já inclui políticas RLS **otimizadas para performance** que garantem que:
- ✅ Usuários **só podem ver seus próprios dados**
- ✅ Usuários **não podem ver dados de outros usuários**
- ✅ Tabelas de categorias/tipos são **públicas (read-only)**
- ✅ **Performance otimizada**: Usa `(select auth.uid())` ao invés de `auth.uid()` para evitar re-avaliação por linha

As políticas RLS são aplicadas automaticamente pelo Supabase em todas as queries.

#### Otimização de Performance RLS

As políticas usam `(select auth.uid())` ao invés de `auth.uid()` direto. Isso garante que a função seja avaliada **apenas uma vez por query**, não uma vez por linha, resultando em performance muito melhor em escala.

```sql
-- ❌ Ruim - Re-avalia para cada linha
USING (auth.uid() = user_id)

-- ✅ Bom - Avalia apenas uma vez
USING ((select auth.uid()) = user_id)
```

### 📝 Estrutura de Dados (Resumo)

| Tabela | Campos Principais | Relacionamentos |
|--------|-------------------|-----------------|
| **categories** | id, name, color | ← expenses.categories_id |
| **asset_types** | id, name, color | ← assets.asset_types_id |
| **transaction_types** | id, name, color, internal_name | ← transactions.transaction_types_id |
| **expenses** | id, user_id, categories_id, title, amount, date | → categories |
| **assets** | id, user_id, asset_types_id, name, value, yield, currency, date | → asset_types |
| **targets** | id, user_id, title, goal, progress, status, date | - |
| **transactions** | id, user_id, transaction_types_id, date, description, amount | → transaction_types |

### 🔍 Views Enriquecidas

O schema cria 3 views otimizadas que já trazem dados relacionados:

- `expenses_enriched` - Despesas com nome e cor da categoria
- `assets_enriched` - Ativos com nome e cor do tipo
- `transactions_enriched` - Transações com nome, cor e tipo interno

Essas views são usadas automaticamente pelo `supabaseApi.js`.

### ✅ Testar a Conexão

Após configurar o `.env.local` e executar o schema:

1. **Reiniciar o servidor de desenvolvimento**:
```bash
npm run dev
```

2. **Acessar o app**: http://localhost:3000

3. **Verificar no console do navegador** se não há erros de conexão

4. **Testar CRUD** em qualquer página (Despesas, Transações, etc.)

### 🐛 Troubleshooting Supabase

#### Erro: "Missing environment variables"
- Verifique se criou o arquivo `.env.local`
- Verifique se as variáveis estão com os nomes corretos (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- Reinicie o servidor (`npm run dev`)

#### Erro: "Row Level Security policy violation"
- Certifique-se de ter configurado autenticação
- Verifique se está logado com um usuário válido
- Verifique se o user_id nos registros corresponde ao usuário logado

#### Erro: "relation does not exist"
- Execute o script `supabase/schema.sql` completo no SQL Editor
- Verifique se todas as tabelas foram criadas em **Table Editor**

#### Categorias/Tipos não aparecem
- Verifique se executou o **seed.sql** (categorias, tipos de ativos, tipos de transações)
- Abra o **Table Editor** no Supabase e verifique as tabelas `categories`, `asset_types` e `transaction_types`

#### Tabelas de dados vazias (esperado)
- As tabelas `expenses`, `assets`, `targets` e `transactions` devem começar **vazias**
- Elas serão populadas quando você criar dados através da aplicação
- Certifique-se de ter configurado autenticação e estar logado

#### Performance lenta em queries (RLS)
Se você já criou o banco antes dessa otimização, precisa recriar as políticas RLS:

**Opção 1: Recriar o banco completo**
- Delete todas as tabelas
- Execute o `supabase/schema.sql` atualizado

**Opção 2: Atualizar apenas as políticas RLS** (RECOMENDADO)
- Abra o SQL Editor no Supabase
- Copie todo o conteúdo do arquivo **`supabase/fix-rls-performance.sql`**
- Cole no SQL Editor
- Clique em **Run**

Este script automaticamente:
1. Remove todas as políticas RLS antigas
2. Cria políticas RLS otimizadas com `(select auth.uid())`
3. Preserva todos os seus dados

#### Aviso de segurança em funções (search_path)
Se você receber um aviso sobre `search_path` na função `update_updated_at_column`:

- Abra o SQL Editor no Supabase
- Copie todo o conteúdo do arquivo **`supabase/fix-function-search-path.sql`**
- Cole no SQL Editor
- Clique em **Run**

Este script adiciona `SECURITY DEFINER` e `SET search_path = ''` à função para prevenir vulnerabilidades de search path injection.

#### Aviso de segurança em views (SECURITY DEFINER)
Se você receber um aviso sobre views com `SECURITY DEFINER`:

- Abra o SQL Editor no Supabase
- Copie todo o conteúdo do arquivo **`supabase/fix-views-security.sql`**
- Cole no SQL Editor
- Clique em **Run**

Este script recria as views com `security_invoker = true` para garantir que elas respeitem as políticas RLS de cada usuário.

## 🗺️ Rotas Disponíveis

O projeto usa **Next.js App Router** com as seguintes rotas:

- `/` - Dashboard (página inicial)
- `/transacoes` - Gerenciamento de transações
- `/despesas` - Gerenciamento de despesas
- `/patrimonio-ativos` - Portfolio de patrimônio e ativos
- `/metas` - Metas financeiras
- `/comparador` - Comparador de ativos
- `/perfil` - Perfil do usuário

## 📊 Camada de Dados

O projeto utiliza **Supabase** como banco de dados real (PostgreSQL). A estrutura de dados inclui:

- **categories**: Categorias de despesas (11 categorias)
- **asset_types**: Tipos de ativos (7 tipos)
- **transaction_types**: Tipos de transações (3 tipos)
- **expenses**: Despesas categorizadas do usuário
- **assets**: Patrimônio e ativos do usuário
- **targets**: Metas financeiras do usuário
- **transactions**: Histórico de transações do usuário

### Categorias de Despesas

O sistema inclui 11 categorias predefinidas com cores distintas:

1. **Moradia** (#3b82f6) - Aluguel, financiamento, condomínio
2. **Transporte** (#ef4444) - Combustível, transporte público
3. **Alimentação** (#10b981) - Supermercado, restaurantes
4. **Saúde** (#f59e0b) - Plano de saúde, medicamentos
5. **Educação** (#8b5cf6) - Cursos, livros, material
6. **Lazer** (#ec4899) - Cinema, passeios, hobbies
7. **Assinaturas** (#06b6d4) - Streaming, software
8. **Família** (#f97316) - Ajuda familiar, presentes
9. **Crédito** (#6366f1) - Cartão de crédito, empréstimos
10. **Utilities** (#84cc16) - Água, luz, internet
11. **Outros** (#64748b) - Despesas diversas

### Acessar Dados via Supabase API

O projeto usa `supabaseApi.js` para comunicação com o banco:

```js
import { fetchData } from '../utils';

// Buscar despesas
const response = await fetchData('/api/expenses');
console.log(response.data); // Array de despesas enriquecidas

// Criar nova despesa
import { createExpense } from '../utils';
await createExpense({
  categoriesId: 1,
  title: 'Aluguel',
  amount: 1500.00,
  date: '2025-11-01'
});
```

### API de Dados (src/utils/supabaseApi.js)

Funções disponíveis:

#### Leitura (Read)
- `fetchData(endpoint)` - Busca dados enriquecidos

#### Despesas (Expenses)
- `createExpense(expense)` - Criar despesa
- `updateExpense(id, updates)` - Atualizar despesa
- `deleteExpense(id)` - Deletar despesa

#### Ativos (Assets)
- `createAsset(asset)` - Criar ativo
- `updateAsset(id, updates)` - Atualizar ativo
- `deleteAsset(id)` - Deletar ativo

#### Metas (Targets)
- `createTarget(target)` - Criar meta
- `updateTarget(id, updates)` - Atualizar meta
- `deleteTarget(id)` - Deletar meta

#### Transações (Transactions)
- `createTransaction(transaction)` - Criar transação
- `updateTransaction(id, updates)` - Atualizar transação
- `deleteTransaction(id)` - Deletar transação

#### Utilitários
- `formatCurrency(value)` - Formata valores monetários
- `formatDate(dateString)` - Formata datas
- `calculateProgress(progress, goal)` - Calcula porcentagem

### Dados Mock (Legado)

Para referência, os dados mock antigos estão em `src/data/mockData.json` e `src/utils/mockApi.js`, mas **não são mais utilizados** pela aplicação.

## 🛠️ Funções Utilitárias

### formatCurrency(value)
Formata valores em BRL

```js
formatCurrency(1234.56) // "R$ 1.234,56"
```

### formatDate(dateString)
Formata datas em pt-BR

```js
formatDate('2025-11-01') // "01/11/2025"
```

### calculateProgress(progress, goal)
Calcula porcentagem de progresso

```js
calculateProgress(5000, 10000) // 50
```

### cn(...inputs)
Utilitário para merge de classes Tailwind (clsx + tailwind-merge)

```js
cn('px-4 py-2', someCondition && 'bg-blue-500') // Merge inteligente de classes
```

## ♿ Acessibilidade

- ✅ Semantic HTML em todos os componentes
- ✅ Atributos ARIA completos (`aria-label`, `aria-current`, `role`)
- ✅ Navegação por teclado (Tab, Enter, Esc, Arrow keys)
- ✅ Contraste WCAG AA em todos os elementos
- ✅ Focus visível e bem definido
- ✅ Screen reader friendly
- ✅ Componentes Radix UI com acessibilidade nativa

## 🎨 Customização

### Trocar Cores

Edite `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      brand: {
        500: '#SUA_COR',
        600: '#SUA_COR',
        700: '#SUA_COR',
      }
    }
  }
}
```

### Adicionar Nova Página

1. Crie o diretório e arquivo em `app/minha-pagina/page.jsx`:

```jsx
'use client';

export default function MinhaPagina() {
  return (
    <div>
      <h1>Minha Página</h1>
    </div>
  );
}
```

2. Adicione o item no menu em `src/components/Sidebar.jsx`:

```jsx
const menuItems = [
  // ... outros itens
  { path: '/minha-pagina', icon: SeuIcone, label: 'Minha Página' },
];
```

### Adicionar Componente shadcn/ui

Para adicionar novos componentes shadcn/ui:

```bash
npx shadcn-ui@latest add [component-name]
```

Exemplo:
```bash
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add switch
```

### Integrar com Backend Real

Substitua `fetchMock()` por chamadas reais à API:

```js
// Antes (Mock)
const response = await fetchMock('/api/expenses');

// Depois (API Real)
const response = await fetch('/api/expenses');
const data = await response.json();
```

Para APIs externas, configure em `next.config.js`:

```js
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'https://api.exemplo.com/:path*',
    },
  ];
}
```

## ✅ Funcionalidades Implementadas

- [x] Next.js 14 com App Router
- [x] Componentes shadcn/ui para toda interface
- [x] Dashboard com resumo financeiro e gráficos interativos
- [x] Gerenciamento completo de Transações (CRUD)
- [x] Gerenciamento completo de Despesas por categoria (CRUD)
- [x] Sistema de Metas financeiras (CRUD) com cálculo de prazo
- [x] Portfolio de Patrimônio e Ativos com aporte/retirada
- [x] Comparador de Ativos
- [x] Perfil do usuário
- [x] Filtros avançados (tipo, categoria, intervalo de datas)
- [x] Gráficos interativos e responsivos com Recharts
- [x] Sistema de categorias com cores personalizadas
- [x] Sidebar comprimível/expansível
- [x] Layout responsivo mobile-first
- [x] Acessibilidade completa (WCAG AA)
- [x] Integração completa com Supabase (PostgreSQL)
- [x] CRUD completo via Supabase API
- [x] Row Level Security (RLS) para multi-tenancy

## 🔮 Próximos Passos (Sugestões)

- [ ] Migrar para TypeScript
- [ ] Adicionar autenticação Supabase Auth
- [ ] Implementar login social (Google, GitHub)
- [ ] Implementar filtros avançados com date range picker
- [ ] Exportar dados (PDF, CSV, Excel)
- [ ] Notificações push e alertas de metas
- [ ] Busca global nas transações
- [ ] Relatórios mensais e anuais automatizados
- [ ] Gráficos de tendência e previsão
- [ ] Dark mode
- [ ] Internacionalização (i18n)
- [ ] Testes (Jest, Testing Library, Playwright)
- [ ] PWA (service workers, offline-first)
- [ ] Animações com Framer Motion
- [ ] Dashboard personalizável (drag-and-drop widgets)
- [ ] Integrações bancárias (Open Finance)

## 📝 Comandos Úteis

```bash
npm run dev          # Desenvolvimento (http://localhost:3000)
npm run build        # Build para produção
npm start            # Servidor de produção
npm run lint         # Lint com ESLint (Next.js)
```

## 🐛 Troubleshooting

### Erro: "Cannot find module"

Certifique-se de ter instalado todas as dependências:

```bash
npm install
```

### Gráficos não aparecem

Verifique se o Recharts foi instalado:

```bash
npm install recharts
```

### Erro de import de componentes shadcn/ui

Verifique se os componentes foram instalados e se os paths estão corretos em `tsconfig.json` ou `jsconfig.json`.

### Erro de CORS ao integrar com API

Use as `rewrites` do Next.js para proxy (ver seção de Integração com Backend).

## 📄 Licença

Este projeto é de uso livre para fins educacionais e comerciais.

## 💬 Contato e Suporte

Para dúvidas e sugestões, abra uma issue no repositório do projeto.

---

**Desenvolvido com ❤️ usando Next.js 14 + React 18 + Tailwind CSS + shadcn/ui**