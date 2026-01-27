import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Gerenciamento de Cursos Online',
      version: '1.0.0',
      description:
        'Documentação da API para o sistema de gerenciamento de cursos online.',
    },
    servers: [
      {
        url: 'http://localhost:3333',
        description: 'Servidor Local',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Gerenciamento de autenticação' },
      { name: 'Users', description: 'Gerenciamento de usuários' },
      {
        name: 'Categories',
        description: 'Gerenciamento de categorias de cursos',
      },
      { name: 'Courses', description: 'Gerenciamento de cursos' },
      { name: 'Modules', description: 'Gerenciamento de módulos de cursos' },
      { name: 'Classes', description: 'Gerenciamento de aulas e materiais' },
      { name: 'Reviews', description: 'Gerenciamento de avaliações de cursos' },
      { name: 'Cart', description: 'Gerenciamento de carrinho de compras' },
      {
        name: 'Student',
        description: 'Dashboard e funcionalidades do estudante',
      },
      {
        name: 'Certificates',
        description: 'Gerenciamento e validação de certificados',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
      },
    },
  },
  apis: ['./src/docs/*.doc.ts'], // Path to the API docs
};

export const specs = swaggerJsdoc(options);
