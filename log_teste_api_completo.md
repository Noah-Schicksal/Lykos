# Log de Teste Completo da API

Data: 26/01/2026, 03:55:32


## Inicialização

ℹ️ **[INFO]** Iniciando Servidor de Teste na porta 3001...
✅ **[SUCESSO]** Servidor iniciado com sucesso.

## 1. Autenticação

> **Requisição**: `POST /auth/register/student`
> Corpo: ```json
{
  "name": "Estudante 1769410533056",
  "email": "student_1769410533056@test.com",
  "password": "Password123!"
}
```

> **Resposta**: Status `201`
> Corpo: ```json
{
  "data": {
    "id": "c3c06613-4801-4fdb-a43c-fa64ae5115c1",
    "name": "Estudante 1769410533056",
    "email": "student_1769410533056@test.com",
    "role": "STUDENT",
    "createdAt": "2026-01-26T06:55:33.121Z"
  },
  "message": "Estudante registrado com sucesso"
}
```

✅ **[SUCESSO]** Registro de Estudante
> **Requisição**: `POST /auth/register/instructor`
> Corpo: ```json
{
  "name": "Instrutor 1769410533056",
  "email": "instructor_1769410533056@test.com",
  "password": "Password123!"
}
```

> **Resposta**: Status `201`
> Corpo: ```json
{
  "data": {
    "id": "ccef82f8-3b2f-4f96-9a89-598bc710f7ed",
    "name": "Instrutor 1769410533056",
    "email": "instructor_1769410533056@test.com",
    "role": "INSTRUCTOR",
    "createdAt": "2026-01-26T06:55:33.177Z"
  },
  "message": "Instrutor registrado com sucesso"
}
```

✅ **[SUCESSO]** Registro de Instrutor
> **Requisição**: `POST /auth/login`
> Corpo: ```json
{
  "email": "student_1769410533056@test.com",
  "password": "Password123!"
}
```

> **Resposta**: Status `200`
> Corpo: ```json
{
  "data": {
    "user": {
      "id": "c3c06613-4801-4fdb-a43c-fa64ae5115c1",
      "name": "Estudante 1769410533056",
      "email": "student_1769410533056@test.com",
      "role": "STUDENT"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRXN0dWRhbnRlIDE3Njk0MTA1MzMwNTYiLCJpZCI6ImMzYzA2NjEzLTQ4MDEtNGZkYi1hNDNjLWZhNjRhZTUxMTVjMSIsInJvbGUiOiJTVFVERU5UIiwiaWF0IjoxNzY5NDEwNTMzLCJleHAiOjE3Njk0MTQxMzN9.XH3Yr99xi7CT-5DS6Y6X9_KJOpFNAUqmlmMgz6hGiZA"
  },
  "message": "Login realizado com sucesso"
}
```

✅ **[SUCESSO]** Login Estudante
> **Requisição**: `POST /auth/login`
> Corpo: ```json
{
  "email": "instructor_1769410533056@test.com",
  "password": "Password123!"
}
```

> **Resposta**: Status `200`
> Corpo: ```json
{
  "data": {
    "user": {
      "id": "ccef82f8-3b2f-4f96-9a89-598bc710f7ed",
      "name": "Instrutor 1769410533056",
      "email": "instructor_1769410533056@test.com",
      "role": "INSTRUCTOR"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSW5zdHJ1dG9yIDE3Njk0MTA1MzMwNTYiLCJpZCI6ImNjZWY4MmY4LTNiMmYtNGY5Ni05YTg5LTU5OGJjNzEwZjdlZCIsInJvbGUiOiJJTlNUUlVDVE9SIiwiaWF0IjoxNzY5NDEwNTMzLCJleHAiOjE3Njk0MTQxMzN9.JiQzGKaH3nLqlFpne-YuvZVhnnwry0zD1aPpKb8UIK0"
  },
  "message": "Login realizado com sucesso"
}
```

✅ **[SUCESSO]** Login Instrutor

## 2. Categorias (Instrutor/Admin)

> **Requisição**: `GET /categories`

> **Resposta**: Status `200`
> Corpo: ```json
{
  "data": [
    {
      "id": "ede3e696-536a-4272-aac0-4cbfd98442b6",
      "name": "Cat 1769408330507"
    }
  ]
}
```

