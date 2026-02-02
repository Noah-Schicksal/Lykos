/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Rotas administrativas para gerenciamento do sistema
 */

/**
 * @swagger
 * /admin/courses:
 *   get:
 *     summary: Listar todos os cursos (Admin)
 *     description: |
 *       Retorna uma lista paginada de **todos** os cursos, incluindo os inativos (soft-deleted).
 *       Apenas usuários com perfil ADMIN podem acessar esta rota.
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           permission: 50
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca por título
 *     responses:
 *       200:
 *         description: Lista de cursos completa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           title:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           instructor:
 *                             type: object
 *                             properties:
 *                               name: 
 *                                 type: string
 *                     total:
 *                       type: integer
 *       403:
 *         description: Acesso negado (não é Admin)
 */

/**
 * @swagger
 * /admin/courses/{id}:
 *   get:
 *     summary: Ver detalhes de qualquer curso (Admin)
 *     description: |
 *       Exibe detalhes completos de um curso, independente de matrícula ou status.
 *       Permite que administradores visualizem o conteúdo para moderação.
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detalhes do curso
 *       404:
 *         description: Curso não encontrado
 */

/**
 * @swagger
 * /admin/courses/{id}:
 *   delete:
 *     summary: Remover (soft delete) qualquer curso (Admin)
 *     description: |
 *       Desativa um curso, removendo-o da listagem pública, mas mantendo histórico.
 *       Contorna a restrição de propriedade (apenas dono).
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Curso desativado com sucesso
 *       403:
 *         description: Acesso negado
 */
