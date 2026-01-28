/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Gerenciamento de avaliações de cursos
 */

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Excluir avaliação
 *     description: |
 *       Permite que o autor da avaliação exclua permanentemente sua própria avaliação.
 *       Apenas o autor pode deletar sua avaliação.
 *     tags: [Reviews]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da avaliação (UUID)
 *         example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *     responses:
 *       204:
 *         description: Avaliação excluída com sucesso (sem conteúdo na resposta)
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Sem permissão para excluir esta avaliação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Você não tem permissão para excluir esta avaliação"
 *       404:
 *         description: Avaliação não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Avaliação não encontrada"
 *       500:
 *         description: Erro interno do servidor
 */
