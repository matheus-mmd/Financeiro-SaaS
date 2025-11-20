# Financeiro SaaS - Controle Financeiro Pessoal/Familiar

SaaS completo de controle financeiro desenvolvido com **Next.js 14**, **React 18**, **Tailwind CSS** e **Recharts**. Interface moderna, responsiva e acessível para gerenciar finanças pessoais e familiares.

## ✨ Funcionalidades

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

- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca UI com Server e Client Components
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes acessíveis baseados em Radix UI
- **Recharts** - Biblioteca de gráficos interativos
- **Lucide React** - Ícones modernos e customizáveis
- **TypeScript Ready** - Preparado para migração

## 📁 Estrutura do Projeto

```
financeiro-saas/
├── app/                         # Next.js App Router
│   ├── layout.jsx              # Layout raiz da aplicação
│   ├── page.jsx                # Dashboard (página inicial)
│   ├── globals.css             # Estilos globais
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
│   │   ├── Layout.jsx          # Layout com Sidebar/Topbar
│   │   ├── PageHeader.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── Select.jsx
│   │   ├── Sidebar.jsx         # Menu lateral de navegação
│   │   ├── Spinner.jsx
│   │   ├── StatsCard.jsx
│   │   ├── Table.jsx
│   │   ├── Topbar.jsx
│   │   └── charts/             # Componentes de gráficos
│   │       ├── DoughnutChart.jsx    # Gráfico de rosca interativo
│   │       ├── LineChart.jsx        # Gráfico de área/linha
│   │       └── MultiLineChart.jsx   # Múltiplas linhas
│   ├── data/                   # Dados mock
│   │   └── mockData.json
│   ├── utils/                  # Utilitários
│   │   ├── cn.js              # Utility para merge de classes
│   │   ├── mockApi.js         # API simulada
│   │   └── index.js           # Exports
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

## 🗺️ Rotas Disponíveis

O projeto usa **Next.js App Router** com as seguintes rotas:

- `/` - Dashboard (página inicial)
- `/transacoes` - Gerenciamento de transações
- `/despesas` - Gerenciamento de despesas
- `/patrimonio-ativos` - Portfolio de patrimônio e ativos
- `/metas` - Metas financeiras
- `/comparador` - Comparador de ativos
- `/perfil` - Perfil do usuário

## 📊 Dados Mock

Os dados mock estão em `src/data/mockData.json` e incluem:

- **user**: Informações do usuário (nome, parceiro, moeda)
- **summary**: Resumo financeiro mensal
- **expenses**: Lista de despesas categorizadas
- **assets**: Patrimônio e ativos
- **targets**: Metas financeiras
- **transactions**: Histórico de transações
- **comparison_sample**: Dados para comparação de ativos

### Categorias de Despesas

O sistema inclui 12 categorias predefinidas com cores distintas:

1. **Moradia** (#0ea5a4) - Aluguel, financiamento, condomínio
2. **Transporte** (#3b82f6) - Combustível, transporte público
3. **Alimentação** (#10b981) - Supermercado, restaurantes
4. **Saúde** (#ef4444) - Plano de saúde, medicamentos
5. **Educação** (#8b5cf6) - Cursos, livros, material
6. **Lazer** (#f59e0b) - Cinema, passeios, hobbies
7. **Assinaturas** (#ec4899) - Streaming, software
8. **Família** (#14b8a6) - Ajuda familiar, presentes
9. **Poupança** (#06b6d4) - Aportes mensais em patrimônio
10. **Crédito** (#f97316) - Cartão de crédito, empréstimos
11. **Utilities** (#6366f1) - Água, luz, internet
12. **Outros** (#64748b) - Despesas diversas

### Modificar Dados Mock

Edite o arquivo `src/data/mockData.json` diretamente. Os dados são consumidos pela função `fetchMock()` em `src/utils/mockApi.js`.

```js
import { fetchMock } from '../utils/mockApi';

const response = await fetchMock('/api/expenses');
console.log(response.data); // Array de despesas
```

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

## 🔮 Próximos Passos (Sugestões)

- [ ] Migrar para TypeScript
- [ ] Integrar com API backend real (Supabase, Firebase, ou REST)
- [ ] Adicionar autenticação (NextAuth, Clerk)
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