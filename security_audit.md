# Auditoria de Segurança da API Lykos

## Resumo Executivo

Esta auditoria analisa a segurança da API Lykos, identificando **pontos fortes** e **vulnerabilidades potenciais**.

---

## ✅ O Que Já Temos (Pontos Fortes)

### 1. Autenticação & Autorização

| Arquivo | Recurso | Descrição |
|---------|---------|-----------|
| `authMiddleware.ts` | JWT | Validação de token via cookie ou header `Authorization` |
| `roleMiddleware.ts` | RBAC | Controle de acesso por role (`STUDENT`, `INSTRUCTOR`, `ADMIN`) |
| `adminMiddleware.ts` | Admin Check | Middleware dedicado para rotas administrativas |
| `authService.ts` | bcrypt | Hash de senha com `bcrypt` (salt rounds: 10) |
| `cookie.ts` | HttpOnly Cookies | Cookies com `httpOnly: true`, `secure` em produção, `sameSite` |

### 2. Validação de Dados

| Arquivo | Recurso | Descrição |
|---------|---------|-----------|
| `validationMiddleware.ts` | Input Validation | Validação de campos obrigatórios (register, login, course) |
| `User.ts` | Password Policy | Senha mínima de 8 caracteres, maiúsculas, minúsculas, números e caracteres especiais |
| `storageService.ts` | Magic Number Validation | Validação de tipo de arquivo por bytes (não extensão) |

### 3. Headers de Segurança

| Arquivo | Recurso | Descrição |
|---------|---------|-----------|
| `app.ts` | Helmet | CSP configurado, proteção contra XSS, clickjacking, etc. |
| `cors.ts` | CORS Whitelist | Apenas origens em whitelist são permitidas |

### 4. Banco de Dados

| Arquivo | Recurso | Descrição |
|---------|---------|-----------|
| `init.ts` | Role Constraint | `CHECK(role IN ('INSTRUCTOR', 'STUDENT', 'ADMIN'))` |
| `init.ts` | Foreign Keys | `ON DELETE CASCADE` para integridade referencial |
| Repositories | Prepared Statements | Uso de `better-sqlite3` com statements parametrizados (proteção contra SQL Injection) |

### 5. Controle de Acesso a Conteúdo

| Arquivo | Recurso | Descrição |
|---------|---------|-----------|
| `classService.ts` | `checkAccess()` | Verifica ownership (INSTRUCTOR) ou enrollment (STUDENT) ou ADMIN |
| `courseService.ts` | Ownership Check | Apenas o instrutor dono pode editar/deletar |

---

## ⚠️ Vulnerabilidades e Pontos de Atenção

### 1. 🔴 Rate Limiting Muito Alto (CRÍTICO)

**Arquivo:** `rateLimitMiddleware.ts`

```typescript
max: 100000 // Limite global
max: 100000 // Limite de login
```

**Problema:** Limites de 100.000 requisições por minuto são ineficazes. Permite ataques de força bruta em login.

**Recomendação:**
```typescript
// Global
max: 100  // 100 req/min por IP

// Login
max: 5    // 5 tentativas de login por minuto
windowMs: 15 * 60 * 1000 // 15 minutos
```

---

### 2. 🟠 Diretório `/storage` Exposto Publicamente

**Arquivo:** `app.ts`

```typescript
app.use('/storage', express.static(path.join(process.cwd(), 'storage')));
```

**Problema:** Qualquer pessoa pode acessar arquivos em `/storage` diretamente se souber o caminho.

**Recomendação:** Remover esta linha e servir arquivos apenas através de rotas autenticadas (`/classes/:id/material`, `/classes/:id/video`).

---

### 3. 🟠 Registro de Instrutor Público

**Arquivo:** `authRoutes.ts`

```typescript
router.post('/register/instructor', ...);
```

**Problema:** Qualquer pessoa pode se registrar como instrutor.

**Recomendação:** Restringir esta rota a ADMINs ou implementar um fluxo de aprovação.

---

### 4. 🟡 JWT_SECRET Não Validado em Runtime

**Arquivo:** `authService.ts`

```typescript
const secret = process.env.JWT_SECRET!; // Non-null assertion
```

**Problema:** Se `JWT_SECRET` não estiver definido, o servidor inicia mas falha em runtime.

**Status:** Parcialmente mitigado por `env.ts` que valida variáveis no startup.

---

### 5. 🟡 Falta de Auditoria/Logging

**Problema:** Não há sistema de logging para:
- Tentativas de login falhas
- Acessos não autorizados
- Operações sensíveis (delete de curso, etc.)

**Recomendação:** Implementar logging com Winston ou similar.

---

### 6. 🟡 Não Há Expiração de Refresh Token

**Problema:** Apenas access token com expiração. Se comprometido, permanece válido até expirar.

**Recomendação:** Implementar refresh tokens e lista de revogação.

---

### 7. 🟢 Sem Proteção CSRF Explícita

**Status:** Mitigado por:
- `sameSite: 'strict'` em produção
- Cookies `httpOnly`
- CORS restritivo

---

## 📋 Tabela Resumo

| Item | Severidade | Status |
|------|------------|--------|
| Rate Limiting | 🔴 Crítico | Precisa ajuste |
| /storage exposto | 🟠 Médio | Precisa ajuste |
| Registro de Instrutor | 🟠 Médio | Avaliar regra de negócio |
| Logging/Auditoria | 🟡 Baixo | Recomendado |
| Refresh Tokens | 🟡 Baixo | Recomendado |
| JWT Auth | ✅ OK | Implementado |
| Password Policy | ✅ OK | Implementado |
| RBAC | ✅ OK | Implementado |
| Helmet/CSP | ✅ OK | Implementado |
| CORS | ✅ OK | Implementado |
| SQL Injection | ✅ OK | Prepared Statements |
| File Upload Validation | ✅ OK | Magic Numbers |

---

## Recomendações Prioritárias

1. **URGENTE:** Reduzir `max` em `rateLimitMiddleware.ts` para valores realistas (100 global, 5 login).
2. **IMPORTANTE:** Remover ou proteger a rota estática `/storage`.
3. **RECOMENDADO:** Adicionar logging de segurança.
4. **OPCIONAL:** Avaliar restrição de registro de instrutor.
