# Documentação de Componentes

Referência completa de todos os componentes disponíveis no projeto.

## Componentes Atômicos

### Button

Botão reutilizável com múltiplas variantes e tamanhos.

**Props:**
- `variant`: 'primary' | 'secondary' | 'ghost' | 'danger' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `disabled`: boolean (default: false)
- `onClick`: function
- `className`: string (classes adicionais)

**Exemplo:**
```jsx
import Button from './components/Button';

<Button variant="primary" size="md" onClick={() => alert('Clicado!')}>
  Confirmar
</Button>
```

---

### Input

Campo de entrada com label, validação e mensagem de erro.

**Props:**
- `label`: string
- `type`: string (default: 'text')
- `placeholder`: string
- `error`: string (mensagem de erro)
- `required`: boolean (default: false)
- `className`: string

**Exemplo:**
```jsx
import Input from './components/Input';

<Input
  label="Email"
  type="email"
  placeholder="seu@email.com"
  required
  error={emailError}
  onChange={(e) => setEmail(e.target.value)}
/>
```

---

### Card

Container com sombra e border radius. Pode ter efeito hover e ser clicável.

**Props:**
- `children`: ReactNode
- `className`: string
- `hover`: boolean (efeito hover, default: false)
- `onClick`: function (torna o card clicável)

**Exemplo:**
```jsx
import Card from './components/Card';

<Card hover onClick={() => navigate('/detalhes')}>
  <h3>Título do Card</h3>
  <p>Conteúdo aqui</p>
</Card>
```

---

### Badge

Etiqueta/tag para mostrar status, categorias ou informações curtas.

**Props:**
- `variant`: 'success' | 'warning' | 'error' | 'info' | 'default' (default: 'default')
- `children`: ReactNode
- `className`: string

**Exemplo:**
```jsx
import Badge from './components/Badge';

<Badge variant="success">Ativo</Badge>
<Badge variant="error">Vencido</Badge>
<Badge variant="info">Pendente</Badge>
```

---

### Avatar

Exibe foto do usuário ou iniciais geradas automaticamente.

**Props:**
- `src`: string (URL da imagem)
- `alt`: string
- `name`: string (para gerar iniciais)
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `className`: string

**Exemplo:**
```jsx
import Avatar from './components/Avatar';

<Avatar name="Matheus Menezes" size="lg" />
<Avatar src="/foto.jpg" alt="Usuário" size="md" />
```

---

### Spinner

Indicador de carregamento (loading).

**Props:**
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `color`: 'brand' | 'white' | 'gray' (default: 'brand')
- `className`: string

**Exemplo:**
```jsx
import Spinner from './components/Spinner';

{loading && <Spinner size="lg" />}
```

---

### Modal

Diálogo modal acessível com overlay e animações.

**Props:**
- `isOpen`: boolean
- `onClose`: function
- `title`: string
- `children`: ReactNode
- `footer`: ReactNode (botões customizados)
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')

**Exemplo:**
```jsx
import Modal from './components/Modal';
import Button from './components/Button';

<Modal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  title="Confirmar Ação"
  footer={
    <>
      <Button variant="secondary" onClick={() => setModalOpen(false)}>
        Cancelar
      </Button>
      <Button variant="primary" onClick={handleConfirm}>
        Confirmar
      </Button>
    </>
  }
>
  <p>Tem certeza que deseja continuar?</p>
</Modal>
```

---

### Table

Tabela com ordenação, paginação e customização de colunas.

**Props:**
- `columns`: Array de objetos [{ key, label, sortable, render }]
- `data`: Array de objetos
- `pageSize`: number (default: 10)

**Exemplo:**
```jsx
import Table from './components/Table';
import Badge from './components/Badge';

const columns = [
  { key: 'name', label: 'Nome', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  {
    key: 'status',
    label: 'Status',
    render: (row) => <Badge variant="success">{row.status}</Badge>
  },
];

<Table columns={columns} data={users} pageSize={10} />
```

---

### ProgressBar

Barra de progresso para metas e percentuais.

**Props:**
- `progress`: number (valor atual)
- `goal`: number (valor objetivo)
- `variant`: 'brand' | 'success' | 'warning' (default: 'brand')
- `showPercentage`: boolean (default: true)

**Exemplo:**
```jsx
import ProgressBar from './components/ProgressBar';

<ProgressBar progress={7500} goal={10000} variant="brand" />
```

---

## Componentes de Negócio

### BalanceCard

Card especializado para exibir valores monetários.

**Props:**
- `title`: string
- `amount`: number
- `trend`: 'up' | 'down' (opcional)
- `subtitle`: string (opcional)
- `icon`: LucideIcon (opcional)
- `className`: string

