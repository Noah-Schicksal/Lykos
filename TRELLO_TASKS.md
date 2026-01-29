# Trello Tasks - Frontend Development

Copie e cole estas tasks no Trello. Cada task inclui a descrição da funcionalidade e os endpoints de API necessários.

## 1. Tela Principal (Home)
**Descrição:** 
Desenvolver a tela principal da aplicação que lista os cursos disponíveis.
- [ ] Listar cursos em grid (4 por linha).
- [ ] Implementar paginação (infinito scrool ou botões).
- [ ] Filtro por Categoria (select ou tabs).
- [ ] Busca pelo nome do curso (Filtro no Front, buscar todos e filtrar array).
- [ ] Exibir Thumbnail do curso (`/storage/...`).

**Endpoints:**
- `GET /courses` (Listagem, suporta `page`, `limit`, `category`).
- `GET /categories` (Para popular o filtro).
- `GET /courses/:id/cover` (URL da imagem).

---

## 2. Dashboard do Instrutor
**Descrição:**
Painel para o instrutor gerenciar seus cursos.
- [ ] Listar cursos criados pelo instrutor logado.
- [ ] Botão para criar novo curso (Modal ou Nova Página).
- [ ] Editar Curso (Nome, Descrição, Preço).
- [ ] Deletar Curso.
- [ ] Gerenciar Conteúdo: Adicionar Módulos e Aulas.

**Endpoints:**
- `GET /courses/authored` (Listar meus cursos).
- `POST /courses` (Criar curso - FormData com imagem).
- `PUT /courses/:id` (Editar dados básicos).
- `DELETE /courses/:id` (Remover curso).
- `POST /courses/:id/modules` (Criar módulo).
- `PUT /modules/:id`, `DELETE /modules/:id` (Editar/Remover módulo).
- `POST /modules/:moduleId/classes` (Adicionar aula ao módulo).
- `PUT /classes/:id`, `DELETE /classes/:id` (Editar/Remover aula).
- `POST /classes/:id/upload` (Upload de material extra).

---

## 3. Dashboard do Aluno
**Descrição:**
Área do aluno para visualizar seus cursos comprados.
- [ ] Listar todos os cursos em que o aluno está matriculado.
- [ ] Mostrar progresso (barra de progresso).
- [ ] Clicar no curso leva para a tela "Assistir Curso".

**Endpoints:**
- `GET /my-courses` (Retorna cursos matriculados com progresso).

---

## 4. Detalhes do Curso (Vitrine)
**Descrição:**
Card flutuante ou página dedicada ao clicar em um curso não comprado.
- [ ] Exibir Título, Descrição, Preço, Autor, Data.
- [ ] Botão "Adicionar ao Carrinho".
- [ ] Se já estiver no carrinho, mostrar "Ir para Carrinho".

**Endpoints:**
- `GET /courses/:id` (Dados do curso).
- `GET /courses/:id/modules` (Opcional: mostrar grade curricular antes da compra).
- `POST /cart` (Adicionar item: `{ courseId }`).

---

## 5. Tela de Assistir Aula (Player)
**Descrição:**
Ambiente de estudo para o curso comprado.
- [ ] Player de vídeo principal (YouTube/Vimeo embed).
- [ ] Sidebar com lista de Módulos e Aulas (Acordeão).
- [ ] Área de Materiais Complementares (Download).
- [ ] Botão "Marcar como Concluída".

**Endpoints:**
- `GET /courses/:id/modules` (Retorna estrutura completa: Módulos > Aulas).
- `POST /classes/:id/progress` (Marcar visto).
- `GET /classes/:id/material` (Download seguro de anexos).
- `GET /courses/:id` (Para dados do cabeçalho).

---

## 6. Carrinho de Compras
**Descrição:**
Tela para revisar itens e finalizar matrícula.
- [ ] Listar cursos no carrinho.
- [ ] Exibir valor total.
- [ ] Botão remover item.
- [ ] Painel lateral de Pagamento (Simulacro: Pix, Cartão, Boleto).
- [ ] Botão "Finalizar Compra" (Confirmar Matrícula).

**Endpoints:**
- `GET /cart` (Listar itens).
- `DELETE /cart/:courseId` (Remover item).
- `POST /checkout` (Finalizar compra e gerar matrículas).

---

## 7. Dashboard Admin
**Descrição:**
Painel administrativo para moderação.
- [ ] Verificar Role ADMIN no login.
- [ ] Listar todos os cursos da plataforma.
- [ ] Botão de excluir qualquer curso (Controle da plataforma).

**Endpoints:**
- `GET /courses` (Listagem geral).
- `DELETE /courses/:id` (**Atenção**: Atual permissão requer revisão no backend para incluir ADMIN).
