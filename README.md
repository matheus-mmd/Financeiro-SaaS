# Financeiro SaaS - Controle Financeiro Pessoal/Familiar

SaaS completo de controle financeiro desenvolvido com React, Vite, Tailwind CSS e Recharts. Interface moderna, responsiva e acessível para gerenciar finanças pessoais e familiares.

## Funcionalidades

### Dashboard
- Resumo mensal de receitas, despesas e saldo
- Gráfico de rosca (donut) para despesas por categoria
- Gráfico de linha para evolução do saldo
- Tabela de transações com ordenação e paginação
- Preview de metas em andamento

### Transações
- Visualização completa de todas as transações (créditos e débitos)
- Cards com estatísticas: Total de Créditos, Total de Débitos e Saldo
- Filtros por tipo de transação (Todas, Créditos, Débitos)
- Formulário para adicionar novas transações
- Tabela com todas as transações ordenáveis por data, descrição e valor
- Interface preparada para exportação de dados

### Despesas
- Gerenciamento detalhado de despesas por categoria
- 12 categorias predefinidas com cores distintas
- Gráfico de pizza mostrando distribuição por categoria
- Listagem de despesas com porcentagens por categoria
- Filtros por categoria
- CRUD completo (Criar, Editar, Excluir despesas)
- Modal para visualizar todas as categorias disponíveis
- Cards com estatísticas: Total de Despesas, Total de Itens e Categorias Ativas

### Investimentos
- Lista de ativos com valores e rendimentos
- Modal de detalhes com histórico de evolução
- Gráficos de performance individual
- Comparação com indicadores de referência (CDI)

### Metas
- CRUD completo de metas financeiras
- Barra de progresso visual
- Separação entre metas concluídas e em andamento
- Estatísticas de metas

### Comparador de Ativos
- Seleção de 2 ativos para comparação
- Gráfico comparativo de desempenho
- Métricas: retorno acumulado, volatilidade, drawdown
- Análise resumida automática

### Perfil
- Informações do usuário e conta familiar
- Resumo patrimonial completo
- Distribuição de ativos com gráficos
- Configuração de perfil de risco
- Dados de receita mensal

## Stack Tecnológica

- **React 18** - Biblioteca UI
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **React Router v6** - Roteamento
- **Recharts** - Biblioteca de gráficos
- **Lucide React** - Ícones
- **TypeScript** - (opcional, preparado para migração)

## Estrutura do Projeto

```
financeiro-saas/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Avatar.jsx
│   │   ├── Badge.jsx
│   │   ├── BalanceCard.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Layout.jsx
│   │   ├── Modal.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Spinner.jsx
│   │   ├── Table.jsx
│   │   ├── Topbar.jsx
│   │   └── charts/          # Componentes de gráficos
│   │       ├── DoughnutChart.jsx
│   │       ├── LineChart.jsx
│   │       └── MultiLineChart.jsx
│   ├── pages/               # Páginas da aplicação
│   │   ├── Dashboard.jsx
│   │   ├── Transacoes.jsx
│   │   ├── Despesas.jsx
│   │   ├── Investimentos.jsx
│   │   ├── Metas.jsx
│   │   ├── Comparador.jsx
│   │   └── Perfil.jsx
│   ├── data/                # Dados mock
│   │   └── mockData.json
│   ├── utils/               # Utilitários
│   │   └── mockApi.js
│   ├── routes/              # Configuração de rotas
│   │   └── index.jsx
│   ├── styles/              # Estilos globais
│   │   └── index.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Design System

### Tokens de Cores

```css
--brand-500: #0ea5a4  /* Cor primária */
--brand-600: #0d8f8e  /* Hover primário */
--brand-700: #0f766e  /* Ativo primário */
--muted: #6b7280      /* Texto secundário */
--bg: #f8fafc         /* Background da aplicação */
```

### Componentes Atômicos

#### Button
Variantes: `primary`, `secondary`, `ghost`, `danger`
Tamanhos: `sm`, `md`, `lg`

```jsx
<Button variant="primary" size="md">Clique aqui</Button>
```

#### Input
Campo de entrada com label, validação e erro

```jsx
<Input label="Email" type="email" required error="Email inválido" />
```

#### Card
Container com sombra e border radius

```jsx
<Card hover onClick={handleClick}>Conteúdo</Card>
```

#### Badge
Tags para status e categorias

```jsx
<Badge variant="success">Ativo</Badge>
```

#### Modal
Diálogo modal acessível

```jsx
<Modal isOpen={open} onClose={close} title="Título">Conteúdo</Modal>
```

#### Table
Tabela com ordenação e paginação

```jsx
<Table columns={columns} data={data} pageSize={10} />
```

### Responsividade

Breakpoints Tailwind:
- `sm`: ≥640px
- `md`: ≥768px
- `lg`: ≥1024px
- `xl`: ≥1280px

Layout mobile-first com sidebar colapsável e cards empilhados.

## Instalação e Execução

### Pré-requisitos

- Node.js 16+ e npm/yarn

### Passos

1. **Instalar dependências**

```bash
cd financeiro-saas
npm install
```

2. **Iniciar servidor de desenvolvimento**

```bash
npm run dev
```

Acesse: `http://localhost:5173`

