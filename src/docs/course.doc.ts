/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Criação, listagem e gerenciamento de cursos da plataforma
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Lista cursos públicos
 *     description: >
 *       Retorna uma lista paginada de cursos públicos disponíveis.
 *       Permite filtragem opcional por categoria.
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Página atual da listagem
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Quantidade de cursos por página
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: ID da categoria para filtragem (opcional)
 *     responses:
 *       200:
 *         description: Lista de cursos retornada com sucesso
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
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                         format: float
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 */

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Detalha um curso
 *     description: Retorna todas as informações públicas de um curso específico.
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do curso
 *     responses:
 *       200:
 *         description: Curso encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: number
 *                 instructor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *       404:
 *         description: Curso não encontrado
 */
/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Detalha um curso
 *     description: Retorna todas as informações públicas de um curso específico.
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do curso
 *     responses:
 *       200:
 *         description: Curso encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: number
 *                 instructor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *       404:
 *         description: Curso não encontrado
 */
/**
 * @swagger
 * /courses/{id}/modules:
 *   get:
 *     summary: Lista módulos do curso
 *     description: Retorna todos os módulos associados ao curso, ordenados pelo índice.
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do curso
 *     responses:
 *       200:
 *         description: Módulos retornados com sucesso
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
 *                       title:
 *                         type: string
 *                       orderIndex:
 *                         type: integer
 *       404:
 *         description: Curso não encontrado
 */
/**
 * @swagger
 * /courses/authored:
 *   get:
 *     summary: Lista cursos do instrutor
 *     description: Retorna todos os cursos criados pelo instrutor autenticado.
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cursos do instrutor retornados
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
 *                       title:
 *                         type: string
 *                       status:
 *                         type: string
 *                         example: published
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Acesso restrito a instrutores
 */
/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Cria um curso
 *     description: >
 *       Cria um novo curso no sistema.
 *       Apenas instrutores autenticados podem criar cursos.
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description, price, categoryId]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               categoryId:
 *                 type: string
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Curso criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Apenas instrutores podem criar cursos
 */

