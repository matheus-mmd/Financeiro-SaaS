# Troubleshooting - Erros Comuns

Este documento lista erros comuns durante o desenvolvimento e como resolvê-los.

## 🔴 Erros de React/DOM

### Erro: "Failed to execute 'removeChild' on 'Node'"

```
NotFoundError: Failed to execute 'removeChild' on 'Node':
The node to be removed is not a child of this node.
```

**Causa:**
Extensões do navegador estão modificando o DOM, causando conflito com o React.

**Indicador:**
Você também viu este aviso antes:
```
Warning: Extra attributes from the server: cz-shortcut-listen
```

**Soluções:**

#### Opção 1: Modo Anônimo (Teste Rápido)
1. Abra o navegador em **modo anônimo/privado**
2. Acesse `http://localhost:3000`
3. Se funcionar, o problema é uma extensão

#### Opção 2: Desabilitar Extensões Específicas

Extensões conhecidas que causam este problema:
- **ColorZilla** (cz-shortcut-listen) ⚠️ Provável culpado
- Grammarly
- LastPass / 1Password
- Notion Web Clipper
- Google Translate
- Honey
- AdBlock/uBlock

**Como resolver:**
1. Clique com botão direito no ícone da extensão
2. Vá em "Gerenciar extensão"
3. Adicione `localhost` ou `127.0.0.1` às exceções
4. Ou desabilite a extensão durante o desenvolvimento

#### Opção 3: Usar Outro Navegador
Teste em outro navegador sem extensões instaladas.

#### Opção 4: Ignorar (se não impactar funcionalidade)
Se a aplicação funciona normalmente apesar do erro, você pode ignorá-lo durante o desenvolvimento.

---

## 🔐 Erros de Autenticação

### Erro: "Invalid login credentials"

```javascript
AuthApiError: Invalid login credentials
```

**Causas Possíveis:**
1. Email ou senha incorretos
2. Usuário não existe no Supabase Auth
3. Email/senha com espaços extras

**Soluções:**

1. **Verificar se usuário existe:**
```sql
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'seu-email@exemplo.com';
```

2. **Criar novo usuário:**
```bash
node scripts/create-test-user.js
```

3. **Resetar senha via Dashboard:**
   - Authentication → Users → Buscar usuário → Reset Password

### Erro: "Email not confirmed"

```javascript
AuthApiError: Email not confirmed
```

**Causa:**
Confirmação de email está habilitada, mas o usuário não confirmou.

**Soluções:**

1. **Desabilitar confirmação (Desenvolvimento):**
   - Supabase Dashboard → Authentication → Providers → Email
   - Desmarque "Confirm email"
   - Save

2. **Confirmar email manualmente:**
```sql
UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'seu-email@exemplo.com';
```

3. **Auto-confirmar novos usuários:**
   - Supabase Dashboard → Authentication → Providers → Email
   - Marque "Auto confirm users"
   - Save

### Erro: 401 Unauthorized ao buscar dados

```
Failed to load resource: the server responded with a status of 401
```

**Causas Possíveis:**
1. Usuário não está autenticado
2. Token JWT expirado
3. Usuário não tem registro na tabela `users`
4. RLS bloqueando acesso

**Soluções:**

1. **Verificar se está logado:**
```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session); // Deve retornar dados do usuário
```

2. **Verificar se usuário existe na tabela users:**
```sql
-- Buscar usuário no Auth
SELECT id, email FROM auth.users WHERE email = 'seu-email@exemplo.com';

-- Verificar se existe na tabela users
SELECT * FROM public.users WHERE email = 'seu-email@exemplo.com';

-- Se não existir, criar:
INSERT INTO public.users (id, email, name)
SELECT id, email, raw_user_meta_data->>'name'
FROM auth.users
WHERE email = 'seu-email@exemplo.com';
```

3. **Fazer login novamente:**
   - Limpe cookies/localStorage
   - Faça logout e login novamente

---

