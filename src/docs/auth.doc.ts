/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Gerenciamento de autenticação
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza o login do usuário
 *     description: |
 *       Autentica um usuário existente e retorna seus dados.
 *       O token JWT é enviado APENAS como cookie httpOnly (não no body) para maior segurança.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: student@test.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         headers:
 *           Set-Cookie:
 *             description: Cookie httpOnly contendo o token JWT
 *             schema:
 *               type: string
 *               example: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly; Secure; SameSite=Strict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login realizado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     name:
 *                       type: string
 *                       example: "Student Test"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "student@test.com"
 *                     role:
 *                       type: string
 *                       enum: [STUDENT, INSTRUCTOR]
 *                       example: "STUDENT"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email ou senha incorretos"
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email ou senha incorretos"
 */

/**
 * @swagger
 * /auth/logout:
 *   delete:
 *     summary: Realiza o logout do usuário
 *     description: Remove o cookie de autenticação do navegador, encerrando a sessão do usuário.
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logout realizado com sucesso"
 */

/**
 * @swagger
 * /auth/register/student:
 *   post:
 *     summary: Registra um novo estudante
 *     description: |
 *       Cria uma nova conta de usuário com a função (role) de ESTUDANTE no sistema.
 *
 *       **Validações:**
 *       - Nome: mínimo 3 caracteres
 *       - Email: formato válido e único
 *       - Senha: mínimo 6 caracteres, deve conter:
 *         - Pelo menos uma letra maiúscula
 *         - Pelo menos uma letra minúscula
 *         - Pelo menos um número
 *         - Pelo menos um caractere especial (@$!%*?&#)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 example: "Student Test"
 *                 description: Nome completo do estudante
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "student@test.com"
 *                 description: E-mail válido e único
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 format: password
 *                 example: "Password123!"
 *                 description: Senha forte (min 6 chars, maiúscula, minúscula, número e especial)
 *     responses:
 *       201:
 *         description: Estudante registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Estudante registrado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: "STUDENT"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "A senha deve conter no mínimo 6 caracteres"
 *       409:
 *         description: E-mail já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Este e-mail já está cadastrado"
 */

/**
 * @swagger
 * /auth/register/instructor:
 *   post:
 *     summary: Registra um novo instrutor
 *     description: |
 *       Cria uma nova conta de usuário com a função (role) de INSTRUTOR no sistema,
 *       permitindo a criação e gestão de cursos.
 *
 *       **Validações:**
 *       - Nome: mínimo 3 caracteres
 *       - Email: formato válido e único
 *       - Senha: mínimo 6 caracteres, deve conter:
 *         - Pelo menos uma letra maiúscula
 *         - Pelo menos uma letra minúscula
 *         - Pelo menos um número
 *         - Pelo menos um caractere especial (@$!%*?&#)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 example: "Instructor Test"
 *                 description: Nome completo do instrutor
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "instructor@test.com"
 *                 description: E-mail válido e único
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 format: password
 *                 example: "Password123!"
 *                 description: Senha forte (min 6 chars, maiúscula, minúscula, número e especial)
 *     responses:
 *       201:
 *         description: Instrutor registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Instrutor registrado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: "INSTRUCTOR"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "A senha deve conter no mínimo 6 caracteres"
 *       409:
 *         description: E-mail já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Este e-mail já está cadastrado"
 */
