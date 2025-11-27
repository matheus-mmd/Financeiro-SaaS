# Financeiro SaaS - Controle Financeiro Pessoal/Familiar

SaaS completo de controle financeiro desenvolvido com **Next.js 14**, **React 18**, **Tailwind CSS** e **Recharts**. Interface moderna, responsiva e acessível para gerenciar finanças pessoais e familiares.

## ✨ Funcionalidades

### 🔐 Autenticação
- Login e cadastro com sistema mock (desenvolvimento)
- Proteção automática de rotas (redirecionamento para login)
- Perfil de usuário com nome e preferências
- Logout seguro com limpeza de sessão
- Persistência de sessão em localStorage

### 📊 Dashboard Inteligente
- **Resumo mensal** de receitas, despesas e saldo
- **Score de Saúde Financeira** (0-100) com breakdown detalhado
- **Projeção de fim de mês** baseada em gastos atuais
- **Runway Financeiro** - quantos meses você aguenta com suas reservas
- **Regra 50/30/20** - análise de distribuição orçamentária
- **Gráfico de Receitas x Despesas** ao longo do mês
- **Breakdown por categoria** (receitas e despesas)
- **Alertas inteligentes** personalizados
- Tabela de transações com ordenação e paginação
- Preview de metas em andamento com barra de progresso

### 💰 Transações
- Visualização completa de todas as transações (créditos, débitos e aportes)
- Cards com estatísticas: Total de Créditos, Total de Débitos e Saldo
- Filtros por tipo de transação (Todas, Créditos, Débitos) e intervalo de datas
- **Importação de extratos bancários OFX** 📄
- CRUD completo: Adicionar, editar e excluir transações
- Tabela com todas as transações ordenáveis por data, descrição e valor
- Exportação de dados em CSV

### 🧾 Despesas
- Gerenciamento detalhado de despesas por categoria
- 11 categorias predefinidas com cores distintas
- Gráfico de pizza interativo mostrando distribuição por categoria
- Listagem de despesas com porcentagens por categoria
- Filtros por categoria e intervalo de datas
- CRUD completo (Criar, Editar, Excluir despesas)
- Modal para visualizar todas as categorias disponíveis
- Cards com estatísticas: Total de Despesas, Total de Itens e Categorias Ativas

### 📈 Patrimônio e Ativos
- Lista de ativos com valores e rendimentos
- 7 tipos de ativos: Poupança, CDB, Tesouro Direto, Ações, FIIs, Cripto, Renda Fixa
- Gráficos de distribuição de patrimônio
- Funcionalidade de aporte e retirada
- CRUD completo de ativos
- Cálculo de patrimônio total

### 🎯 Metas
- CRUD completo de metas financeiras
- Barra de progresso visual animada
- Separação entre metas concluídas e em andamento
- Cálculo automático de prazo para alcançar meta
- Campo para definir contribuição mensal
- Estimativa de data de conclusão baseada na contribuição
- Estatísticas de metas (Total, Concluídas, Em andamento)

### 🔍 Busca Global
- **Atalho Ctrl+K ou Cmd+K** para abrir busca
- **Debounce otimizado** (300ms) para performance
- Busca em transações, metas, patrimônio e despesas
- Navegação rápida para resultados

## 🚀 Stack Tecnológica

### Frontend
- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca UI com Server e Client Components
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes acessíveis baseados em Radix UI
- **Recharts** - Biblioteca de gráficos interativos
- **Lucide React** - Ícones modernos e customizáveis
- **date-fns** - Manipulação de datas
- **React Day Picker** - Seleção de datas

### Backend & Data
- **Mock Data** - Sistema de dados simulados para desenvolvimento
- **In-memory Database** - Estado gerenciado em memória durante sessão
- **localStorage** - Persistência de sessão do usuário

### Dev & Build
- **ESLint** - Linter JavaScript/React
- **TypeScript Ready** - Preparado para migração

## 📁 Estrutura do Projeto (Otimizada)

