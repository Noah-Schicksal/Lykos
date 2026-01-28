/**
 * @swagger
 * tags:
 *   - name: Cart
 *     description: Gerenciamento do carrinho de compras do estudante
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Visualizar carrinho
 *     description: Retorna os cursos atualmente adicionados ao carrinho do estudante autenticado.
 *     tags:
 *       - Cart
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Carrinho retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
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
 *                       price:
 *                         type: number
 *                         example: 199.9
 *                       instructorName:
 *                         type: string
 *                         example: "João Silva"
 *                 total:
 *                   type: number
 *                   example: 199.9
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso restrito a estudantes
 */

/**
 * @swagger
 * /cart/{courseId}:
 *   post:
 *     summary: Adicionar curso ao carrinho
 *     description: Adiciona um curso ao carrinho do estudante autenticado.
 *     tags:
 *       - Cart
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único do curso
 *     responses:
 *       200:
 *         description: Curso adicionado ao carrinho com sucesso
 *       400:
 *         description: Curso já está no carrinho ou estudante já matriculado
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso restrito a estudantes
 *       404:
 *         description: Curso não encontrado
 */

/**
 * @swagger
 * /cart/{courseId}:
 *   delete:
 *     summary: Remover curso do carrinho
 *     description: Remove um curso do carrinho do estudante autenticado.
 *     tags:
 *       - Cart
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador único do curso
 *     responses:
 *       200:
 *         description: Curso removido do carrinho com sucesso
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso restrito a estudantes
 *       404:
 *         description: Curso não encontrado no carrinho
 */
