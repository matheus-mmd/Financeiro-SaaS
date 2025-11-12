# Instruções de Uso - Financeiro SaaS

## Início Rápido

### 1. Instalação

```bash
cd financeiro-saas
npm install
```

### 2. Executar em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:5173

### 3. Build para produção

```bash
npm run build
npm run preview
```

## Estrutura de Arquivos Importantes

### Dados Mock
- **Localização**: `src/data/mockData.json`
- **Como modificar**: Edite o JSON diretamente com novos valores
- **Como adicionar novos endpoints**: Edite `src/utils/mockApi.js`

### Componentes
- **Atômicos**: `src/components/` (Button, Input, Card, etc.)
- **Gráficos**: `src/components/charts/`
- **Layout**: `src/components/Layout.jsx`, `Sidebar.jsx`, `Topbar.jsx`

### Páginas
- `src/pages/Dashboard.jsx` - Página inicial com resumo
- `src/pages/Investimentos.jsx` - Lista de ativos
- `src/pages/Metas.jsx` - CRUD de metas
- `src/pages/Comparador.jsx` - Comparação de ativos
- `src/pages/Perfil.jsx` - Dados do usuário

### Rotas
- **Configuração**: `src/routes/index.jsx`
- **Como adicionar**: Adicione novo objeto no array de rotas

## Exemplos de Uso

### Adicionar Nova Despesa aos Dados Mock

Edite `src/data/mockData.json`:

```json
{
  "expenses": [
    {
      "id": 12,
      "category": "Alimentação",
      "title": "Supermercado",
      "amount": 450.00,
      "date": "2025-11-15"
    }
  ]
}
```

### Criar Novo Componente

1. Crie o arquivo em `src/components/MeuComponente.jsx`

```jsx
import React from 'react';

export default function MeuComponente({ texto }) {
  return <div className="p-4 bg-white rounded-lg">{texto}</div>;
}
```

2. Use em qualquer página:

```jsx
import MeuComponente from '../components/MeuComponente';

<MeuComponente texto="Olá!" />
```

### Adicionar Nova Rota

1. Crie a página em `src/pages/NovaPage.jsx`

2. Adicione em `src/routes/index.jsx`:

```jsx
{
  path: 'nova-pagina',
  element: <NovaPage />,
}
```

3. Adicione link no menu em `src/components/Sidebar.jsx`:

```jsx
const menuItems = [
  // ... existentes
  { path: '/nova-pagina', icon: Star, label: 'Nova Página' },
];
```

## Personalização

### Trocar Cores Principais

Edite `tailwind.config.js`:

```js
colors: {
  brand: {
    500: '#0ea5a4', // Sua cor aqui
    600: '#0d8f8e',
    700: '#0f766e',
  }
}
```

### Adicionar Novo Tipo de Gráfico

Use Recharts. Exemplo de gráfico de barras:

```jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

<BarChart width={600} height={300} data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Bar dataKey="value" fill="#0ea5a4" />
</BarChart>
```

## Integração com Backend Real

### Substituir Mock API

Em vez de usar `fetchMock()`, faça chamadas reais:

```jsx
// Antes (mock)
const response = await fetchMock('/api/expenses');
const expenses = response.data;

// Depois (API real)
const response = await fetch('https://sua-api.com/api/expenses', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const expenses = await response.json();
```

### Adicionar Autenticação

1. Instale biblioteca de auth (ex: `npm install @auth0/auth0-react`)

2. Envolva o App com provider:

```jsx
import { Auth0Provider } from '@auth0/auth0-react';

<Auth0Provider
  domain="seu-domain.auth0.com"
  clientId="seu-client-id"
  redirectUri={window.location.origin}
>
  <App />
</Auth0Provider>
```

## Exportar Dados

### Para CSV

```jsx
const exportToCSV = (data, filename) => {
  const csv = data.map(row => Object.values(row).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
};

// Uso
<Button onClick={() => exportToCSV(expenses, 'despesas.csv')}>
  Exportar CSV
</Button>
```

## Testes

### Instalar Jest e Testing Library

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

### Exemplo de teste

```jsx
import { render, screen } from '@testing-library/react';
import Button from './Button';

test('renderiza botão com texto', () => {
  render(<Button>Clique</Button>);
  expect(screen.getByText('Clique')).toBeInTheDocument();
});
```

## Storybook

### Instalar

```bash
npx storybook@latest init
```

### Executar

```bash
npm run storybook
```

### Criar Story

Veja exemplo em `src/components/Button.stories.jsx`

## Troubleshooting Comum

### Problema: Página em branco

**Solução**: Verifique o console do navegador (F12) para erros. Geralmente é import faltando.

### Problema: Estilos não aplicados

**Solução**:
1. Verifique se `src/styles/index.css` está importado em `main.jsx`
2. Reinicie o servidor de desenvolvimento

### Problema: Gráficos não aparecem

**Solução**: Certifique-se de que Recharts está instalado:

```bash
npm install recharts
```

## Deploy

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Arraste a pasta dist/ para netlify.com
```

### GitHub Pages

```bash
# Edite vite.config.js
export default defineConfig({
  base: '/nome-do-repo/',
  // ...
})

npm run build
# Faça deploy da pasta dist/
```

## Recursos Úteis

- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)
- [React Router](https://reactrouter.com)
- [Lucide Icons](https://lucide.dev)

## Próximas Features Sugeridas

1. **Filtros Avançados**: Data range picker, filtro por categoria
2. **Exportação**: PDF, Excel, CSV
3. **Notificações**: Push notifications para metas próximas
4. **Dark Mode**: Tema escuro
5. **PWA**: App instalável, offline-first
6. **Relatórios**: Relatórios mensais automatizados
7. **Categorias Customizadas**: Usuário define categorias
8. **Multi-moeda**: Suporte a USD, EUR, etc.

## Contato

Para dúvidas específicas sobre implementação, consulte:
- README.md (visão geral)
- Comentários no código
- Documentação inline (JSDoc)

---

**Bom desenvolvimento!** 🚀