## 🗄️ Erros de Banco de Dados

### Erro: "relation does not exist"

```
error: relation "public.transactions" does not exist
```

**Causa:**
Schema SQL não foi executado no Supabase.

**Solução:**
```bash
# Execute o schema
# Copie database/schema.sql e execute no Supabase SQL Editor
```

### Erro: RLS Policy Violation

```
error: new row violates row-level security policy
```

**Causa:**
RLS está bloqueando a operação.

**Soluções:**

1. **Verificar se está autenticado:**
```javascript
const { data: { user } } = await supabase.auth.getUser();
console.log('User ID:', user?.id);
```

2. **Verificar políticas RLS:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'transactions';
```

3. **Desabilitar RLS temporariamente (Desenvolvimento):**
```sql
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
-- ⚠️ NÃO FAZER EM PRODUÇÃO!
```

### Erro: "duplicate key value violates unique constraint"

```
error: duplicate key value violates unique constraint "users_email_key"
```

**Causa:**
Tentando inserir registro duplicado.

**Solução:**
Use `UPSERT` em vez de `INSERT`:
```javascript
const { data, error } = await supabase
  .from('users')
  .upsert([{ id: userId, email: email, name: name }])
  .select();
```

---

## 🚀 Erros de Build/Compilação

### Erro: "Module not found"

```
Module not found: Can't resolve '@/lib/supabase'
```

**Causa:**
Caminho de import incorreto ou arquivo não existe.

**Soluções:**

1. **Verificar se arquivo existe:**
```bash
ls src/lib/supabase.js
```

2. **Verificar alias @ no jsconfig.json/tsconfig.json:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

3. **Usar caminho relativo:**
```javascript
// Em vez de
import { supabase } from '@/lib/supabase';

// Use
import { supabase } from '../lib/supabase';
```

### Erro: "process is not defined"

```
ReferenceError: process is not defined
```

**Causa:**
Tentando acessar `process.env` no código do cliente sem `NEXT_PUBLIC_` prefix.

**Solução:**
```javascript
// ❌ Errado (só funciona no servidor)
const apiKey = process.env.API_KEY;

// ✅ Correto (funciona no cliente)
const apiKey = process.env.NEXT_PUBLIC_API_KEY;
```

---

## 🔧 Erros de Configuração

### Erro: "Variáveis de ambiente do Supabase não configuradas"

```
Error: Variáveis de ambiente do Supabase não configuradas
```

**Causa:**
Arquivo `.env.local` não existe ou está incompleto.

**Solução:**

1. **Verificar se .env.local existe:**
```bash
cat .env.local
```

2. **Criar/atualizar .env.local:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

3. **Reiniciar servidor:**
```bash
# Parar servidor (Ctrl+C)
npm run dev
```

---

## 📊 Comandos Úteis de Debug

### Verificar Conexão com Supabase
```javascript
// No console do navegador (F12)
const { data, error } = await supabase.from('icons').select('*');
console.log('Icons:', data, 'Error:', error);
```

### Verificar Usuário Atual
```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
```

### Limpar Cache e Storage
```javascript
// No console do navegador
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Ver Logs do Supabase
```javascript
// Habilitar logs detalhados
localStorage.setItem('supabase.debug', 'true');
location.reload();
```

---

## 🆘 Ainda com Problemas?

### Checklist Geral
- [ ] Schema SQL executado no Supabase?
- [ ] Variáveis de ambiente configuradas?
- [ ] Usuário criado e autenticado?
- [ ] RLS habilitado e políticas corretas?
- [ ] Servidor de desenvolvimento rodando?
- [ ] Console do navegador sem erros críticos?

### Informações para Debug
Ao reportar um problema, inclua:
1. Mensagem de erro completa
2. Browser console (F12) → Console tab
3. Network tab → Filtrar por "supabase"
4. Código relevante onde o erro ocorre

### Recursos
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)

---

**Última atualização:** 2025-12-09