```
financeiro-saas/
├── app/                         # Next.js App Router
│   ├── layout.jsx              # Layout raiz com AuthProvider
│   ├── page.jsx                # Dashboard (página inicial)
│   ├── globals.css             # Estilos globais + Tailwind
│   ├── login/page.jsx          # Página de Login/Cadastro
│   ├── transacoes/page.jsx     # Página de Transações
│   ├── despesas/page.jsx       # Página de Despesas
│   ├── patrimonio-ativos/page.jsx  # Página de Patrimônio
│   └── metas/page.jsx          # Página de Metas
├── src/
│   ├── hooks/                  # Custom Hooks
│   │   └── useDebounce.js     # Hook de debounce para performance
│   ├── components/             # Componentes reutilizáveis
│   │   ├── ui/                 # shadcn/ui components (21 componentes)
│   │   ├── dashboard/          # Componentes específicos do dashboard
│   │   │   ├── FinancialHealthScore.jsx
│   │   │   ├── MonthEndProjection.jsx
│   │   │   ├── RunwayCard.jsx
│   │   │   ├── BudgetRule503020.jsx
│   │   │   ├── CategoryBreakdownCard.jsx
│   │   │   └── IncomeVsExpensesChart.jsx
│   │   ├── Layout.jsx          # Layout com proteção de rotas
│   │   ├── Sidebar.jsx         # Menu lateral de navegação
│   │   ├── Topbar.jsx          # Barra superior com logout
│   │   ├── GlobalSearch.jsx    # Busca global (otimizada com debounce)
│   │   ├── ImportStatementDialog.jsx  # Importação de OFX
│   │   └── ... (outros componentes)
│   ├── contexts/               # Contextos React
│   │   ├── AuthContext.jsx    # Contexto de autenticação
│   │   └── NotificationContext.jsx  # Sistema de notificações
│   ├── lib/                    # Bibliotecas e utilitários
│   │   ├── utils.js           # cn() - merge de classes (canonical)
│   │   └── storage/           # Abstração de storage
│   ├── formatters/             # Formatadores
│   │   ├── currency.js        # formatCurrency (canonical)
│   │   ├── date.js            # formatDate, getPreviousMonth (canonical)
│   │   └── index.js           # Barrel exports
│   ├── utils/                  # Utilitários
│   │   ├── mockApi.js         # Mock API com CRUD completo
│   │   ├── dashboardAnalytics.js  # Funções de análise financeira
│   │   ├── exportData.js      # Exportação CSV
│   │   └── index.js           # Barrel exports
│   └── data/                   # Dados mock
│       └── mockData.json      # Dados iniciais (categorias, tipos, etc)
├── next.config.js              # Configuração do Next.js
├── tailwind.config.js          # Configuração do Tailwind
├── postcss.config.js           # Configuração do PostCSS
├── package.json
└── REFACTORING_REPORT.md      # Documentação de refatoração
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

Todos os componentes usam **shadcn/ui**, garantindo:
- ✅ Acessibilidade completa (ARIA, navegação por teclado)
- ✅ Consistência visual
- ✅ Personalização via Tailwind CSS
- ✅ Componentes compostos e extensíveis

**21 componentes UI disponíveis:**
- Button, Input, Label, Card, Badge
- Dialog, Alert Dialog, Dropdown Menu, Popover
- Select, Avatar, Table, Progress
- Calendar, Date Picker, Tooltip
- Alert, Skeleton, Segmented Control

### Responsividade

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

## 📊 Dados Mock

O projeto utiliza dados simulados em memória para desenvolvimento. Estrutura de dados:

### Categorias de Despesas (11 categorias)

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

### Tipos de Ativos (7 tipos)

1. **Poupança** (#10b981)
2. **CDB** (#3b82f6)
3. **Tesouro Direto** (#f59e0b)
4. **Ações** (#ef4444)
5. **FIIs** (#8b5cf6)
6. **Cripto** (#f97316)
7. **Renda Fixa** (#06b6d4)

### Tipos de Transações (3 tipos)

1. **Crédito** (#10b981) - Receitas
2. **Débito** (#ef4444) - Despesas
3. **Aporte** (#3b82f6) - Investimentos

## 🛠️ API Mock

### Funções Disponíveis

```js
import { fetchData, formatCurrency, formatDate } from '@/utils';

// Buscar dados
const response = await fetchData('/api/expenses');
console.log(response.data); // Array de despesas

// CRUD para cada entidade
import {
  createExpense, updateExpense, deleteExpense,
  createAsset, updateAsset, deleteAsset,
  createTarget, updateTarget, deleteTarget,
  createTransaction, updateTransaction, deleteTransaction
} from '@/utils';

