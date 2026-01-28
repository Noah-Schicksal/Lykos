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
 *                         example: "cat_001"
 *                       name:
 *                         type: string
 *                         example: "Programação"
 *       500:
 *         description: Erro interno do servidor
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
 *         description: Identificador único da categoria
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
 *                         example: "course_123"
 *                       title:
 *                         type: string
 *                         example: "JavaScript Avançado"
 *                       description:
 *                         type: string
 *                         example: "Curso completo de JavaScript moderno"
 *                       price:
 *                         type: number
 *                         format: float
 *                         example: 199.9
 *                       isPublished:
 *                         type: boolean
 *                         example: true
 *       404:
 *         description: Categoria não encontrada
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
 *       A ação é restrita a usuários com perfil de Instrutor ou Administrador.
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
 *                 example: "Marketing Digital"
 *                 description: Nome único da categoria
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "cat_010"
 *                     name:
 *                       type: string
 *                       example: "Marketing Digital"
 *       400:
 *         description: Dados inválidos ou categoria já existente
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão para criar categorias
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Atualizar categoria
 *     description: |
 *       Atualiza o nome de uma categoria existente.
 *       Apenas usuários autorizados podem realizar esta operação.
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria a ser atualizada
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
 *                 example: "Marketing e Vendas"
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "cat_010"
 *                     name:
 *                       type: string
 *                       example: "Marketing e Vendas"
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Excluir categoria
 *     description: |
 *       Remove permanentemente uma categoria do sistema.
 *       A exclusão só é permitida se não houver cursos vinculados
 *       ou conforme a regra de negócio definida.
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria a ser removida
 *     responses:
 *       200:
 *         description: Categoria removida com sucesso
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Categoria não encontrada
 *       409:
 *         description: Categoria não pode ser removida pois possui cursos vinculados
 *       500:
 *         description: Erro interno do servidor
 */
