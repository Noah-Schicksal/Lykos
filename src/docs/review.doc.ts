/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Avaliações públicas de cursos realizadas por estudantes matriculados
 */
/**
 * @swagger
 * /courses/{id}/reviews:
 *   get:
 *     summary: Lista avaliações de um curso
 *     description: >
 *       Retorna todas as avaliações públicas associadas a um curso.
 *       As avaliações incluem nota, comentário e identificação do estudante.
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do curso
 *     responses:
 *       200:
 *         description: Avaliações retornadas com sucesso
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
 *                       rating:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 5
 *                       comment:
 *                         type: string
 *                       studentName:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: Curso não encontrado
 */
/**
 * @swagger
 * /courses/{id}/reviews:
 *   post:
 *     summary: Cria uma avaliação
 *     description: >
 *       Permite que um estudante matriculado avalie um curso.
 *       Cada estudante pode criar apenas uma avaliação por curso.
 *     tags: [Reviews]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do curso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating, comment]
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: "Excelente curso! Recomendo."
 *     responses:
 *       201:
 *         description: Avaliação criada com sucesso
 *       400:
 *         description: Dados inválidos ou avaliação já existente
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário não matriculado no curso
 *       404:
 *         description: Curso não encontrado
 */
/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Atualiza uma avaliação
 *     description: >
 *       Permite que o autor da avaliação atualize sua nota ou comentário.
 *     tags: [Reviews]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da avaliação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Avaliação atualizada com sucesso
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
 *                     rating:
 *                       type: integer
 *                     comment:
 *                       type: string
 *       404:
 *         description: Avaliação não encontrada
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão para editar esta avaliação
 */
/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Exclui uma avaliação
 *     description: >
 *       Permite que o autor da avaliação exclua permanentemente sua avaliação.
 *     tags: [Reviews]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da avaliação
 *     responses:
 *       200:
 *         description: Avaliação excluída com sucesso
 *       404:
 *         description: Avaliação não encontrada
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão para excluir esta avaliação
 */
