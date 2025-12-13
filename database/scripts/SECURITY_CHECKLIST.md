# 🔐 CHECKLIST DE SEGURANÇA - Supabase

Execute TODOS os itens abaixo para garantir a segurança da aplicação.

## ✅ 1. Habilitar RLS (Row Level Security)

**Prioridade: CRÍTICA**

Execute no SQL Editor:
```bash
database/scripts/fix_rls_security.sql
```

Verifica: Usuários só veem seus próprios dados.

---

## ✅ 2. Corrigir Views SECURITY DEFINER

**Prioridade: CRÍTICA**

Execute no SQL Editor:
```bash
database/scripts/fix_security_definer_views.sql
```

Verifica: Views respeitam RLS do usuário consultando.

---

## ✅ 3. Corrigir Search Path das Funções

**Prioridade: MÉDIA**

Execute no SQL Editor:
```bash
database/scripts/fix_function_security.sql
```

Verifica: Funções têm `search_path = public` explícito.

---

## ✅ 4. Habilitar Proteção contra Senhas Vazadas

**Prioridade: ALTA**

### Como Fazer:

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **Authentication** → **Policies**
4. Procure por **"Leaked Password Protection"**
5. **HABILITE** a opção

### O que faz:

- Verifica senhas contra HaveIBeenPwned.org
- Bloqueia senhas que já foram vazadas em breaches
- Protege usuários de usar senhas comprometidas

---

## ✅ 5. Verificar Configurações de Auth

**Prioridade: MÉDIA**

No Dashboard do Supabase → **Authentication** → **Settings**:

### Recomendações:

- ✅ **Enable Email Confirmations**: ON (verificar email)
- ✅ **Minimum Password Length**: 8 caracteres
- ✅ **Password Strength**: Médio ou Forte
- ✅ **JWT Expiry**: 3600 segundos (1 hora)
- ✅ **Refresh Token Rotation**: ON

---

## 🧪 TESTES DE SEGURANÇA

Após executar todos os scripts, teste:

### Teste 1: Isolamento de Dados
1. Login com Usuário A
2. Criar transações, ativos, etc.
3. **Logout**
4. Login com Usuário B
5. **Verificar**: Não deve ver dados de A

### Teste 2: Proteção de Senhas
1. Tentar criar conta com senha fraca: "123456"
2. **Verificar**: Deve bloquear se proteção estiver ativa

### Teste 3: RLS em Views
1. No SQL Editor, execute:
```sql
SELECT * FROM transactions_enriched LIMIT 10;
```
2. **Verificar**: Deve retornar apenas dados do usuário logado

---

## 📊 VERIFICAÇÃO FINAL

Execute no SQL Editor:

```sql
-- 1. Verificar RLS habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'transactions', 'assets', 'targets', 'banks', 'cards', 'categories');

-- 2. Verificar políticas RLS
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Verificar views (não deve ter SECURITY DEFINER)
SELECT viewname, definition
FROM pg_views
WHERE schemaname = 'public'
  AND viewname LIKE '%_enriched';
```

**Todos devem retornar resultados corretos!**

---

## ⚠️ ORDEM DE EXECUÇÃO

**IMPORTANTE**: Execute nesta ordem:

1. ✅ `fix_rls_security.sql`
2. ✅ `fix_security_definer_views.sql`
3. ✅ `fix_function_security.sql`
4. ✅ Habilitar proteção de senha no dashboard
5. ✅ Executar testes

---

## 🆘 SE ALGO DER ERRADO

Se após executar os scripts houver problemas:

1. **Backup**: Supabase → Database → Backups
2. **Rollback**: Restaurar backup anterior
3. **Suporte**: Contatar suporte do Supabase

---

## ✅ CONCLUSÃO

Após executar TODOS os itens:

- ✅ Dados isolados por usuário
- ✅ RLS funcionando
- ✅ Views seguras
- ✅ Funções protegidas
- ✅ Senhas validadas

**Sua aplicação estará segura!** 🔒
