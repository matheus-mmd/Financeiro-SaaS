# Configuração do Supabase

Este projeto usa **dados reais do Supabase** para autenticação e gerenciamento de dados financeiros.

## 📋 Pré-requisitos

1. Conta no Supabase (gratuita): https://supabase.com
2. Projeto criado no Supabase

## 🔧 Configuração Local

### 1. Obter Credenciais do Supabase

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá em: **Settings → API**
4. Copie as seguintes informações:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** (em "Project API keys") → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (em "Project API keys") → `SUPABASE_SERVICE_ROLE_KEY` ⚠️

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

⚠️ **IMPORTANTE**:
- Nunca commite o arquivo `.env.local`
- A chave `service_role` é **secreta** e só deve ser usada no servidor
- Use apenas a chave `anon` no frontend

### 3. Executar o Projeto

```bash
npm install
npm run dev
```

## 🚀 Deploy no Vercel

### 1. Configurar Variáveis de Ambiente

Acesse: https://vercel.com/seu-usuario/seu-projeto/settings/environment-variables

Adicione as 3 variáveis para todos os ambientes (Production, Preview, Development).

### 2. Re-deploy

Após adicionar as variáveis, o Vercel fará re-deploy automaticamente.

## 🔐 Autenticação

### Funcionalidades Implementadas

- ✅ Login com email e senha
- ✅ Cadastro de novos usuários
- ✅ Logout
- ✅ Persistência de sessão
- ✅ Sincronização entre abas
- ✅ Tradução de erros para português

### Uso no Código

```javascript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, profile, loading, signIn, signUp, signOut } = useAuth();

  if (loading) return <div>Carregando...</div>;
  if (!user) return <div>Não autenticado</div>;

  return <div>Olá, {profile.name}!</div>;
}
```

## 🧪 Testando

1. Configure as variáveis de ambiente
2. Inicie: `npm run dev`
3. Acesse: http://localhost:3000/login
4. Crie uma conta ou faça login

## 📚 Documentação

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)