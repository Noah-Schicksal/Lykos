/**
 * @swagger
 * tags:
 *   name: Modules
 *   description: Gerenciamento de módulos de cursos
 */

/**
 * @swagger
 * /modules/{id}:
 *   get:
 *     summary: Obtém detalhes de um módulo
 *     description: Retorna as informações detalhadas de um módulo específico, incluindo suas aulas.
 *     tags: [Modules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do módulo
 *     responses:
 *       200:
 *         description: Detalhes do módulo
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
 *                 classes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       videoUrl:
 *                         type: string
 *       404:
 *         description: Módulo não encontrado
 */

/**
 * @swagger
 * /modules/{id}:
 *   put:
 *     summary: Atualiza um módulo
 *     description: Atualiza as informações de um módulo. Requer autenticação de Instrutor e autoria do curso.
 *     tags: [Modules]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do módulo
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *       404:
 *         description: Módulo não encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido
 */

/**
 * @swagger
 * /modules/{id}:
 *   delete:
 *     summary: Exclui um módulo
 *     description: Remove permanentemente um módulo e todas as suas aulas. Requer autenticação de Instrutor e autoria.
 *     tags: [Modules]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do módulo
 *     responses:
 *       200:
 *         description: Módulo excluído com sucesso
 *       404:
 *         description: Módulo não encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido
 */

/**
 * @swagger
 * /modules/{moduleId}/classes:
 *   post:
 *     summary: Adiciona uma aula ao módulo
 *     description: Cria uma nova aula dentro de um módulo específico. Requer autenticação de Instrutor.
 *     tags: [Modules]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do módulo
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
 *                 example: "Aprenda sobre var, let e const"
 *               videoUrl:
 *                 type: string
 *                 example: "https://www.youtube.com/watch?v=example"
 *               orderIndex:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Aula criada com sucesso
 *       404:
 *         description: Módulo não encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso restrito a instrutores
 */
