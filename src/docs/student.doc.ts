/**
 * @swagger
 * tags:
 *   - name: Student
 *     description: Dashboard e funcionalidades exclusivas do estudante
 */

/**
 * @swagger
 * /my-courses:
 *   get:
 *     summary: Listar cursos matriculados
 *     description: Retorna todos os cursos em que o estudante autenticado está matriculado, incluindo informações de progresso.
 *     tags:
 *       - Student
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de cursos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       courseId:
 *                         type: string
 *                         example: "uuid-do-curso"
 *                       title:
 *                         type: string
 *                         example: "Curso de JavaScript"
 *                       description:
 *                         type: string
 *                         example: "Aprenda JavaScript do zero"
 *                       progress:
 *                         type: number
 *                         description: Percentual de conclusão do curso (0 a 100)
 *                         example: 45.5
 *                       enrolledAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-10T14:30:00Z"
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso restrito a estudantes
 */

/**
 * @swagger
 * /my-courses/{id}:
 *   get:
 *     summary: Obter detalhes do curso matriculado
 *     description: Retorna os detalhes completos de um curso específico em que o estudante está matriculado, incluindo progresso detalhado por aula.
 *     tags:
 *       - Student
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único do curso
 *     responses:
 *       200:
 *         description: Detalhes do curso retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courseId:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 progress:
 *                   type: number
 *                   example: 45.5
 *                 modules:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       classes:
 *                         type: array
 *                         items:
 *                           type: object
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso restrito a estudantes ou estudante não matriculado
 *       404:
 *         description: Curso não encontrado
 */

/**
 * @swagger
 * /courses/{id}/certificate:
 *   post:
 *     summary: Gerar certificado de conclusão
 *     description: Gera o certificado de conclusão do curso, desde que o estudante tenha completado 100% do conteúdo.
 *     tags:
 *       - Student
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único do curso
 *     responses:
 *       201:
 *         description: Certificado gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Certificado gerado com sucesso"
 *                 certificateHash:
 *                   type: string
 *                   example: "abc123hash"
 *       400:
 *         description: Curso não concluído (progresso inferior a 100%)
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso restrito a estudantes
 *       404:
 *         description: Curso não encontrado ou estudante não matriculado
 */
