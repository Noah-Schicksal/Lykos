/**
 * @swagger
 * tags:
 *   name: Certificates
 *   description: Gerenciamento e validação de certificados
 */

/**
 * @swagger
 * /student/certificates:
 *   get:
 *     summary: Lista certificados do estudante
 *     description: Retorna todos os certificados emitidos para o estudante autenticado.
 *     tags: [Certificates]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de certificados
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
 *                       id:
 *                         type: string
 *                       courseTitle:
 *                         type: string
 *                       hash:
 *                         type: string
 *                         description: Hash único para validação
 *                       issuedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso restrito a estudantes

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
 *                   example: "Certificado não encontrado"
 */
