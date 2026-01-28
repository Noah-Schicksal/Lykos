/**
 * @swagger
 * tags:
 *   - name: Checkout
 *     description: Finalização de compras e criação de matrículas
 */

/**
 * @swagger
 * /checkout:
 *   post:
 *     summary: Finalizar compra
 *     description: Processa o checkout do carrinho do estudante, criando matrículas para todos os cursos e limpando o carrinho.
 *     tags:
 *       - Checkout
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Corpo vazio, o checkout utiliza os dados do carrinho
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
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso restrito a estudantes
 */
