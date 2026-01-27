/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Gerenciamento de carrinho de compras
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Visualiza o carrinho
 *     description: Retorna todos os cursos no carrinho do estudante autenticado.
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Carrinho obtido com sucesso
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
 *                       price:
 *                         type: number
 *                       instructorName:
 *                         type: string
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso restrito a estudantes

/**
 * @swagger
 * /cart/{courseId}:
 *   post:
 *     summary: Adiciona curso ao carrinho
 *     description: Adiciona um curso ao carrinho do estudante. Requer autenticação de estudante.
 *     tags: [Cart]
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
 *         description: Curso adicionado ao carrinho
 *       400:
 *         description: Curso já está no carrinho ou estudante já matriculado
 *       404:
 *         description: Curso não encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso restrito a estudantes

/**
 * @swagger
 * /cart/{courseId}:
 *   delete:
 *     summary: Remove curso do carrinho
 *     description: Remove um curso do carrinho do estudante.
 *     tags: [Cart]
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
 *         description: Curso removido do carrinho
 *       404:
 *         description: Curso não encontrado no carrinho
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso restrito a estudantes

/**
 * @swagger
 * /checkout:
 *   post:
 *     summary: Finaliza a compra
 *     description: Processa o checkout, criando matrículas para todos os cursos no carrinho e esvaziando o carrinho.
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {}
 *     responses:
 *       200:
 *         description: Compra finalizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Compra realizada com sucesso"
 *       400:
 *         description: Carrinho vazio
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso restrito a estudantes
 */
