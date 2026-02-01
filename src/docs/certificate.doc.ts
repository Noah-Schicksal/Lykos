/**
 * @swagger
 * tags:
 *   name: Certificates
 *   description: Validação e gerenciamento de certificados
 */

/**
 * @swagger
 * /certificates/{hash}:
 *   get:
 *     summary: Valida um certificado
 *     description: Valida a autenticidade de um certificado através do seu hash único. Endpoint público.
 *     tags: [Certificates]
 *     parameters:
 *       - in: path
 *         name: hash
 *         required: true
 *         schema:
 *           type: string
 *         description: Hash único do certificado
 *         example: "abc123hash"
 *     responses:
 *       200:
 *         description: Certificado validado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 studentName:
 *                   type: string
 *                   example: "João Silva"
 *                 courseTitle:
 *                   type: string
 *                   example: "Curso de JavaScript Avançado"
 *                 issuedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Certificado não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Certificado não encontrado" */
/**
 * @swagger
 * /certificates/user/me:
 *   get:
 *     summary: Lista todos os certificados do usuário autenticado
 *     description: Retorna todos os certificados emitidos para o usuário logado com paginação
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Quantidade de itens por página
 *     responses:
 *       200:
 *         description: Lista de certificados do usuário
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
 *                       certificateHash:
 *                         type: string
 *                         example: "abc123-xyz789"
 *                       courseTitle:
 *                         type: string
 *                         example: "Curso de JavaScript Avançado"
 *                       studentName:
 *                         type: string
 *                         example: "João Silva"
 *                       instructorName:
 *                         type: string
 *                         example: "Maria Santos"
 *                       issuedAt:
 *                         type: string
 *                         format: date-time
 *                       isValid:
 *                         type: boolean
 *                         example: true
 *                 meta:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     totalItems:
 *                       type: integer
 *                       example: 25
 *                     itemsPerPage:
 *                       type: integer
 *                       example: 10
 *       401:
 *         description: Usuário não autenticado
 */
