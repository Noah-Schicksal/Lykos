/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Gerenciamento de cursos - Endpoints públicos e privados para instrutores
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Listar todos os cursos
 *     description: |
 *       Retorna uma lista paginada de cursos públicos disponíveis na plataforma.
 *       Este endpoint é público e permite busca por texto e filtragem.
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página (paginação)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Quantidade de cursos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca para filtrar cursos (opcional)
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
 *                         format: uuid
 *                         example: "93425141-aa16-4096-93bb-ae3832b9d017"
 *                       title:
 *                         type: string
 *                         example: "JavaScript Avançado"
 *                       description:
 *                         type: string
 *                         example: "Curso completo de JavaScript moderno"
 *                       price:
 *                         type: number
 *                         format: float
 *                         example: 199.99
 *                       coverImageUrl:
 *                         type: string
 *                         nullable: true
 *                         example: "/storage/courses/javascript_avancado/cover.jpg"
 *                       maxStudents:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       enrolledCount:
 *                         type: number
 *                         example: 25
 *                       averageRating:
 *                         type: number
 *                         format: float
 *                         example: 4.5
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-01-26T12:29:56.291Z"
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
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro ao listar cursos"
 */

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Obter detalhes de um curso
 *     description: |
 *       Retorna todas as informações públicas de um curso específico.
 *       Inclui dados do instrutor, categoria e estatísticas.
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do curso (UUID)
 *         example: "93425141-aa16-4096-93bb-ae3832b9d017"
 *     responses:
 *       200:
 *         description: Detalhes do curso retornados com sucesso
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
 *                       format: uuid
 *                       example: "93425141-aa16-4096-93bb-ae3832b9d017"
 *                     title:
 *                       type: string
 *                       example: "JavaScript Avançado"
 *                     description:
 *                       type: string
 *                       example: "Curso completo de JavaScript moderno"
 *                     price:
 *                       type: number
 *                       format: float
 *                       example: 199.99
 *                     coverImageUrl:
 *                       type: string
 *                       nullable: true
 *                       example: "/storage/courses/javascript_avancado/cover.jpg"
 *                     maxStudents:
 *                       type: number
 *                       nullable: true
 *                       example: null
 *                     enrolledCount:
 *                       type: number
 *                       example: 25
 *                     averageRating:
 *                       type: number
 *                       format: float
 *                       example: 4.5
 *                     instructorId:
 *                       type: string
 *                       format: uuid
 *                       example: "c37f0b7f-6e3e-48d0-b948-7532325d1449"
 *                     categoryId:
 *                       type: string
 *                       format: uuid
 *                       example: "ede3e696-536a-4272-aac0-4cbfd98442b6"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-01-26T12:29:56.291Z"
 *       404:
 *         description: Curso não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Curso não encontrado"
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /courses/{id}/cover:
 *   get:
 *     summary: Obter imagem de capa do curso
 *     description: |
 *       Retorna a imagem de capa do curso (endpoint público para exibição).
 *       Serve o arquivo de imagem diretamente.
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do curso (UUID)
 *         example: "93425141-aa16-4096-93bb-ae3832b9d017"
 *     responses:
 *       200:
 *         description: Imagem retornada com sucesso
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Imagem não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Imagem de capa não encontrada"
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /courses/{id}/modules:
 *   get:
 *     summary: Listar módulos de um curso
 *     description: |
 *       Retorna todos os módulos associados ao curso, ordenados pelo orderIndex.
 *       Endpoint público para visualização da estrutura do curso.
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do curso (UUID)
 *         example: "93425141-aa16-4096-93bb-ae3832b9d017"
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
 *                         format: uuid
 *                         example: "9cf788ad-f8b7-4c89-8b77-f3fb6b90e400"
 *                       title:
 *                         type: string
 *                         example: "Módulo 1: Intro"
 *                       courseId:
 *                         type: string
 *                         format: uuid
 *                         example: "93425141-aa16-4096-93bb-ae3832b9d017"
 *                       orderIndex:
 *                         type: integer
 *                         example: 1
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-01-26T12:29:56.392Z"
 *       404:
 *         description: Curso não encontrado
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /courses/authored:
 *   get:
 *     summary: Listar cursos criados pelo instrutor
 *     description: |
 *       Retorna todos os cursos criados pelo instrutor autenticado.
 *       Usado para dashboard do instrutor gerenciar seus próprios cursos.
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cursos do instrutor retornados com sucesso
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
 *                         format: uuid
 *                         example: "93425141-aa16-4096-93bb-ae3832b9d017"
 *                       title:
 *                         type: string
 *                         example: "JavaScript Avançado"
 *                       description:
 *                         type: string
 *                         example: "Curso completo de JavaScript moderno"
 *                       price:
 *                         type: number
 *                         format: float
 *                         example: 199.99
 *                       coverImageUrl:
 *                         type: string
 *                         nullable: true
 *                         example: "/storage/courses/javascript_avancado/cover.jpg"
 *                       enrolledCount:
 *                         type: number
 *                         example: 25
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-01-26T12:29:56.291Z"
 *       401:
 *         description: Usuário não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Não autorizado"
 *       403:
 *         description: Acesso restrito a instrutores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Acesso negado"
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Criar um novo curso
 *     description: |
 *       Cria um novo curso na plataforma.
 *       Apenas usuários autenticados com perfil de Instrutor (INSTRUCTOR) podem criar cursos.
 *       Aceita upload de imagem de capa via multipart/form-data.
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
 *                 example: "JavaScript Avançado"
 *                 description: Título do curso
 *               description:
 *                 type: string
 *                 example: "Curso completo de JavaScript moderno"
 *                 description: Descrição detalhada do curso
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 199.99
 *                 description: Preço do curso
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 example: "ede3e696-536a-4272-aac0-4cbfd98442b6"
 *                 description: ID da categoria do curso
 *               maxStudents:
 *                 type: number
 *                 nullable: true
 *                 example: null
 *                 description: Número máximo de estudantes (opcional, null para ilimitado)
 *               coverImage:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem de capa (opcional, jpg/png)
 *     responses:
 *       201:
 *         description: Curso criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Curso criado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "93425141-aa16-4096-93bb-ae3832b9d017"
 *                     title:
 *                       type: string
 *                       example: "JavaScript Avançado"
 *                     description:
 *                       type: string
 *                       example: "Curso completo de JavaScript moderno"
 *                     price:
 *                       type: number
 *                       format: float
 *                       example: 199.99
 *                     coverImageUrl:
 *                       type: string
 *                       nullable: true
 *                       example: "/storage/courses/javascript_avancado/cover.jpg"
 *                     instructorId:
 *                       type: string
 *                       format: uuid
 *                       example: "c37f0b7f-6e3e-48d0-b948-7532325d1449"
 *                     categoryId:
 *                       type: string
 *                       format: uuid
 *                       example: "ede3e696-536a-4272-aac0-4cbfd98442b6"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-01-26T12:29:56.291Z"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "O título do curso deve ter no mínimo 3 caracteres."
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão (apenas INSTRUCTOR)
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /courses/{id}/modules:
 *   post:
 *     summary: Criar módulo em um curso
 *     description: |
 *       Cria um novo módulo dentro de um curso específico.
 *       Apenas o instrutor dono do curso pode adicionar módulos.
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do curso (UUID)
 *         example: "93425141-aa16-4096-93bb-ae3832b9d017"
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
 *                 example: "Módulo 1: Intro"
 *                 description: Título do módulo
 *               orderIndex:
 *                 type: integer
 *                 example: 1
 *                 description: Índice de ordenação do módulo
 *           example:
 *             title: "Módulo 1: Intro"
 *             orderIndex: 1
 *     responses:
 *       201:
 *         description: Módulo criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Módulo criado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "9cf788ad-f8b7-4c89-8b77-f3fb6b90e400"
 *                     title:
 *                       type: string
 *                       example: "Módulo 1: Intro"
 *                     courseId:
 *                       type: string
 *                       format: uuid
 *                       example: "93425141-aa16-4096-93bb-ae3832b9d017"
 *                     orderIndex:
 *                       type: integer
 *                       example: 1
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-01-26T12:29:56.392Z"
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão (não é dono do curso)
 *       404:
 *         description: Curso não encontrado
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: Atualizar um curso
 *     description: |
 *       Atualiza as informações de um curso existente.
 *       Apenas o instrutor dono do curso pode atualizá-lo.
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do curso a ser atualizado (UUID)
 *         example: "93425141-aa16-4096-93bb-ae3832b9d017"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "JavaScript Avançado - Edição 2026"
 *               description:
 *                 type: string
 *                 example: "Curso completo e atualizado de JavaScript moderno"
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 249.99
 *               maxStudents:
 *                 type: number
 *                 nullable: true
 *                 example: 100
 *           example:
 *             title: "JavaScript Avançado - Edição 2026"
 *             price: 249.99
 *     responses:
 *       200:
 *         description: Curso atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Curso atualizado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão (não é dono do curso)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Permissão para edição negada"
 *       404:
 *         description: Curso não encontrado
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Excluir um curso
 *     description: |
 *       Remove permanentemente um curso e todos os seus dados relacionados (módulos, aulas, materiais).
 *       Apenas o instrutor dono do curso pode excluí-lo.
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do curso a ser excluído (UUID)
 *         example: "93425141-aa16-4096-93bb-ae3832b9d017"
 *     responses:
 *       204:
 *         description: Curso excluído com sucesso (sem conteúdo na resposta)
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão (não é dono do curso)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Você não tem permissão para remover este curso"
 *       404:
 *         description: Curso não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Curso não encontrado"
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /courses/{id}/students:
 *   get:
 *     summary: Listar estudantes matriculados no curso
 *     description: |
 *       Retorna a lista de estudantes matriculados em um curso específico.
 *       Apenas o instrutor dono do curso pode acessar esta informação.
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do curso (UUID)
 *         example: "93425141-aa16-4096-93bb-ae3832b9d017"
 *     responses:
 *       200:
 *         description: Lista de estudantes retornada com sucesso
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
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       enrolledAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário sem permissão (não é dono do curso)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Você não tem permissão para ver os alunos deste curso"
 *       404:
 *         description: Curso não encontrado
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /courses/{id}/reviews:
 *   post:
 *     summary: Criar avaliação do curso
 *     description: |
 *       Permite que um estudante matriculado avalie um curso.
 *       Cada estudante pode criar apenas uma avaliação por curso.
 *     tags: [Courses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do curso (UUID)
 *         example: "93425141-aa16-4096-93bb-ae3832b9d017"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *                 description: Nota de 1 a 5 estrelas
 *               comment:
 *                 type: string
 *                 example: "Excelente curso! Recomendo."
 *                 description: Comentário sobre o curso
 *     responses:
 *       201:
 *         description: Avaliação criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Avaliação criada com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     rating:
 *                       type: integer
 *                     comment:
 *                       type: string
 *                     courseId:
 *                       type: string
 *                       format: uuid
 *                     studentId:
 *                       type: string
 *                       format: uuid
 *       400:
 *         description: Dados inválidos ou estudante já avaliou este curso
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário não matriculado no curso ou não é estudante
 *       404:
 *         description: Curso não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
