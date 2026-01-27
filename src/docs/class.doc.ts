/**
 * @swagger
 * tags:
 *   name: Classes
 *   description: Gerenciamento de aulas e materiais
 */

/**
 * @swagger
 * /classes/{id}:
 *   get:
 *     summary: Obtém detalhes de uma aula
 *     description: Retorna as informações detalhadas de uma aula.
 *     tags: [Classes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da aula
 *     responses:
 *       200:
 *         description: Detalhes da aula
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 videoUrl:
 *                   type: string
 *                 materialUrl:
 *                   type: string
 *       404:
 *         description: Aula não encontrada
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /classes/{id}:
 *   put:
 *     summary: Atualiza uma aula
 *     description: Atualiza as informações de uma aula. Requer autenticação de Instrutor e autoria.
 *     tags: [Classes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da aula
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Aula Atualizada"
 *               description:
 *                 type: string
 *                 example: "Descrição atualizada"
 *               videoUrl:
 *                 type: string
 *                 example: "https://www.youtube.com/watch?v=newvideo"
 *               orderIndex:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Aula atualizada com sucesso
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
 *         description: Aula não encontrada
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido
 */

/**
 * @swagger
 * /classes/{id}:
 *   delete:
 *     summary: Exclui uma aula
 *     description: Remove permanentemente uma aula. Requer autenticação de Instrutor e autoria.
 *     tags: [Classes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da aula
 *     responses:
 *       200:
 *         description: Aula excluída com sucesso
 *       404:
 *         description: Aula não encontrada
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido
 */

/**
 * @swagger
 * /classes/{id}/upload:
 *   post:
 *     summary: Upload de material de aula
 *     description: Envia um arquivo (PDF, etc.) como material complementar para a aula. Requer Instrutor.
 *     tags: [Classes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da aula
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de material complementar
 *     responses:
 *       200:
 *         description: Material enviado com sucesso
 *       404:
 *         description: Aula não encontrada
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido
 */

/**
 * @swagger
 * /classes/{id}/material:
 *   get:
 *     summary: Download de material da aula
 *     description: Permite o download do material complementar da aula. Requer estar matriculado no curso.
 *     tags: [Classes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da aula
 *     responses:
 *       200:
 *         description: Arquivo retornado com sucesso
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Material ou aula não encontrados
 *       403:
 *         description: Usuário não matriculado no curso
 */

/**
 * @swagger
 * /classes/{id}/progress:
 *   post:
 *     summary: Marca aula como concluída
 *     description: Registra que o estudante concluiu a aula.
 *     tags: [Classes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da aula
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - completed
 *             properties:
 *               completed:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Progresso registrado com sucesso
 *       404:
 *         description: Aula não encontrada
 *       403:
 *         description: Usuário não matriculado
 */

/**
 * @swagger
 * /classes/{id}/progress:
 *   delete:
 *     summary: Desmarca aula como concluída
 *     description: Remove o registro de conclusão da aula para o estudante.
 *     tags: [Classes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da aula
 *     responses:
 *       200:
 *         description: Progresso removido com sucesso
 *       404:
 *         description: Aula não encontrada ou progresso inexistente
 */
