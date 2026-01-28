/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Gerenciamento e organização das categorias de cursos disponíveis na plataforma
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Listar todas as categorias
 *     description: |
 *       Retorna todas as categorias cadastradas no sistema.
 *       Este endpoint é público e pode ser utilizado para navegação,
 *       filtros e organização de cursos no catálogo.
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Lista de categorias retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   description: Lista de categorias disponíveis
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "ede3e696-536a-4272-aac0-4cbfd98442b6"
 *                       name:
 *                         type: string
 *                         example: "Programação"
 *             example:
 *               data:
 *                 - id: "ede3e696-536a-4272-aac0-4cbfd98442b6"
 *                   name: "Programação"
 *                 - id: "a1b2c3d4-5678-90ab-cdef-1234567890ab"
 *                   name: "Design"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro ao listar categorias"
 */

/**
 * @swagger
 * /categories/{id}/courses:
 *   get:
 *     summary: Listar cursos de uma categoria
 *     description: |
 *       Retorna todos os cursos associados a uma categoria específica.
 *       Utilizado para exibição de cursos filtrados por categoria.
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identificador único da categoria (UUID)
 *         example: "ede3e696-536a-4272-aac0-4cbfd98442b6"
 *     responses:
 *       200:
 *         description: Cursos da categoria retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "93425141-aa16-4096-93bb-ae3832b9d017"
 *                       title:
 *                         type: string
 *                         example: "JavaScript Avançado"
 *                       description:
 *                         type: string
 *                         example: "Curso completo de JavaScript moderno"
 *                       price:
 *                         type: number
 *                         format: float
 *                         example: 199.99
 *                       coverImageUrl:
 *                         type: string
 *                         example: "/storage/courses/javascript_avancado/cover.jpg"
 *                       maxStudents:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       enrolledCount:
 *                         type: number
 *                         example: 25
 *                       averageRating:
 *                         type: number
 *                         format: float
 *                         example: 4.5
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-01-26T12:29:56.291Z"
 *       404:
 *         description: Categoria não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Categoria não encontrada"
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Criar uma nova categoria
 *     description: |
 *       Cria uma nova categoria de cursos.
 *       A ação é restrita a usuários com perfil de Instrutor (INSTRUCTOR).
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 example: "Marketing Digital"
 *                 description: Nome único da categoria
 *           example:
 *             name: "Marketing Digital"
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Categoria criada com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "a1b2c3d4-5678-90ab-cdef-1234567890ab"
 *                     name:
 *                       type: string
 *                       example: "Marketing Digital"
 *       400:
 *         description: Dados inválidos (nome muito curto)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "O nome da categoria deve ter no mínimo 3 caracteres."
 *       401:
 *         description: Usuário não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Não autorizado"
 *       403:
 *         description: Usuário sem permissão (apenas INSTRUCTOR)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Acesso negado"
 *       409:
 *         description: Já existe uma categoria com este nome
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Já existe uma categoria com este nome"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro ao criar categoria"
 */

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Atualizar categoria
 *     description: |
 *       Atualiza o nome de uma categoria existente.
 *       Apenas usuários com perfil de Instrutor (INSTRUCTOR) podem realizar esta operação.
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da categoria a ser atualizada (UUID)
 *         example: "a1b2c3d4-5678-90ab-cdef-1234567890ab"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 example: "Marketing e Vendas"
 *                 description: Novo nome da categoria
 *           example:
 *             name: "Marketing e Vendas"
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Categoria atualizada com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "a1b2c3d4-5678-90ab-cdef-1234567890ab"
 *                     name:
 *                       type: string
 *                       example: "Marketing e Vendas"
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão (apenas INSTRUCTOR)
 *       404:
 *         description: Categoria não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Categoria não encontrada"
 *       409:
 *         description: Já existe outra categoria com este nome
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Já existe uma categoria com este nome"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro ao atualizar categoria"
 */

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Excluir categoria
 *     description: |
 *       Remove permanentemente uma categoria do sistema.
 *       Apenas usuários com perfil de Instrutor (INSTRUCTOR) podem realizar esta operação.
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da categoria a ser removida (UUID)
 *         example: "a1b2c3d4-5678-90ab-cdef-1234567890ab"
 *     responses:
 *       200:
 *         description: Categoria deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Categoria deletada com sucesso"
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão (apenas INSTRUCTOR)
 *       404:
 *         description: Categoria não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Categoria não encontrada"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro ao deletar categoria"
 */
