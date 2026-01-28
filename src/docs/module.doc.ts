/**
 * @swagger
 * tags:
 *   - name: Modules
 *     description: Gerenciamento de módulos e aulas de um curso
 */

/**
 * @swagger
 * /modules/{id}:
 *   get:
 *     summary: Buscar módulo por ID
 *     description: Retorna os detalhes de um módulo específico, incluindo a lista de aulas associadas.
 *     tags:
 *       - Modules
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único do módulo
 *     responses:
 *       200:
 *         description: Módulo encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "uuid-do-modulo"
 *                 title:
 *                   type: string
 *                   example: "Fundamentos de JavaScript"
 *                 orderIndex:
 *                   type: integer
 *                   example: 1
 *                 classes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "uuid-da-aula"
 *                       title:
 *                         type: string
 *                         example: "Introdução ao JavaScript"
 *                       videoUrl:
 *                         type: string
 *                         example: "https://youtube.com/video"
 *       404:
 *         description: Módulo não encontrado
 */

/**
 * @swagger
 * /modules/{id}:
 *   put:
 *     summary: Atualizar módulo
 *     description: Atualiza os dados de um módulo existente. Apenas instrutores autores do curso podem realizar esta ação.
 *     tags:
 *       - Modules
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único do módulo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Módulo Atualizado"
 *               orderIndex:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Módulo atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 orderIndex:
 *                   type: integer
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário não autorizado
 *       404:
 *         description: Módulo não encontrado
 */

/**
 * @swagger
 * /modules/{id}:
 *   delete:
 *     summary: Remover módulo
 *     description: Remove permanentemente um módulo e todas as aulas associadas. Ação restrita ao instrutor autor do curso.
 *     tags:
 *       - Modules
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único do módulo
 *     responses:
 *       200:
 *         description: Módulo removido com sucesso
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário não autorizado
 *       404:
 *         description: Módulo não encontrado
 */

/**
 * @swagger
 * /modules/{moduleId}/classes:
 *   post:
 *     summary: Criar aula em módulo
 *     description: Cria uma nova aula dentro de um módulo específico. Ação restrita a instrutores.
 *     tags:
 *       - Modules
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único do módulo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - videoUrl
 *               - orderIndex
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Variáveis e Tipos de Dados"
 *               description:
 *                 type: string
 *                 example: "Conceitos de var, let e const"
 *               videoUrl:
 *                 type: string
 *                 example: "https://youtube.com/video"
 *               orderIndex:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Aula criada com sucesso
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso restrito a instrutores
 *       404:
 *         description: Módulo não encontrado
 */
