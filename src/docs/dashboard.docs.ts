/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: |
 *     Endpoints responsáveis por fornecer visões consolidadas e métricas
 *     agregadas para os painéis do sistema. Esses endpoints não realizam
 *     operações de escrita e não representam recursos de domínio isolados.
 */

/**
 * @swagger
 * /dashboard/student:
 *   get:
 *     summary: Retorna dados do dashboard do estudante
 *     description: |
 *       Fornece uma visão geral do progresso acadêmico do estudante autenticado.
 *       Os dados retornados são utilizados exclusivamente para composição
 *       do painel inicial do estudante.
 *
 *       Este endpoint consolida informações de cursos, progresso, matrículas
 *       e certificados, evitando múltiplas chamadas no frontend.
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dados consolidados do dashboard do estudante
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCourses:
 *                   type: integer
 *                   description: Total de cursos em que o estudante está matriculado
 *                   example: 6
 *                 activeCourses:
 *                   type: integer
 *                   description: Cursos com progresso maior que 0% e menor que 100%
 *                   example: 4
 *                 completedCourses:
 *                   type: integer
 *                   description: Cursos concluídos (100%)
 *                   example: 2
 *                 averageProgress:
 *                   type: number
 *                   format: float
 *                   description: Média percentual de progresso em todos os cursos
 *                   example: 72.3
 *                 certificatesAvailable:
 *                   type: integer
 *                   description: Quantidade de certificados disponíveis para emissão
 *                   example: 2
 *                 lastAccessedCourses:
 *                   type: array
 *                   description: Últimos cursos acessados pelo estudante
 *                   items:
 *                     type: object
 *                     properties:
 *                       courseId:
 *                         type: string
 *                       title:
 *                         type: string
 *                       lastAccessedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso restrito a estudantes
 */