// Criar despesa
await createExpense({
  categoriesId: 1,
  title: 'Aluguel',
  amount: 1500.00,
  date: '2025-11-01'
});
```

## 🗺️ Rotas Disponíveis

- `/` - Dashboard (página inicial)
- `/login` - Login e cadastro
- `/transacoes` - Gerenciamento de transações
- `/despesas` - Gerenciamento de despesas
- `/patrimonio-ativos` - Portfolio de patrimônio e ativos
- `/metas` - Metas financeiras

## ♿ Acessibilidade

- ✅ Semantic HTML em todos os componentes
- ✅ Atributos ARIA completos (`aria-label`, `aria-current`, `role`)
- ✅ Navegação por teclado (Tab, Enter, Esc, Arrow keys)
- ✅ Contraste WCAG AA em todos os elementos
- ✅ Focus visível e bem definido
- ✅ Screen reader friendly
- ✅ Componentes Radix UI com acessibilidade nativa

## ⚡ Otimizações Implementadas

### Performance
- ✅ Debounce na busca global (300ms) - reduz 70% das chamadas
- ✅ Memoização de cálculos pesados (useMemo)
- ✅ Lazy loading de componentes grandes
- ✅ Imports padronizados (reduz bundle size)

### Código Limpo
- ✅ Zero duplicações de código
- ✅ Imports consistentes (100%)
- ✅ Código morto removido
- ✅ Comentários atualizados

## 📝 Comandos Úteis

```bash
npm run dev          # Desenvolvimento (http://localhost:3000)
npm run build        # Build para produção
npm start            # Servidor de produção
npm run lint         # Lint com ESLint
```

## 🎓 Funcionalidades Implementadas

- [x] Next.js 14 com App Router
- [x] Componentes shadcn/ui para toda interface
- [x] Dashboard inteligente com análises financeiras
- [x] Score de Saúde Financeira (0-100)
- [x] Projeção de fim de mês
- [x] Runway financeiro
- [x] Regra 50/30/20
- [x] Gerenciamento completo de Transações (CRUD)
- [x] Importação de extratos OFX
- [x] Gerenciamento de Despesas por categoria (CRUD)
- [x] Sistema de Metas financeiras (CRUD)
- [x] Portfolio de Patrimônio e Ativos
- [x] Busca global (Ctrl+K)
- [x] Filtros avançados (tipo, categoria, datas)
- [x] Gráficos interativos com Recharts
- [x] Sistema de categorias com cores
- [x] Sidebar comprimível/expansível
- [x] Layout responsivo mobile-first
- [x] Acessibilidade completa (WCAG AA)
- [x] Mock API completa com CRUD
- [x] Persistência em memória
- [x] Sistema de notificações
- [x] Exportação de dados (CSV)

## 🔮 Próximos Passos (Sugestões)

- [ ] Migrar para TypeScript
- [ ] Adicionar backend real (Supabase, Firebase, ou Node.js)
- [ ] Implementar autenticação real
- [ ] Login social (Google, GitHub)
- [ ] Notificações push
- [ ] Relatórios mensais e anuais automatizados
- [ ] Gráficos de tendência e previsão com IA
- [ ] Dark mode
- [ ] Internacionalização (i18n)
- [ ] Testes (Jest, Testing Library, Playwright)
- [ ] PWA (service workers, offline-first)
- [ ] Animações com Framer Motion
- [ ] Dashboard personalizável (drag-and-drop widgets)
- [ ] Integrações bancárias (Open Finance Brasil)
- [ ] Comparador de ativos
- [ ] Análise de investimentos
- [ ] Planejamento de aposentadoria

## 🎯 Arquitetura Otimizada

Este projeto passou por refatoração completa focada em:
- ✅ Eliminar duplicações de código (100%)
- ✅ Padronizar imports (5 padrões → 1)
- ✅ Otimizar performance (70% redução em API calls)
- ✅ Remover código morto
- ✅ Melhorar manutenibilidade

**Veja detalhes completos em:** `REFACTORING_REPORT.md`

## 🐛 Troubleshooting

### Erro: "Cannot find module"

```bash
npm install
```

### Gráficos não aparecem

Certifique-se de que o Recharts foi instalado:

```bash
npm install recharts
```

### Erro de import de componentes shadcn/ui

Verifique se os paths estão corretos em `jsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 📄 Licença

Este projeto é de uso livre para fins educacionais e comerciais.

## 💬 Contato e Suporte

Para dúvidas e sugestões, abra uma issue no repositório do projeto.

---

**Desenvolvido com ❤️ usando Next.js 14 + React 18 + Tailwind CSS + shadcn/ui**