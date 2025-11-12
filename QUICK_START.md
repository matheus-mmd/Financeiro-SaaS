# 🚀 Quick Start - Financeiro SaaS

Guia de início rápido para começar a usar o projeto em 3 minutos.

## 1️⃣ Instalar e Executar

```bash
cd financeiro-saas
npm install
npm run dev
```

Abra: **http://localhost:5173**

## 2️⃣ Estrutura do Projeto

```
financeiro-saas/
├── src/
│   ├── components/       # Componentes reutilizáveis
│   ├── pages/           # Páginas (Dashboard, Metas, etc.)
│   ├── data/            # mockData.json
│   ├── utils/           # Funções utilitárias
│   └── routes/          # Configuração de rotas
├── README.md            # Documentação completa
├── INSTRUÇÕES.md        # Guia detalhado
└── COMPONENTES.md       # Referência de componentes
```

## 3️⃣ Páginas Disponíveis

| Rota | Descrição |
|------|-----------|
| `/` | Dashboard com resumo, gráficos e transações |
| `/investimentos` | Lista de ativos e detalhes |
| `/metas` | CRUD de metas financeiras |
| `/comparador` | Comparação de ativos |
| `/perfil` | Dados do usuário e patrimônio |

## 4️⃣ Modificar Dados Mock

Edite: `src/data/mockData.json`

```json
{
  "expenses": [
    {
      "id": 1,
      "category": "Moradia",
      "title": "Aluguel",
      "amount": 1500.00,
      "date": "2025-11-01"
    }
  ]
}
```

## 5️⃣ Componentes Mais Usados

### Button
```jsx
<Button variant="primary" onClick={handleClick}>
  Salvar
</Button>
```

### Card
```jsx
<Card className="p-6">
  <h3>Título</h3>
  <p>Conteúdo</p>
</Card>
```

### Modal
```jsx
<Modal isOpen={open} onClose={close} title="Título">
  Conteúdo do modal
</Modal>
```

### Table
```jsx
<Table columns={columns} data={data} pageSize={10} />
```

## 6️⃣ Usar Gráficos

### Gráfico de Rosca
```jsx
import DoughnutChart from './components/charts/DoughnutChart';

const data = [
  { name: 'Moradia', value: 2355 },
  { name: 'Alimentação', value: 1200 },
];

<DoughnutChart data={data} />
```

### Gráfico de Linha
```jsx
import LineChart from './components/charts/LineChart';

const data = [
  { date: 'Jan', value: 15000 },
  { date: 'Fev', value: 16200 },
];

<LineChart data={data} />
```

## 7️⃣ Adicionar Nova Página

**1. Criar página:**
```jsx
// src/pages/MinhaPage.jsx
export default function MinhaPage() {
  return (
    <div>
      <h1>Minha Nova Página</h1>
    </div>
  );
}
```

**2. Adicionar rota:**
```jsx
// src/routes/index.jsx
{
  path: 'minha-pagina',
  element: <MinhaPage />,
}
```

**3. Adicionar no menu:**
```jsx
// src/components/Sidebar.jsx
{ path: '/minha-pagina', icon: Star, label: 'Minha Página' }
```

## 8️⃣ Personalizar Cores

Edite `tailwind.config.js`:

```js
colors: {
  brand: {
    500: '#0ea5a4',  // Sua cor aqui
    600: '#0d8f8e',
    700: '#0f766e',
  }
}
```

## 9️⃣ Build para Produção

```bash
npm run build
npm run preview
```

Arquivos gerados em: `dist/`

## 🔟 Deploy Rápido

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
Arraste a pasta `dist/` para [netlify.com](https://netlify.com)

## 📚 Documentação Completa

- **README.md** - Visão geral e features
- **INSTRUÇÕES.md** - Guia detalhado de uso
- **COMPONENTES.md** - Referência de todos os componentes

## 🆘 Problemas Comuns

### ❌ Página em branco
- Abra F12 e verifique erros no console
- Verifique imports

### ❌ Gráficos não aparecem
```bash
npm install recharts
```

### ❌ Estilos não funcionam
```bash
# Reinicie o servidor
Ctrl + C
npm run dev
```

## 🎯 Próximos Passos

1. **Explorar as páginas** navegando pelo menu
2. **Modificar dados mock** em `mockData.json`
3. **Customizar cores** no `tailwind.config.js`
4. **Adicionar funcionalidades** criando novos componentes
5. **Integrar com backend** substituindo `fetchMock()`

## 💡 Dicas

- Use `Ctrl + P` no VSCode para buscar arquivos rapidamente
- Todos os componentes têm comentários JSDoc
- Gráficos são baseados em Recharts (veja docs: recharts.org)
- Layout é mobile-first e responsivo

## 🔗 Links Úteis

- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)
- [Lucide Icons](https://lucide.dev)

---

**Pronto para começar!** 🎉

Dúvidas? Consulte README.md ou INSTRUÇÕES.md
