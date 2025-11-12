# Estrutura Completa do Projeto

## Arquivos Raiz

```
financeiro-saas/
├── package.json              # Dependências e scripts
├── vite.config.js           # Configuração do Vite
├── tailwind.config.js       # Configuração do Tailwind
├── postcss.config.js        # Configuração do PostCSS
├── index.html               # HTML principal
├── .gitignore               # Arquivos ignorados pelo Git
├── README.md                # Documentação principal
├── QUICK_START.md           # Guia de início rápido
├── INSTRUÇÕES.md            # Instruções detalhadas
├── COMPONENTES.md           # Referência de componentes
└── ESTRUTURA_PROJETO.md     # Este arquivo
```

## Diretório src/

### 📁 src/ (raiz)
```
src/
├── main.jsx                 # Entry point da aplicação
├── App.jsx                  # Componente App principal
└── styles/
    └── index.css            # Estilos globais + Tailwind
```

### 📁 src/components/ (Componentes)

#### Componentes Atômicos
```
src/components/
├── Avatar.jsx               # Avatar do usuário
├── Badge.jsx                # Tags/etiquetas
├── Button.jsx               # Botões reutilizáveis
├── Button.stories.jsx       # Storybook stories do Button
├── Card.jsx                 # Container card
├── Input.jsx                # Campo de entrada
├── Modal.jsx                # Diálogo modal
├── ProgressBar.jsx          # Barra de progresso
├── Spinner.jsx              # Indicador de loading
└── Table.jsx                # Tabela com ordenação
```

#### Layout
```
src/components/
├── Layout.jsx               # Layout principal
├── Sidebar.jsx              # Menu lateral
├── Topbar.jsx               # Barra superior
└── BalanceCard.jsx          # Card de saldo
```

#### Gráficos
```
src/components/charts/
├── DoughnutChart.jsx        # Gráfico de rosca
├── LineChart.jsx            # Gráfico de linha
└── MultiLineChart.jsx       # Múltiplas linhas
```

### 📁 src/pages/ (Páginas)
```
src/pages/
├── Dashboard.jsx            # Página inicial
├── Investimentos.jsx        # Gestão de investimentos
├── Metas.jsx                # CRUD de metas
├── Comparador.jsx           # Comparador de ativos
└── Perfil.jsx               # Perfil do usuário
```

### 📁 src/data/ (Dados Mock)
```
src/data/
└── mockData.json            # Dados mock completos
```

### 📁 src/utils/ (Utilitários)
```
src/utils/
└── mockApi.js               # Funções mock API + formatação
```

### 📁 src/routes/ (Rotas)
```
src/routes/
└── index.jsx                # Configuração React Router
```

## Total de Arquivos Criados

### Componentes: 17 arquivos
- 10 componentes atômicos
- 4 componentes de layout/negócio
- 3 componentes de gráficos

### Páginas: 5 arquivos
- Dashboard
- Investimentos
- Metas
- Comparador
- Perfil

### Configuração: 8 arquivos
- package.json
- vite.config.js
- tailwind.config.js
- postcss.config.js
- index.html
- .gitignore
- main.jsx
- App.jsx

### Documentação: 5 arquivos
- README.md
- QUICK_START.md
- INSTRUÇÕES.md
- COMPONENTES.md
- ESTRUTURA_PROJETO.md

### Dados e Utils: 3 arquivos
- mockData.json
- mockApi.js
- routes/index.jsx

### Estilos: 1 arquivo
- styles/index.css

## **TOTAL: 39 arquivos**

## Tamanho Aproximado

- **Código fonte**: ~3.500 linhas
- **Componentes React**: 22 arquivos
- **Documentação**: ~2.000 linhas
- **Dados mock**: JSON completo

## Dependências Principais

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "recharts": "^2.10.3",
  "lucide-react": "^0.294.0",
  "tailwindcss": "^3.3.6",
  "vite": "^5.0.8"
}
```

## Navegação entre Arquivos

### Para entender um componente:
1. Veja o arquivo do componente em `src/components/`
2. Consulte `COMPONENTES.md` para referência de props
3. Veja exemplo de uso nas páginas em `src/pages/`

### Para modificar uma página:
1. Edite o arquivo em `src/pages/`
2. Modifique dados em `src/data/mockData.json`
3. Use componentes de `src/components/`

### Para adicionar funcionalidade:
1. Crie componente em `src/components/`
2. Adicione página em `src/pages/` (se necessário)
3. Configure rota em `src/routes/index.jsx`
4. Adicione item no menu em `src/components/Sidebar.jsx`

## Fluxo de Dados

```
mockData.json
    ↓
mockApi.js (fetchMock)
    ↓
Páginas (Dashboard, etc.)
    ↓
Componentes (Card, Table, etc.)
    ↓
UI renderizada
```

## Próximos Arquivos a Criar (Sugestões)

### Testes
```
src/__tests__/
├── Button.test.jsx
├── Card.test.jsx
└── Dashboard.test.jsx
```

### Hooks Customizados
```
src/hooks/
├── useAuth.js
├── useFetch.js
└── useLocalStorage.js
```

### Context API
```
src/context/
├── AuthContext.jsx
├── ThemeContext.jsx
└── DataContext.jsx
```

### Services (API real)
```
src/services/
├── api.js
├── auth.js
└── expenses.js
```

### Tipos TypeScript
```
src/types/
├── index.ts
├── user.ts
└── transaction.ts
```

## Arquivos Gerados no Build

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [outros assets]
```

## Comandos Úteis para Navegação

### Buscar por termo em todos os arquivos:
```bash
grep -r "termo" src/
```

### Contar linhas de código:
```bash
find src -name "*.jsx" | xargs wc -l
```

### Listar todos os componentes:
```bash
ls src/components/*.jsx
```

### Ver estrutura de pastas:
```bash
ls -R src/
```

## Observações Importantes

1. **Todos os componentes** têm comentários JSDoc
2. **Todas as páginas** consomem dados via `fetchMock()`
3. **Responsividade** em todos os componentes
4. **Acessibilidade** seguindo WCAG AA
5. **Mobile-first** com Tailwind breakpoints

---

**Projeto completo e pronto para uso!** 🎉

Veja QUICK_START.md para começar em 3 minutos.
