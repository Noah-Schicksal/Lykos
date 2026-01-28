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
 * /cart:
 *   post:
 *     summary: Adicionar curso ao carrinho
 *     description: Adiciona um curso ao carrinho do estudante autenticado.
 *     tags:
 *       - Cart
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *                 example: "uuid-do-curso"
 *                 description: Identificador único do curso
 *     responses:
 *       201:
 *         description: Curso adicionado ao carrinho com sucesso
 *       400:
 *         description: Estudante já está matriculado no curso
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso restrito a estudantes
 *       404:
 *         description: Curso não encontrado
 *       409:
 *         description: Curso já está no carrinho
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
 *       204:
 *         description: Curso removido do carrinho com sucesso (sem conteúdo na resposta)
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso restrito a estudantes
 *       404:
 *         description: Curso não encontrado no carrinho
 */

/**
 * @swagger
 * /checkout:
 *   post:
 *     summary: Finalizar compra
 *     description: Processa o checkout do carrinho do estudante, criando matrículas para todos os cursos e limpando o carrinho.
 *     tags:
 *       - Cart
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Corpo vazio (opcional)
 *             example: {}
 *     responses:
 *       201:
 *         description: Compra finalizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Compra realizada com sucesso"
 *                 data:
 *                   type: object
 *                   description: Dados das matrículas criadas
 *       400:
 *         description: Carrinho vazio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "O carrinho está vazio"
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso restrito a estudantes
 */
