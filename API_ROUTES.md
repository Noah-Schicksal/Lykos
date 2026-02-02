# Documentação de Rotas da API Lykos

## Visão Geral

Base URL: `http://localhost:3333`

---

## 🔐 Autenticação (`/auth`)

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `POST` | `/auth/login` | Público | Login de usuário |
| `DELETE` | `/auth/logout` | Público | Logout (limpa cookie) |
| `POST` | `/auth/register/student` | Público | Registro de aluno |
| `POST` | `/auth/register/instructor` | Público | Registro de instrutor |

---

## 👤 Usuários (`/users`)

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `GET` | `/users/me` | Autenticado | Dados do usuário logado |
| `PUT` | `/users/me` | Autenticado | Atualizar dados do usuário |
| `DELETE` | `/users/me` | Autenticado | Deletar conta do usuário |

---

## 📚 Cursos (`/courses`)

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `GET` | `/courses` | Público | Listar cursos (vitrine) |
| `GET` | `/courses/authored` | Instrutor | Listar cursos do instrutor |
| `GET` | `/courses/:id` | Público | Detalhes de um curso |
| `GET` | `/courses/:id/cover` | Público | Imagem de capa do curso |
| `GET` | `/courses/:id/modules` | Público | Listar módulos do curso |
| `GET` | `/courses/:id/students` | Instrutor | Listar alunos matriculados |
| `POST` | `/courses` | Instrutor | Criar novo curso |
| `POST` | `/courses/:id/modules` | Instrutor | Criar módulo no curso |
| `POST` | `/courses/:id/certificate` | Autenticado | Emitir certificado |
| `PUT` | `/courses/:id` | Instrutor | Atualizar curso |
| `DELETE` | `/courses/:id` | Instrutor | Deletar curso |

---

## 📂 Categorias (`/categories`)

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `GET` | `/categories` | Público | Listar categorias |
| `GET` | `/categories/:id/courses` | Público | Cursos de uma categoria |
| `POST` | `/categories` | Instrutor | Criar categoria |
| `PUT` | `/categories/:id` | Instrutor | Atualizar categoria |
| `DELETE` | `/categories/:id` | Instrutor | Deletar categoria |

---

## 📦 Módulos (`/modules`)

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `GET` | `/modules/:id` | Público | Detalhes de um módulo |
| `PUT` | `/modules/:id` | Instrutor | Atualizar módulo |
| `DELETE` | `/modules/:id` | Instrutor | Deletar módulo |
| `POST` | `/modules/:moduleId/classes` | Instrutor | Criar aula no módulo |

---

## 🎬 Aulas (`/classes`)

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `GET` | `/classes/:id` | Autenticado | Detalhes da aula |
| `GET` | `/classes/:id/material` | Autenticado | Download de material |
| `GET` | `/classes/:id/video` | Autenticado | Stream de vídeo |
| `POST` | `/classes/:id/progress` | Autenticado | Marcar aula como concluída |
| `POST` | `/classes/:id/upload` | Instrutor | Upload de material |
| `POST` | `/classes/:id/video` | Instrutor | Upload de vídeo |
| `PUT` | `/classes/:id` | Instrutor | Atualizar aula |
| `DELETE` | `/classes/:id` | Instrutor | Deletar aula |
| `DELETE` | `/classes/:id/progress` | Autenticado | Desmarcar conclusão |

---

## ⭐ Avaliações (`/reviews`)

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `GET` | `/reviews/courses/:id/reviews` | Público | Listar avaliações de um curso |
| `POST` | `/reviews/courses/:id/reviews` | Aluno | Criar avaliação |
| `DELETE` | `/reviews/:id` | Autenticado | Deletar avaliação |

---

## 🎓 Estudante (Rotas Raiz)

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `GET` | `/my-courses` | Aluno/Instrutor | Listar cursos matriculados |
| `GET` | `/my-courses/:id` | Aluno/Instrutor | Detalhes do curso (player) |
| `POST` | `/courses/:id/certificate` | Aluno/Instrutor | Emitir certificado |

---

## 🛒 Carrinho (Rotas Raiz)

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `GET` | `/cart` | Aluno/Instrutor | Listar itens do carrinho |
| `POST` | `/cart` | Aluno/Instrutor | Adicionar ao carrinho |
| `DELETE` | `/cart/:courseId` | Aluno/Instrutor | Remover do carrinho |
| `POST` | `/checkout` | Aluno/Instrutor | Finalizar compra |

---

## 🏆 Certificados (`/certificates`)

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `GET` | `/certificates/:hash` | Público | Validar certificado |

---

## 🛡️ Admin (`/admin`)

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `GET` | `/admin/courses` | Admin | Listar todos os cursos |
| `GET` | `/admin/courses/:id` | Admin | Ver qualquer curso |
| `DELETE` | `/admin/courses/:id` | Admin | Deletar qualquer curso |

---

## 📁 Storage (Arquivos Estáticos)

| Rota | Descrição |
|------|-----------|
| `/storage/courses/{courseTitle}/cover.*` | Capas dos cursos |
| `/storage/courses/{courseTitle}/classes/{classId}/material.*` | Materiais das aulas |
| `/storage/courses/{courseTitle}/classes/{classId}/video.*` | Vídeos das aulas |

---

## Legenda de Acesso

| Tipo | Descrição |
|------|-----------|
| **Público** | Sem autenticação necessária |
| **Autenticado** | Requer token JWT válido |
| **Aluno** | Requer role `STUDENT` |
| **Instrutor** | Requer role `INSTRUCTOR` |
| **Aluno/Instrutor** | Aceita ambas as roles |
| **Admin** | Requer role `ADMIN` |

---

## Total de Endpoints

- **Autenticação:** 4
- **Usuários:** 3
- **Cursos:** 11
- **Categorias:** 5
- **Módulos:** 4
- **Aulas:** 9
- **Avaliações:** 3
- **Estudante:** 3
- **Carrinho:** 4
- **Certificados:** 1
- **Admin:** 3

**Total: 50 endpoints**