**Exemplo:**
```jsx
import BalanceCard from './components/BalanceCard';
import { Wallet } from 'lucide-react';

<BalanceCard
  title="Saldo Disponível"
  amount={18252.00}
  trend="up"
  icon={Wallet}
/>
```

---

## Componentes de Gráfico

### DoughnutChart

Gráfico de rosca para visualizar distribuição por categorias.

**Props:**
- `data`: Array [{ name, value }]

**Exemplo:**
```jsx
import DoughnutChart from './components/charts/DoughnutChart';

const data = [
  { name: 'Moradia', value: 2355 },
  { name: 'Alimentação', value: 1200 },
  { name: 'Transporte', value: 450 },
];

<DoughnutChart data={data} />
```

---

### LineChart

Gráfico de linha para evolução temporal.

**Props:**
- `data`: Array [{ date, value }]
- `dataKey`: string (default: 'value')
- `color`: string (cor hex, default: '#0ea5a4')

**Exemplo:**
```jsx
import LineChart from './components/charts/LineChart';

const data = [
  { date: 'Jan', value: 15000 },
  { date: 'Fev', value: 16200 },
  { date: 'Mar', value: 17500 },
];

<LineChart data={data} color="#0ea5a4" />
```

---

### MultiLineChart

Gráfico com múltiplas linhas para comparação.

**Props:**
- `data`: Array com múltiplos dataKeys
- `lines`: Array [{ dataKey, color, name }]

**Exemplo:**
```jsx
import MultiLineChart from './components/charts/MultiLineChart';

const data = [
  { date: 'Jan', ativo1: 100, ativo2: 200 },
  { date: 'Fev', ativo1: 105, ativo2: 202 },
];

const lines = [
  { dataKey: 'ativo1', color: '#0ea5a4', name: 'Ação X' },
  { dataKey: 'ativo2', color: '#8b5cf6', name: 'FII Y' },
];

<MultiLineChart data={data} lines={lines} />
```

---

## Layout

### Layout

Componente principal que envolve todas as páginas. Inclui Sidebar e Topbar.

**Uso:**
```jsx
// Já configurado em routes/index.jsx
import Layout from './components/Layout';

<Layout>
  <Outlet /> {/* Páginas renderizadas aqui */}
</Layout>
```

---

### Sidebar

Menu lateral de navegação com suporte mobile (colapsável).

**Configuração:**
Edite o array `menuItems` em `src/components/Sidebar.jsx` para adicionar/remover itens.

```jsx
const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/investimentos', icon: TrendingUp, label: 'Investimentos' },
  // ... adicionar mais
];
```

---

### Topbar

Barra superior com informações do usuário e saldo rápido.

**Props:**
- `user`: object { name, partner }
- `balance`: number

---

## Utilitários (utils/mockApi.js)

### fetchMock(endpoint)

Simula chamadas de API retornando dados mock.

**Endpoints disponíveis:**
- `/api/user`
- `/api/summary`
- `/api/expenses`
- `/api/assets`
- `/api/targets`
- `/api/transactions`
- `/api/comparison`

**Exemplo:**
```jsx
const response = await fetchMock('/api/expenses');
const expenses = response.data;
```

---

### formatCurrency(value)

Formata valores em BRL.

**Exemplo:**
```jsx
formatCurrency(1234.56) // "R$ 1.234,56"
```

---

### formatDate(dateString)

Formata datas para pt-BR.

**Exemplo:**
```jsx
formatDate('2025-11-01') // "01/11/2025"
```

---

### calculateProgress(progress, goal)

Calcula porcentagem de progresso.

**Exemplo:**
```jsx
calculateProgress(5000, 10000) // 50
```

---

## Dicas de Uso

### Compor Componentes

```jsx
// Exemplo: Card com Badge e Button
<Card className="p-6">
  <div className="flex justify-between items-start mb-4">
    <div>
      <Badge variant="success">Ativo</Badge>
      <h3 className="text-lg font-semibold mt-2">Título</h3>
    </div>
    <Button variant="ghost" size="sm">
      Editar
    </Button>
  </div>
  <p className="text-gray-600">Descrição aqui...</p>
</Card>
```

### Acessibilidade

Todos os componentes seguem boas práticas:
- Atributos ARIA onde necessário
- Navegação por teclado
- Contraste adequado
- Focus visível

### Responsividade

Use classes Tailwind responsivas:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards aqui */}
</div>
```

---

**Consulte o código-fonte de cada componente para mais detalhes e opções avançadas!**