✅ **[SUCESSO]** Listar Categorias
ℹ️ **[INFO]** Usando ID de categoria existente: ede3e696-536a-4272-aac0-4cbfd98442b6

## 3. Gerenciamento de Cursos (Instrutor)

> **Requisição**: `POST /courses`
> Corpo: ```json
{
  "title": "Curso 1769410533056",
  "description": "Descrição do curso de teste",
  "price": 99.99,
  "categoryId": "ede3e696-536a-4272-aac0-4cbfd98442b6"
}
```

> **Resposta**: Status `201`
> Corpo: ```json
{
  "data": {
    "id": "d82b0505-f544-4a1f-b2f9-54cfec2152f1",
    "title": "Curso 1769410533056",
    "description": "Descrição do curso de teste",
    "price": 99.99,
    "instructorId": "ccef82f8-3b2f-4f96-9a89-598bc710f7ed",
    "categoryId": "ede3e696-536a-4272-aac0-4cbfd98442b6",
    "isActive": true,
    "createdAt": "2026-01-26T06:55:33.303Z"
  },
  "message": "Curso criado com sucesso"
}
```

✅ **[SUCESSO]** Criar Curso
> **Requisição**: `POST /courses/d82b0505-f544-4a1f-b2f9-54cfec2152f1/modules`
> Corpo: ```json
{
  "title": "Módulo 1: Intro",
  "orderIndex": 1
}
```

> **Resposta**: Status `201`
> Corpo: ```json
{
  "data": {
    "id": "473c3848-f655-4ff0-9ccd-02f5bc1979f2",
    "title": "Módulo 1: Intro",
    "courseId": "d82b0505-f544-4a1f-b2f9-54cfec2152f1",
    "orderIndex": 1,
    "createdAt": "2026-01-26T06:55:33.306Z"
  },
  "message": "Módulo criado com sucesso"
}
```

✅ **[SUCESSO]** Criar Módulo
> **Requisição**: `POST /modules/473c3848-f655-4ff0-9ccd-02f5bc1979f2/classes`
> Corpo: ```json
{
  "title": "Aula 1: Olá Mundo",
  "description": "Primeira aula",
  "videoUrl": "https://youtube.com/watch?v=123",
  "orderIndex": 1
}
```

> **Resposta**: Status `201`
> Corpo: ```json
{
  "data": {
    "id": "94d7c2e2-8732-4951-87d1-f106d9abcc9a",
    "title": "Aula 1: Olá Mundo",
    "description": "Primeira aula",
    "videoUrl": "https://youtube.com/watch?v=123",
    "moduleId": "473c3848-f655-4ff0-9ccd-02f5bc1979f2",
    "createdAt": "2026-01-26T06:55:33.310Z"
  },
  "message": "Aula criada com sucesso"
}
```

✅ **[SUCESSO]** Criar Aula

## 4. Storage & Materiais

> **Requisição**: `POST /auth/register/instructor`
> Corpo: ```json
{
  "name": "Malicious 1769410533056",
  "email": "hacker_1769410533056@test.com",
  "password": "Password123!"
}
```

> **Resposta**: Status `201`
> Corpo: ```json
{
  "data": {
    "id": "780b4c17-6e33-4dec-81ab-0f52659cef0e",
    "name": "Malicious 1769410533056",
    "email": "hacker_1769410533056@test.com",
    "role": "INSTRUCTOR",
    "createdAt": "2026-01-26T06:55:33.365Z"
  },
  "message": "Instrutor registrado com sucesso"
}
```

> **Requisição**: `POST /auth/login`
> Corpo: ```json
{
  "email": "hacker_1769410533056@test.com",
  "password": "Password123!"
}
```

> **Resposta**: Status `200`
> Corpo: ```json
{
  "data": {
    "user": {
      "id": "780b4c17-6e33-4dec-81ab-0f52659cef0e",
      "name": "Malicious 1769410533056",
      "email": "hacker_1769410533056@test.com",
      "role": "INSTRUCTOR"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTWFsaWNpb3VzIDE3Njk0MTA1MzMwNTYiLCJpZCI6Ijc4MGI0YzE3LTZlMzMtNGRlYy04MWFiLTBmNTI2NTljZWYwZSIsInJvbGUiOiJJTlNUUlVDVE9SIiwiaWF0IjoxNzY5NDEwNTMzLCJleHAiOjE3Njk0MTQxMzN9.hES_8f0Mfklr-c6NGFTKaG2I3cYg-EBtPgQgEuecRE4"
  },
  "message": "Login realizado com sucesso"
}
```

