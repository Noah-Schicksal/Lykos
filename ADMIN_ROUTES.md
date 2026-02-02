# Rotas de Administração

Rotas exclusivas para usuários com role `ADMIN`.

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/admin/courses` | Listar **todos** os cursos (ativos e inativos) |
| `GET` | `/admin/courses/:id` | Ver detalhes/conteúdo de **qualquer** curso sem precisar estar matriculado |
| `DELETE` | `/admin/courses/:id` | Apagar (soft delete) **qualquer** curso |

## Proteção

Todas as rotas requerem:

1. **Autenticação** - Token JWT válido (`authMiddleware`)
2. **Role ADMIN** - Usuário deve ter role `ADMIN` (`adminMiddleware`)

## Arquivos Relacionados

- **Rotas:** `src/routes/adminRoutes.ts`
- **Controller:** `src/controllers/adminController.ts`
- **Middleware:** `src/middlewares/adminMiddleware.ts`