### Rotas Disponíveis

- `/` - Dashboard (página inicial)
- `/transacoes` - Gerenciamento de transações
- `/despesas` - Gerenciamento de despesas
- `/investimentos` - Portfolio de investimentos
- `/metas` - Metas financeiras
- `/comparador` - Comparador de ativos
- `/perfil` - Perfil do usuário

3. **Build para produção**

```bash
npm run build
```

4. **Preview do build**

```bash
npm run preview
```

## Dados Mock

Os dados mock estão em `src/data/mockData.json` e incluem:

- **user**: Informações do usuário (nome, parceiro, moeda)
- **summary**: Resumo financeiro mensal
- **expenses**: Lista de despesas categorizadas
- **assets**: Ativos/investimentos
- **targets**: Metas financeiras
- **transactions**: Histórico de transações
- **comparison_sample**: Dados para comparação de ativos

### Categorias de Despesas

O sistema inclui 12 categorias predefinidas com cores distintas:

- **Moradia** - Aluguel, financiamento, condomínio
- **Transporte** - Combustível, transporte público, manutenção
- **Alimentação** - Supermercado, restaurantes
- **Saúde** - Plano de saúde, medicamentos, consultas
- **Educação** - Cursos, livros, material escolar
- **Lazer** - Cinema, passeios, hobbies
- **Assinaturas** - Streaming, software, serviços
- **Família** - Ajuda familiar, presentes
- **Poupança** - Investimentos mensais
- **Crédito** - Cartão de crédito, empréstimos
- **Utilities** - Água, luz, internet, telefone
- **Outros** - Despesas diversas

### Modificar Dados Mock

Edite o arquivo `src/data/mockData.json` diretamente. Os dados são consumidos pela função `fetchMock()` em `src/utils/mockApi.js`.

```js
import { fetchMock } from '../utils/mockApi';

const response = await fetchMock('/api/expenses');
console.log(response.data); // Array de despesas
```

## Funções Utilitárias

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

## Acessibilidade

- Semantic HTML em todos os componentes
- Atributos ARIA onde necessário (`aria-label`, `aria-current`, `role`)
- Navegação por teclado (Tab, Enter, Esc)
- Contraste WCAG AA
- Focus visível em elementos interativos

## Customização

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

1. Crie o componente em `src/pages/MinhaPage.jsx`
2. Adicione a rota em `src/routes/index.jsx`:

```jsx
{
  path: 'minha-pagina',
  element: <MinhaPage />,
}
```

3. Adicione o item no menu em `src/components/Sidebar.jsx`

### Integrar com Backend Real

Substitua `fetchMock()` por chamadas reais:

```js
// Antes
const response = await fetchMock('/api/expenses');

// Depois
const response = await fetch('https://api.exemplo.com/expenses');
const data = await response.json();
```

## Funcionalidades Implementadas

- [x] Dashboard com resumo financeiro e gráficos
- [x] Gerenciamento completo de Transações (CRUD)
- [x] Gerenciamento completo de Despesas por categoria (CRUD)
- [x] Sistema de Metas financeiras (CRUD)
- [x] Portfolio de Investimentos
- [x] Comparador de Ativos
- [x] Perfil do usuário
- [x] Filtros por categoria nas Despesas
- [x] Filtros por tipo nas Transações
- [x] Gráficos interativos com Recharts
- [x] Sistema de categorias com cores

## Próximos Passos (Sugestões)

- [ ] Integrar com API backend real
- [ ] Adicionar autenticação (JWT, OAuth)
- [ ] Implementar filtros avançados de data (data range picker)
- [ ] Exportar dados (PDF, CSV, Excel) - UI já preparada
- [ ] Notificações e alertas de metas
- [ ] Adicionar funcionalidade de busca nas transações
- [ ] Criar relatórios mensais e anuais
- [ ] Gráficos de tendência de gastos
- [ ] Dark mode
- [ ] Internacionalização (i18n)
- [ ] Testes (Jest, Testing Library)
- [ ] PWA (service workers, offline)
- [ ] Animações com Framer Motion

## Storybook (Opcional)

Para adicionar Storybook:

```bash
npx storybook@latest init
```

Exemplo de story para Button:

```jsx
// src/components/Button.stories.jsx
export default {
  title: 'Components/Button',
  component: Button,
};

export const Primary = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
};
```

## Comandos Úteis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run preview      # Preview do build
npm run lint         # (se configurado) Lint do código
```

## Troubleshooting

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

### Erro de CORS ao integrar com API

Configure o proxy no `vite.config.js`:

```js
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
```

## Licença

Este projeto é de uso livre para fins educacionais e comerciais.

## Contato e Suporte

Para dúvidas e sugestões, abra uma issue no repositório do projeto.

---

**Desenvolvido com React + Vite + Tailwind CSS**