> **Requisição**: `POST /classes/94d7c2e2-8732-4951-87d1-f106d9abcc9a/upload`
> Corpo: ```json
"[Dados Multipart]"
```

> **Resposta**: Status `400`
> Corpo: ```json
{
  "error": "Você não tem permissão para adicionar materiais a esta aula"
}
```

✅ **[SUCESSO]** Segurança: Bloqueio de Upload por Outro Instrutor
> **Requisição**: `POST /classes/94d7c2e2-8732-4951-87d1-f106d9abcc9a/upload`
> Corpo: ```json
"[Dados Multipart]"
```

> **Resposta**: Status `200`
> Corpo: ```json
{
  "data": {
    "materialUrl": "/storage/courses/curso_1769410533056/m_dulo_1__intro/1_aula_1__ol__mundo/materials/3e9f10a4-ca58-4058-9864-399c4b62011a.txt"
  },
  "message": "Material enviado com sucesso"
}
```

✅ **[SUCESSO]** Upload de Material
ℹ️ **[INFO]** URL retornado: /storage/courses/curso_1769410533056/m_dulo_1__intro/1_aula_1__ol__mundo/materials/3e9f10a4-ca58-4058-9864-399c4b62011a.txt
✅ **[SUCESSO]** Acesso Público Direto Bloqueado (Correto)
> **Requisição**: `GET /classes/94d7c2e2-8732-4951-87d1-f106d9abcc9a/material`

> **Resposta**: Status `200`
> Corpo: ```json
"Conteúdo de teste para upload."
```

✅ **[SUCESSO]** Download via Endpoint Protegido (Instrutor)
> **Requisição**: `GET /classes/94d7c2e2-8732-4951-87d1-f106d9abcc9a/material`

> **Resposta**: Status `400`
> Corpo: ```json
{
  "error": "Você precisa estar matriculado no curso para acessar o material"
}
```

✅ **[SUCESSO]** Bloqueio Aluno Não Matriculado

## 5. Jornada do Estudante

> **Requisição**: `GET /courses`

> **Resposta**: Status `200`
> Corpo: ```json
{
  "data": [
    {
      "id": "1652fd8d-72fd-4e8c-8d53-03fb267b2864",
      "title": "Course 1769408330507",
      "description": "A test course description",
      "price": 99.99,
      "coverImageUrl": null,
      "category": {
        "id": "ede3e696-536a-4272-aac0-4cbfd98442b6",
        "name": "Cat 1769408330507"
      },
      "instructor": {
        "name": "Instructor 1769408330507"
      }
    },
    {
      "id": "d82b0505-f544-4a1f-b2f9-54cfec2152f1",
      "title": "Curso 1769410533056",
      "description": "Descrição do curso de teste",
      "price": 99.99,
      "coverImageUrl": null,
      "category": {
        "id": "ede3e696-536a-4272-aac0-4cbfd98442b6",
        "name": "Cat 1769408330507"
      },
      "instructor": {
        "name": "Instrutor 1769410533056"
      }
    }
  ],
  "meta": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 2,
    "itemsPerPage": 10
  }
}
```

✅ **[SUCESSO]** Listar Todos Cursos (Público)
> **Requisição**: `GET /courses/d82b0505-f544-4a1f-b2f9-54cfec2152f1`

> **Resposta**: Status `200`
> Corpo: ```json
{
  "data": {
    "id": "d82b0505-f544-4a1f-b2f9-54cfec2152f1",
    "title": "Curso 1769410533056",
    "description": "Descrição do curso de teste",
    "price": 99.99,
    "coverImageUrl": null,
    "maxStudents": null,
    "enrolledCount": 0,
    "averageRating": 0,
    "createdAt": "2026-01-26T06:55:33.303Z",
    "category": {
      "id": "ede3e696-536a-4272-aac0-4cbfd98442b6",
      "name": "Cat 1769408330507"
    },
    "instructorId": "ccef82f8-3b2f-4f96-9a89-598bc710f7ed",
    "instructor": {
      "id": "ccef82f8-3b2f-4f96-9a89-598bc710f7ed",
      "name": "Instrutor 1769410533056",
      "email": "instructor_1769410533056@test.com"
    }
  }
}
```

