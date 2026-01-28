/**
 * @swagger
 * tags:
 *   name: Certificates
 *   description: Validação de certificados
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
 *                   example: "Certificado não encontrado"
 */
