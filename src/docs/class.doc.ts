/**
 * @swagger
 * tags:
 *   - name: Classes
 *     description: Gerenciamento de aulas, materiais e progresso do aluno
 */

/**
 * @swagger
 * /classes/{id}:
 *   get:
 *     summary: Buscar aula por ID
 *     description: Retorna os detalhes completos de uma aula específica.
 *     tags:
 *       - Classes
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único da aula
 *     responses:
 *       200:
 *         description: Aula encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "uuid-da-aula"
 *                 title:
 *                   type: string
 *                   example: "Introdução ao JavaScript"
 *                 description:
 *                   type: string
 *                   example: "Conceitos iniciais da linguagem"
 *                 videoUrl:
 *                   type: string
 *                   example: "https://youtube.com/video"
 *                 materialUrl:
 *                   type: string
 *                   example: "https://storage/material.pdf"
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Aula não encontrada
 */

/**
 * @swagger
 * /classes/{id}:
 *   put:
 *     summary: Atualizar aula
 *     description: Atualiza os dados de uma aula existente. Ação restrita ao instrutor autor do curso.
 *     tags:
 *       - Classes
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único da aula
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
 *                 example: "Descrição revisada da aula"
 *               videoUrl:
 *                 type: string
 *                 example: "https://youtube.com/newvideo"
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
 *         description: Aula não encontrada
 */

/**
 * @swagger
 * /classes/{id}:
 *   delete:
 *     summary: Remover aula
 *     description: Remove permanentemente uma aula. Ação restrita ao instrutor autor do curso.
 *     tags:
 *       - Classes
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único da aula
 *     responses:
 *       204:
 *         description: Aula removida com sucesso (sem conteúdo na resposta)
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário não autorizado
 *       404:
 *         description: Aula não encontrada
 */

/**
 * @swagger
 * /classes/{id}/upload:
 *   post:
 *     summary: Enviar material complementar
 *     description: Realiza upload de material complementar (PDF, slides etc.) para uma aula. Ação restrita a instrutores.
 *     tags:
 *       - Classes
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único da aula
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
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário não autorizado
 *       404:
 *         description: Aula não encontrada
 */

/**
 * @swagger
 * /classes/{id}/material:
 *   get:
 *     summary: Baixar material da aula
 *     description: Permite o download do material complementar da aula para alunos matriculados no curso.
 *     tags:
 *       - Classes
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único da aula
 *     responses:
 *       200:
 *         description: Material retornado com sucesso
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Usuário não matriculado no curso
 *       404:
 *         description: Aula ou material não encontrado
 */

/**
 * @swagger
 * /classes/{id}/progress:
 *   post:
 *     summary: Marcar aula como concluída
 *     description: Registra a conclusão de uma aula pelo aluno matriculado.
 *     tags:
 *       - Classes
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único da aula
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
 *       201:
 *         description: Aula marcada como concluída
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Aula marcada como concluída"
 *                 data:
 *                   type: object
 *                   description: Dados do registro de progresso
 *       403:
 *         description: Usuário não matriculado no curso
 *       404:
 *         description: Aula não encontrada
 */

/**
 * @swagger
 * /classes/{id}/progress:
 *   delete:
 *     summary: Remover conclusão da aula
 *     description: Remove o registro de conclusão da aula para o aluno.
 *     tags:
 *       - Classes
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único da aula
 *     responses:
 *       204:
 *         description: Progresso removido com sucesso (sem conteúdo na resposta)
 *       404:
 *         description: Aula não encontrada ou progresso inexistente
 */
