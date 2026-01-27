/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Gerenciamento de cursos
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Lista todos os cursos
 *     description: Retorna uma lista paginada de todos os cursos públicos disponíveis.
 *     tags: [Courses]
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
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por ID da categoria (opcional)
 *     responses:
 *       200:
 *         description: Lista de cursos obtida com sucesso
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
 *     summary: Obtém detalhes de um curso
 *     description: Retorna as informações detalhadas de um curso específico.
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
 *         description: Detalhes do curso
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
 * /courses/{id}/cover:
 *   get:
 *     summary: Obtém a imagem de capa do curso
 *     description: Retorna o arquivo de imagem da capa do curso.
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
 *         description: Imagem recuperada com sucesso
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Capa não encontrada
 */

/**
 * @swagger
 * /courses/{id}/modules:
 *   get:
 *     summary: Lista módulos do curso
 *     description: Retorna a lista de módulos associados a um curso.
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
 *         description: Lista de módulos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   orderIndex:
 *                     type: integer
 *       404:
 *         description: Curso não encontrado
 */

/**
 * @swagger
 * /courses/authored:
 *   get:
 *     summary: Lista cursos de autoria do instrutor
 *     description: Retorna todos os cursos criados pelo instrutor logado.
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de cursos do instrutor
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
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso restrito a instrutores
 */

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Cria um novo curso
 *     description: Cria um novo curso no sistema. Permite upload da imagem de capa. Requer autenticação de Instrutor.
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - categoryId
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Novo Curso de JavaScript"
 *               description:
 *                 type: string
 *                 example: "Aprenda JavaScript do zero"
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 99.90
 *               categoryId:
 *                 type: string
 *                 example: "1"
 *               coverImage:
 *                 type: string
 *                 format: binary
 *                 description: Imagem de capa do curso (opcional)
 *     responses:
 *       201:
 *         description: Curso criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso restrito a instrutores
 */

/**
 * @swagger
 * /courses/{id}/modules:
 *   post:
 *     summary: Adiciona um módulo ao curso
 *     description: Cria um novo módulo dentro de um curso específico. Requer autenticação de Instrutor.
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do curso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - orderIndex
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Introdução ao JavaScript"
 *               orderIndex:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Módulo criado com sucesso
 *       404:
 *         description: Curso não encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso restrito a instrutores
 */

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: Atualiza um curso
 *     description: Atualiza as informações de um curso existente. Apenas o instrutor autor pode atualizar.
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do curso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Curso Atualizado"
 *               description:
 *                 type: string
 *                 example: "Descrição atualizada do curso"
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 149.90
 *     responses:
 *       200:
 *         description: Curso atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *       404:
 *         description: Curso não encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido (somente o autor pode editar)
 */

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Exclui um curso
 *     description: Remove permanentemente um curso e todos os seus módulos/aulas. Requer autenticação de Instrutor.
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do curso
 *     responses:
 *       200:
 *         description: Curso excluído com sucesso
 *       404:
 *         description: Curso não encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido (somente o autor pode excluir)
 */

/**
 * @swagger
 * /courses/{id}/cover:
 *   put:
 *     summary: Atualiza a capa do curso
 *     description: Atualiza apenas a imagem de capa do curso. Requer autenticação de Instrutor.
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do curso
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - coverImage
 *             properties:
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Capa atualizada com sucesso
 *       404:
 *         description: Curso não encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido
 */