✅ **[SUCESSO]** Obter Detalhes do Curso
> **Requisição**: `POST /cart`
> Corpo: ```json
{
  "courseId": "d82b0505-f544-4a1f-b2f9-54cfec2152f1"
}
```

> **Resposta**: Status `201`
> Corpo: ```json
{
  "data": {
    "id": "e6171dd7-7bd6-44b7-8cb3-2b3576521335",
    "userId": "c3c06613-4801-4fdb-a43c-fa64ae5115c1",
    "courseId": "d82b0505-f544-4a1f-b2f9-54cfec2152f1",
    "addedAt": "2026-01-26T06:55:33.459Z"
  },
  "message": "Curso adicionado ao carrinho"
}
```

✅ **[SUCESSO]** Adicionar ao Carrinho
> **Requisição**: `POST /checkout`
> Corpo: ```json
{}
```

> **Resposta**: Status `201`
> Corpo: ```json
{
  "data": {
    "enrolledCourses": 1,
    "orderDate": "2026-01-26T06:55:33.463Z",
    "items": [
      {
        "courseId": "d82b0505-f544-4a1f-b2f9-54cfec2152f1",
        "title": "Curso 1769410533056"
      }
    ]
  },
  "message": "Compra realizada com sucesso!"
}
```

✅ **[SUCESSO]** Realizar Checkout
> **Requisição**: `GET /classes/94d7c2e2-8732-4951-87d1-f106d9abcc9a/material`

> **Resposta**: Status `200`
> Corpo: ```json
"Conteúdo de teste para upload."
```

✅ **[SUCESSO]** Download via Endpoint Protegido (Aluno Matriculado)
> **Requisição**: `GET /my-courses`

> **Resposta**: Status `200`
> Corpo: ```json
{
  "data": [
    {
      "id": "d82b0505-f544-4a1f-b2f9-54cfec2152f1",
      "title": "Curso 1769410533056",
      "description": "Descrição do curso de teste",
      "coverImageUrl": null,
      "enrolledAt": "2026-01-26T06:55:33.463Z",
      "progress": 0,
      "totalClasses": 1,
      "completedClasses": 0,
      "certificateHash": null
    }
  ],
  "meta": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10
  },
  "message": "Cursos listados com sucesso"
}
```

✅ **[SUCESSO]** Obter Meus Cursos
> **Requisição**: `POST /classes/94d7c2e2-8732-4951-87d1-f106d9abcc9a/progress`
> Corpo: ```json
{
  "completed": true
}
```

> **Resposta**: Status `201`
> Corpo: ```json
{
  "data": {
    "classId": "94d7c2e2-8732-4951-87d1-f106d9abcc9a",
    "userId": "c3c06613-4801-4fdb-a43c-fa64ae5115c1",
    "completedAt": "2026-01-26T06:55:33.471Z"
  },
  "message": "Aula marcada como concluída"
}
```

✅ **[SUCESSO]** Marcar Aula Concluída
> **Requisição**: `POST /courses/d82b0505-f544-4a1f-b2f9-54cfec2152f1/reviews`
> Corpo: ```json
{
  "rating": 5,
  "comment": "Excelente curso!"
}
```

> **Resposta**: Status `201`
> Corpo: ```json
{
  "data": {
    "id": "e6b58913-f8f1-4acd-afe8-4ee2c4a19486",
    "userId": "c3c06613-4801-4fdb-a43c-fa64ae5115c1",
    "courseId": "d82b0505-f544-4a1f-b2f9-54cfec2152f1",
    "rating": 5,
    "comment": "Excelente curso!",
    "createdAt": "2026-01-26T06:55:33.473Z"
  },
  "message": "Avaliação enviada com sucesso"
}
```

✅ **[SUCESSO]** Postar Avaliação

## 6. Limpeza (Instrutor)

> **Requisição**: `DELETE /courses/d82b0505-f544-4a1f-b2f9-54cfec2152f1`

> **Resposta**: Status `204`

✅ **[SUCESSO]** Excluir Curso

## Finalização

