# Configurações de Segurança do Supabase

Este documento contém todas as configurações de segurança recomendadas para o projeto no Supabase.

## ✅ Configurações Obrigatórias (Já Implementadas)

### 1. Row Level Security (RLS)
- ✅ Habilitado em todas as tabelas
- ✅ Políticas configuradas para isolamento de dados por usuário
- ✅ Tabelas públicas (`icons`, `transaction_types`) com política de leitura pública

### 2. Function Security
- ✅ `update_updated_at_column` com `SECURITY DEFINER` e `search_path` fixo

## ⚙️ Configurações Recomendadas para Desenvolvimento

### 1. Email Confirmation (Desenvolvimento)

**Localização:** Authentication → Providers → Email

**Configuração Recomendada:**
- ❌ **Confirm email**: Desabilitado (para facilitar testes)
- ✅ **Auto confirm users**: Habilitado (opcional)

**Por quê?**
Durante o desenvolvimento, confirmar email manualmente toda vez é inconveniente. Desabilite para agilizar o desenvolvimento.

**⚠️ IMPORTANTE:** Em produção, habilite a confirmação de email!

### 2. Password Requirements

**Localização:** Authentication → Providers → Email

**Configuração Recomendada (Desenvolvimento):**
- Minimum password length: `6` caracteres (padrão)

**Configuração Recomendada (Produção):**
- Minimum password length: `8-12` caracteres
- Require uppercase: Habilitado
- Require numbers: Habilitado
- Require special characters: Habilitado

## 🛡️ Configurações Recomendadas para Produção

### 1. Leaked Password Protection

**Aviso do Supabase:**
```
Leaked Password Protection Disabled
Supabase Auth prevents the use of compromised passwords by checking
against HaveIBeenPwned.org. Enable this feature to enhance security.
```

**Como Habilitar:**

1. Acesse [Supabase Dashboard](https://app.supabase.com/)
2. Vá em **Authentication** → **Providers** → **Email**
3. Role até "Password Settings"
4. Habilite **"Check for leaked passwords"**
5. Clique em **Save**

**O que isso faz?**
- Verifica se a senha foi exposta em vazamentos de dados conhecidos
- Usa a API do HaveIBeenPwned.org de forma anônima e segura
- Bloqueia senhas comprometidas durante o cadastro/mudança de senha

**Custo:** Gratuito ✅

**Performance:** Mínimo impacto (apenas durante signup/password change)

### 2. Email Confirmation (Produção)

**Como Habilitar:**

1. Vá em **Authentication** → **Providers** → **Email**
2. Habilite **"Confirm email"**
3. Configure template de email em **Authentication** → **Email Templates** → **Confirm Signup**
4. Personalize o email com sua marca
5. Clique em **Save**

### 3. Rate Limiting

**Localização:** Settings → API → Rate Limits

**Configuração Recomendada:**
- Auth endpoints: 60 requests/minute
- Database endpoints: 100 requests/minute
- Storage endpoints: 60 requests/minute

**Como Configurar:**
1. Vá em **Settings** → **API**
2. Configure rate limits apropriados
3. Adicione allowlist de IPs se necessário (ex: seu servidor backend)

### 4. JWT Expiration

**Localização:** Settings → Auth → JWT expiry

**Configuração Recomendada:**
- Access Token: `3600` segundos (1 hora)
- Refresh Token: `2592000` segundos (30 dias)

**Como Configurar:**
1. Vá em **Settings** → **Auth**
2. Ajuste "JWT expiry limit"
3. Clique em **Save**

### 5. Allowed Email Domains (Opcional)

**Localização:** Authentication → Providers → Email

**Quando Usar:**
- Aplicações B2B (apenas emails corporativos)
- Sistemas internos (apenas domínio da empresa)

**Como Configurar:**
1. Vá em **Authentication** → **Providers** → **Email**
2. Em "Allowed email domains", adicione: `example.com,yourcompany.com`
3. Clique em **Save**

### 6. Multi-Factor Authentication (MFA)

**Status Atual:** Não implementado

**Como Implementar (Futuro):**
```javascript
// No código do cliente
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp',
});
```

**Documentação:** https://supabase.com/docs/guides/auth/auth-mfa

## 🔐 Configurações de Database

### 1. Connection Pooling

**Localização:** Settings → Database → Connection pooling

**Configuração Recomendada:**
- Mode: `Transaction`
- Pool size: `15` (para plano free)

### 2. SSL Enforcement

**Status:** ✅ Habilitado por padrão no Supabase

**Verificar:**
```javascript
// Conexões sempre usam SSL
const { data, error } = await supabase.from('users').select('*');
// ✅ Automaticamente usa SSL
```

## 📊 Monitoramento e Logs

### 1. Database Logs

**Como Acessar:**
1. Vá em **Database** → **Logs**
2. Filtre por:
   - Queries lentas (> 1s)
   - Erros de permissão (RLS violations)
   - Queries frequentes

**Configuração Recomendada:**
- Habilitar query logging em produção
- Monitorar queries lentas semanalmente

### 2. Auth Logs

**Como Acessar:**
1. Vá em **Authentication** → **Logs**
2. Monitore:
   - Failed login attempts
   - Signup patterns
   - Password reset requests

**Alertas Recomendados:**
- Múltiplas tentativas de login falhadas
- Picos incomuns de cadastros
- Mudanças de senha em massa

## 🚨 Checklist de Segurança

### Desenvolvimento
- [ ] RLS habilitado em todas as tabelas
- [ ] Email confirmation: Desabilitado (para facilitar testes)
- [ ] Senha mínima: 6 caracteres
- [ ] Leaked password check: Opcional

### Produção
- [ ] RLS habilitado em todas as tabelas ✅
- [ ] Email confirmation: **Habilitado**
- [ ] Senha mínima: 8-12 caracteres
- [ ] Leaked password check: **Habilitado**
- [ ] Rate limiting configurado
- [ ] JWT expiry configurado
- [ ] SSL enforcement verificado ✅
- [ ] Logs de auth monitorados
- [ ] Logs de database monitorados
- [ ] Backup automático configurado

## 🔧 Comandos Úteis

### Verificar RLS Status
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Verificar Políticas RLS
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
ORDER BY tablename, policyname;
```

### Listar Usuários Ativos
```sql
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
```

### Verificar Senhas Não Confirmadas
```sql
SELECT
  email,
  created_at
FROM auth.users
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;
```

## 📚 Recursos Adicionais

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

## 🎯 Próximas Melhorias de Segurança

1. **Implementar MFA (Multi-Factor Authentication)**
   - TOTP (Google Authenticator, Authy)
   - SMS (via Twilio)

2. **Audit Logging**
   - Registrar todas as ações importantes
   - Tabela de audit_logs com triggers

3. **Session Management**
   - Revogação de sessões
   - Limite de dispositivos simultâneos

4. **CAPTCHA**
   - Prevenir signup automatizado
   - reCAPTCHA ou hCaptcha

5. **Webhooks de Segurança**
   - Notificar sobre eventos suspeitos
   - Integrar com sistemas de alerta

---

**Última atualização:** 2025-12-09
**Versão:** 1.0.0
