/**
 * @swagger
 * tags:
 *   name: Student
 *   description: Dashboard e funcionalidades do estudante
 */

/**
 * @swagger
 * /my-courses:
 *   get:
 *     summary: Lista cursos matriculados
 *     description: Retorna todos os cursos em que o estudante está matriculado, incluindo progresso.
 *     tags: [Student]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de cursos com progresso
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
 *                       courseId:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       progress:
 *                         type: number
 *                         description: Percentual de conclusão (0-100)
 *                         example: 45.5
 *                       enrolledAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso restrito a estudantes

/**
 * @swagger
 * /student/courses/{courseId}/certificate:
 *   post:
 *     summary: Gera certificado de conclusão
 *     description: Gera um certificado se o estudante completou 100% do curso.
 *     tags: [Student]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do curso
 *     responses:
 *       200:
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
 *         description: Curso não concluído (progresso menor que 100%)
 *       404:
 *         description: Curso não encontrado ou estudante não matriculado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso restrito a estudantes
 */
