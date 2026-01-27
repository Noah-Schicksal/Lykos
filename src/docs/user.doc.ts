/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gerenciamento de usuários
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Retorna o perfil do usuário logado
 *     description: Recupera os dados públicos do usuário atualmente autenticado com base no token JWT presente no cookie.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *                 role:
 *                   type: string
 *                   enum: [STUDENT, INSTRUCTOR]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Atualiza o perfil do usuário logado
 *     description: |
 *       Permite que o usuário autenticado atualize suas informações pessoais.
 *       Todos os campos são opcionais, atualize apenas o que desejar.
 *
 *       **Validações:**
 *       - Nome: mínimo 3 caracteres
 *       - Email: formato válido e único
 *       - Senha: mínimo 6 caracteres, deve conter letra maiúscula, minúscula, número e caractere especial
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 example: "Student Test"
 *                 description: Novo nome do usuário
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "student@test.com"
 *                 description: Novo e-mail (deve ser único)
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 format: password
 *                 example: "Password123!"
 *                 description: Nova senha (mínimo 6 caracteres, com maiúscula, minúscula, número e especial)
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Perfil atualizado com sucesso"
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
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "O nome deve ter no mínimo 3 caracteres"
 *       401:
 *         description: Não autorizado
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
 * /users/me:
 *   delete:
 *     summary: Exclui a conta do usuário logado
 *     description: Remove permanentemente a conta do usuário autenticado e todos os seus dados associados do sistema.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: Conta excluída com sucesso (sem conteúdo)
 *       401:
 *         description: Não autorizado
 */
