# Log de Teste Completo da API

Data: 26/01/2026, 09:29:52


## Inicialização

ℹ️ **[INFO]** Iniciando Servidor de Teste na porta 3001...
✅ **[SUCESSO]** Servidor iniciado com sucesso.

## 1. Autenticação

> **Requisição**: `POST /auth/register/student`
> Corpo: ```json
{
  "name": "Estudante 1769430596020",
  "email": "student_1769430596020@test.com",
  "password": "Password123!"
}
```

> **Resposta**: Status `201`
> Corpo: ```json
{
  "data": {
    "id": "7f3bea3c-024d-48f1-9568-ae4e4497488b",
    "name": "Estudante 1769430596020",
    "email": "student_1769430596020@test.com",
    "role": "STUDENT",
    "createdAt": "2026-01-26T12:29:56.094Z"
  },
  "message": "Estudante registrado com sucesso"
}
```

✅ **[SUCESSO]** Registro de Estudante
> **Requisição**: `POST /auth/register/instructor`
> Corpo: ```json
{
  "name": "Instrutor 1769430596020",
  "email": "instructor_1769430596020@test.com",
  "password": "Password123!"
}
```

> **Resposta**: Status `201`
> Corpo: ```json
{
  "data": {
    "id": "c37f0b7f-6e3e-48d0-b948-7532325d1449",
    "name": "Instrutor 1769430596020",
    "email": "instructor_1769430596020@test.com",
    "role": "INSTRUCTOR",
    "createdAt": "2026-01-26T12:29:56.154Z"
  },
  "message": "Instrutor registrado com sucesso"
}
```

✅ **[SUCESSO]** Registro de Instrutor
> **Requisição**: `POST /auth/login`
> Corpo: ```json
{
  "email": "student_1769430596020@test.com",
  "password": "Password123!"
}
```

> **Resposta**: Status `200`
> Corpo: ```json
{
  "data": {
    "user": {
      "id": "7f3bea3c-024d-48f1-9568-ae4e4497488b",
      "name": "Estudante 1769430596020",
      "email": "student_1769430596020@test.com",
      "role": "STUDENT"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRXN0dWRhbnRlIDE3Njk0MzA1OTYwMjAiLCJpZCI6IjdmM2JlYTNjLTAyNGQtNDhmMS05NTY4LWFlNGU0NDk3NDg4YiIsInJvbGUiOiJTVFVERU5UIiwiaWF0IjoxNzY5NDMwNTk2LCJleHAiOjE3Njk0MzQxOTZ9.ICtwGFwhQpa3Pm8ib0nI7Ux0G8CfqZtgATb_YtbFzWA"
  },
  "message": "Login realizado com sucesso"
}
```

✅ **[SUCESSO]** Login Estudante
> **Requisição**: `POST /auth/login`
> Corpo: ```json
{
  "email": "instructor_1769430596020@test.com",
  "password": "Password123!"
}
```

> **Resposta**: Status `200`
> Corpo: ```json
{
  "data": {
    "user": {
      "id": "c37f0b7f-6e3e-48d0-b948-7532325d1449",
      "name": "Instrutor 1769430596020",
      "email": "instructor_1769430596020@test.com",
      "role": "INSTRUCTOR"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSW5zdHJ1dG9yIDE3Njk0MzA1OTYwMjAiLCJpZCI6ImMzN2YwYjdmLTZlM2UtNDhkMC1iOTQ4LTc1MzIzMjVkMTQ0OSIsInJvbGUiOiJJTlNUUlVDVE9SIiwiaWF0IjoxNzY5NDMwNTk2LCJleHAiOjE3Njk0MzQxOTZ9.Bb1YQAUoHC9-4ZUfBd7PwMnMHPU2AmF2-vQ_RezFg1Y"
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
    },
    {
      "id": "8e009147-72b8-4062-85b3-5efb23a3d047",
      "name": "Cover Test Cat"
    }
  ]
}
```

✅ **[SUCESSO]** Listar Categorias
ℹ️ **[INFO]** Usando ID de categoria existente: ede3e696-536a-4272-aac0-4cbfd98442b6

## 3. Gerenciamento de Cursos (Instrutor)

> **Requisição**: `POST /courses`
> Corpo: ```json
"[Dados Multipart]"
```

> **Resposta**: Status `201`
> Corpo: ```json
{
  "data": {
    "id": "93425141-aa16-4096-93bb-ae3832b9d017",
    "title": "Curso 1769430596020",
    "description": "Descrição do curso de teste",
    "price": 99.99,
    "coverImageUrl": "/storage/courses/curso_1769430596020/bf7a89c2-b9ed-4e35-a7eb-1636c2e0d63b.jpg",
    "instructorId": "c37f0b7f-6e3e-48d0-b948-7532325d1449",
    "categoryId": "ede3e696-536a-4272-aac0-4cbfd98442b6",
    "isActive": true,
    "createdAt": "2026-01-26T12:29:56.291Z"
  },
  "message": "Curso criado com sucesso"
}
```

✅ **[SUCESSO]** Criar Curso com Imagem
✅ **[SUCESSO]**   coverImageUrl presente na resposta
ℹ️ **[INFO]**   URL: /storage/courses/curso_1769430596020/bf7a89c2-b9ed-4e35-a7eb-1636c2e0d63b.jpg
✅ **[SUCESSO]**   Acesso público GET /courses/:id/cover
> **Requisição**: `POST /courses/93425141-aa16-4096-93bb-ae3832b9d017/modules`
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
    "id": "9cf788ad-f8b7-4c89-8b77-f3fb6b90e400",
    "title": "Módulo 1: Intro",
    "courseId": "93425141-aa16-4096-93bb-ae3832b9d017",
    "orderIndex": 1,
    "createdAt": "2026-01-26T12:29:56.392Z"
  },
  "message": "Módulo criado com sucesso"
}
```

✅ **[SUCESSO]** Criar Módulo
> **Requisição**: `POST /modules/9cf788ad-f8b7-4c89-8b77-f3fb6b90e400/classes`
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
    "id": "90c5084b-fc26-4cb7-8b4d-3368c016ca52",
    "title": "Aula 1: Olá Mundo",
    "description": "Primeira aula",
    "videoUrl": "https://youtube.com/watch?v=123",
    "moduleId": "9cf788ad-f8b7-4c89-8b77-f3fb6b90e400",
    "createdAt": "2026-01-26T12:29:56.396Z"
  },
  "message": "Aula criada com sucesso"
}
```

✅ **[SUCESSO]** Criar Aula
> **Requisição**: `GET /courses/authored`

> **Resposta**: Status `200`
> Corpo: ```json
{
  "data": [
    {
      "id": "93425141-aa16-4096-93bb-ae3832b9d017",
      "title": "Curso 1769430596020",
      "description": "Descrição do curso de teste",
      "price": 99.99,
      "coverImageUrl": "/storage/courses/curso_1769430596020/bf7a89c2-b9ed-4e35-a7eb-1636c2e0d63b.jpg",
      "isActive": true,
      "enrolledCount": 0,
      "category": {
        "name": "Cat 1769408330507"
      }
    }
  ]
}
```

✅ **[SUCESSO]** Listar Cursos do Instrutor (Authored)
✅ **[SUCESSO]**   Curso criado encontrado na lista
> **Requisição**: `POST /auth/register/instructor`
> Corpo: ```json
{
  "name": "Other Instr 1769430596020",
  "email": "other_1769430596020@test.com",
  "password": "Password123!"
}
```

> **Resposta**: Status `201`
> Corpo: ```json
{
  "data": {
    "id": "bb6cf085-9bb1-4eda-8744-8e6d53d91c78",
    "name": "Other Instr 1769430596020",
    "email": "other_1769430596020@test.com",
    "role": "INSTRUCTOR",
    "createdAt": "2026-01-26T12:29:56.463Z"
  },
  "message": "Instrutor registrado com sucesso"
}
```

> **Requisição**: `POST /auth/login`
> Corpo: ```json
{
  "email": "other_1769430596020@test.com",
  "password": "Password123!"
}
```

> **Resposta**: Status `200`
> Corpo: ```json
{
  "data": {
    "user": {
      "id": "bb6cf085-9bb1-4eda-8744-8e6d53d91c78",
      "name": "Other Instr 1769430596020",
      "email": "other_1769430596020@test.com",
      "role": "INSTRUCTOR"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiT3RoZXIgSW5zdHIgMTc2OTQzMDU5NjAyMCIsImlkIjoiYmI2Y2YwODUtOWJiMS00ZWRhLTg3NDQtOGU2ZDUzZDkxYzc4Iiwicm9sZSI6IklOU1RSVUNUT1IiLCJpYXQiOjE3Njk0MzA1OTYsImV4cCI6MTc2OTQzNDE5Nn0.Rig2ovGYaIyGV7Ni2yXiMDCXToUn8B_SlStoF6P_36o"
  },
  "message": "Login realizado com sucesso"
}
```

> **Requisição**: `GET /courses/authored`

> **Resposta**: Status `200`
> Corpo: ```json
{
  "data": []
}
```

✅ **[SUCESSO]**   Outro instrutor NÃO vê meu curso (Isolamento)

## 4. Storage & Materiais

> **Requisição**: `POST /auth/register/instructor`
> Corpo: ```json
{
  "name": "Malicious 1769430596020",
  "email": "hacker_1769430596020@test.com",
  "password": "Password123!"
}
```

> **Resposta**: Status `201`
> Corpo: ```json
{
  "data": {
    "id": "c8eb735f-fdfa-4220-9757-11858ba4fc40",
    "name": "Malicious 1769430596020",
    "email": "hacker_1769430596020@test.com",
    "role": "INSTRUCTOR",
    "createdAt": "2026-01-26T12:29:56.585Z"
  },
  "message": "Instrutor registrado com sucesso"
}
```

> **Requisição**: `POST /auth/login`
> Corpo: ```json
{
  "email": "hacker_1769430596020@test.com",
  "password": "Password123!"
}
```

> **Resposta**: Status `200`
> Corpo: ```json
{
  "data": {
    "user": {
      "id": "c8eb735f-fdfa-4220-9757-11858ba4fc40",
      "name": "Malicious 1769430596020",
      "email": "hacker_1769430596020@test.com",
      "role": "INSTRUCTOR"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTWFsaWNpb3VzIDE3Njk0MzA1OTYwMjAiLCJpZCI6ImM4ZWI3MzVmLWZkZmEtNDIyMC05NzU3LTExODU4YmE0ZmM0MCIsInJvbGUiOiJJTlNUUlVDVE9SIiwiaWF0IjoxNzY5NDMwNTk2LCJleHAiOjE3Njk0MzQxOTZ9.cxLmS_13B4KlWdSHWscyrQkpJcdbPT7sPJ6urjkqFwU"
  },
  "message": "Login realizado com sucesso"
}
```

> **Requisição**: `POST /classes/90c5084b-fc26-4cb7-8b4d-3368c016ca52/upload`
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
> **Requisição**: `POST /classes/90c5084b-fc26-4cb7-8b4d-3368c016ca52/upload`
> Corpo: ```json
"[Dados Multipart]"
```

> **Resposta**: Status `200`
> Corpo: ```json
{
  "data": {
    "materialUrl": "/storage/courses/curso_1769430596020/m_dulo_1__intro/1_aula_1__ol__mundo/materials/c0bb1045-2c08-49d4-bb27-91677db013f2.txt"
  },
  "message": "Material enviado com sucesso"
}
```

✅ **[SUCESSO]** Upload de Material
ℹ️ **[INFO]** URL retornado: /storage/courses/curso_1769430596020/m_dulo_1__intro/1_aula_1__ol__mundo/materials/c0bb1045-2c08-49d4-bb27-91677db013f2.txt
✅ **[SUCESSO]** Acesso Público Direto Bloqueado (Correto)
> **Requisição**: `GET /classes/90c5084b-fc26-4cb7-8b4d-3368c016ca52/material`

> **Resposta**: Status `200`
> Corpo: ```json
"Conteúdo de teste para upload."
```

✅ **[SUCESSO]** Download via Endpoint Protegido (Instrutor)
> **Requisição**: `GET /classes/90c5084b-fc26-4cb7-8b4d-3368c016ca52/material`

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
      "id": "56069046-d4cb-475c-a01d-cb4a29d1fcdb",
      "title": "Curso Storage Test",
      "description": "Testando estrutura de pastas",
      "price": 10,
      "coverImageUrl": null,
      "category": {
        "id": "ede3e696-536a-4272-aac0-4cbfd98442b6",
        "name": "Cat 1769408330507"
      },
      "instructor": {
        "name": "Instrutor Storage 1769413055428"
      }
    },
    {
      "id": "43e22fe0-c976-4eb3-a08f-17e66e2f5708",
      "title": "Curso 1769424888261",
      "description": "Descrição do curso de teste",
      "price": 99.99,
      "coverImageUrl": null,
      "category": {
        "id": "ede3e696-536a-4272-aac0-4cbfd98442b6",
        "name": "Cat 1769408330507"
      },
      "instructor": {
        "name": "Instrutor 1769424888261"
      }
    },
    {
      "id": "56099be0-9b5a-459f-aa08-c5d14a61fa81",
      "title": "Curso Com Capa",
      "description": "Curso de teste",
      "price": 50,
      "coverImageUrl": "/storage/courses/curso_com_capa/88f0ed2b-af3e-423d-8f2e-320eadf0b9fa.txt",
      "category": {
        "id": "ede3e696-536a-4272-aac0-4cbfd98442b6",
        "name": "Cat 1769408330507"
      },
      "instructor": {
        "name": "Instrutor Cover"
      }
    },
    {
      "id": "31c6fefe-5906-4b1d-a44b-9227066d6a43",
      "title": "Curso Com Capa",
      "description": "Curso de teste",
      "price": 50,
      "coverImageUrl": "/storage/courses/curso_com_capa/a9ae8ae1-d688-4c2f-ac48-3e7d7fa048fd.txt",
      "category": {
        "id": "ede3e696-536a-4272-aac0-4cbfd98442b6",
        "name": "Cat 1769408330507"
      },
      "instructor": {
        "name": "Instrutor Cover"
      }
    },
    {
      "id": "93425141-aa16-4096-93bb-ae3832b9d017",
      "title": "Curso 1769430596020",
      "description": "Descrição do curso de teste",
      "price": 99.99,
      "coverImageUrl": "/storage/courses/curso_1769430596020/bf7a89c2-b9ed-4e35-a7eb-1636c2e0d63b.jpg",
      "category": {
        "id": "ede3e696-536a-4272-aac0-4cbfd98442b6",
        "name": "Cat 1769408330507"
      },
      "instructor": {
        "name": "Instrutor 1769430596020"
      }
    }
  ],
  "meta": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 6,
    "itemsPerPage": 10
  }
}
```

✅ **[SUCESSO]** Listar Todos Cursos (Público)
> **Requisição**: `GET /courses/93425141-aa16-4096-93bb-ae3832b9d017`

> **Resposta**: Status `200`
> Corpo: ```json
{
  "data": {
    "id": "93425141-aa16-4096-93bb-ae3832b9d017",
    "title": "Curso 1769430596020",
    "description": "Descrição do curso de teste",
    "price": 99.99,
    "coverImageUrl": "/storage/courses/curso_1769430596020/bf7a89c2-b9ed-4e35-a7eb-1636c2e0d63b.jpg",
    "maxStudents": null,
    "enrolledCount": 0,
    "averageRating": 0,
    "createdAt": "2026-01-26T12:29:56.291Z",
    "category": {
      "id": "ede3e696-536a-4272-aac0-4cbfd98442b6",
      "name": "Cat 1769408330507"
    },
    "instructorId": "c37f0b7f-6e3e-48d0-b948-7532325d1449",
    "instructor": {
      "id": "c37f0b7f-6e3e-48d0-b948-7532325d1449",
      "name": "Instrutor 1769430596020",
      "email": "instructor_1769430596020@test.com"
    }
  }
}
```

✅ **[SUCESSO]** Obter Detalhes do Curso
> **Requisição**: `GET /courses/93425141-aa16-4096-93bb-ae3832b9d017/modules`

> **Resposta**: Status `200`
> Corpo: ```json
{
  "data": [
    {
      "id": "9cf788ad-f8b7-4c89-8b77-f3fb6b90e400",
      "title": "Módulo 1: Intro",
      "courseId": "93425141-aa16-4096-93bb-ae3832b9d017",
      "orderIndex": 1,
      "createdAt": "2026-01-26T12:29:56.392Z",
      "classes": [
        {
          "id": "90c5084b-fc26-4cb7-8b4d-3368c016ca52",
          "title": "Aula 1: Olá Mundo",
          "description": "Primeira aula",
          "videoUrl": "https://youtube.com/watch?v=123",
          "materialUrl": "/storage/courses/curso_1769430596020/m_dulo_1__intro/1_aula_1__ol__mundo/materials/c0bb1045-2c08-49d4-bb27-91677db013f2.txt",
          "moduleId": "9cf788ad-f8b7-4c89-8b77-f3fb6b90e400",
          "createdAt": "2026-01-26T12:29:56.396Z"
        }
      ]
    }
  ]
}
```

✅ **[SUCESSO]** Listar Módulos do Curso
> **Requisição**: `GET /modules/9cf788ad-f8b7-4c89-8b77-f3fb6b90e400`

> **Resposta**: Status `200`
> Corpo: ```json
{
  "data": {
    "id": "9cf788ad-f8b7-4c89-8b77-f3fb6b90e400",
    "title": "Módulo 1: Intro",
    "courseId": "93425141-aa16-4096-93bb-ae3832b9d017",
    "orderIndex": 1,
    "createdAt": "2026-01-26T12:29:56.392Z",
    "classes": [
      {
        "id": "90c5084b-fc26-4cb7-8b4d-3368c016ca52",
        "title": "Aula 1: Olá Mundo",
        "description": "Primeira aula",
        "videoUrl": "https://youtube.com/watch?v=123",
        "materialUrl": "/storage/courses/curso_1769430596020/m_dulo_1__intro/1_aula_1__ol__mundo/materials/c0bb1045-2c08-49d4-bb27-91677db013f2.txt",
        "moduleId": "9cf788ad-f8b7-4c89-8b77-f3fb6b90e400",
        "createdAt": "2026-01-26T12:29:56.396Z"
      }
    ]
  }
}
```

✅ **[SUCESSO]** Obter Detalhes do Módulo (+ Aulas)
✅ **[SUCESSO]**   Classes retornadas no módulo
> **Requisição**: `GET /classes/90c5084b-fc26-4cb7-8b4d-3368c016ca52`

> **Resposta**: Status `200`
> Corpo: ```json
{
  "data": {
    "id": "90c5084b-fc26-4cb7-8b4d-3368c016ca52",
    "title": "Aula 1: Olá Mundo",
    "description": "Primeira aula",
    "videoUrl": "https://youtube.com/watch?v=123",
    "materialUrl": "/classes/90c5084b-fc26-4cb7-8b4d-3368c016ca52/material",
    "moduleId": "9cf788ad-f8b7-4c89-8b77-f3fb6b90e400",
    "createdAt": "2026-01-26T12:29:56.396Z"
  }
}
```

✅ **[SUCESSO]** Obter Detalhes da Aula (Video/Material)
> **Requisição**: `POST /cart`
> Corpo: ```json
{
  "courseId": "93425141-aa16-4096-93bb-ae3832b9d017"
}
```

> **Resposta**: Status `201`
> Corpo: ```json
{
  "data": {
    "id": "a5b6d357-e7ec-4cf2-addf-2452c104862a",
    "userId": "7f3bea3c-024d-48f1-9568-ae4e4497488b",
    "courseId": "93425141-aa16-4096-93bb-ae3832b9d017",
    "addedAt": "2026-01-26T12:29:56.682Z"
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
    "orderDate": "2026-01-26T12:29:56.685Z",
    "items": [
      {
        "courseId": "93425141-aa16-4096-93bb-ae3832b9d017",
        "title": "Curso 1769430596020"
      }
    ]
  },
  "message": "Compra realizada com sucesso!"
}
```

✅ **[SUCESSO]** Realizar Checkout
> **Requisição**: `GET /classes/90c5084b-fc26-4cb7-8b4d-3368c016ca52/material`

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
      "id": "93425141-aa16-4096-93bb-ae3832b9d017",
      "title": "Curso 1769430596020",
      "description": "Descrição do curso de teste",
      "coverImageUrl": "/storage/courses/curso_1769430596020/bf7a89c2-b9ed-4e35-a7eb-1636c2e0d63b.jpg",
      "enrolledAt": "2026-01-26T12:29:56.685Z",
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
> **Requisição**: `POST /classes/90c5084b-fc26-4cb7-8b4d-3368c016ca52/progress`
> Corpo: ```json
{
  "completed": true
}
```

> **Resposta**: Status `201`
> Corpo: ```json
{
  "data": {
    "classId": "90c5084b-fc26-4cb7-8b4d-3368c016ca52",
    "userId": "7f3bea3c-024d-48f1-9568-ae4e4497488b",
    "completedAt": "2026-01-26T12:29:56.695Z"
  },
  "message": "Aula marcada como concluída"
}
```

✅ **[SUCESSO]** Marcar Aula Concluída
> **Requisição**: `POST /courses/93425141-aa16-4096-93bb-ae3832b9d017/reviews`
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
    "id": "a9fba650-654d-4a11-a8b8-84f031ab17c9",
    "userId": "7f3bea3c-024d-48f1-9568-ae4e4497488b",
    "courseId": "93425141-aa16-4096-93bb-ae3832b9d017",
    "rating": 5,
    "comment": "Excelente curso!",
    "createdAt": "2026-01-26T12:29:56.698Z"
  },
  "message": "Avaliação enviada com sucesso"
}
```

✅ **[SUCESSO]** Postar Avaliação

## 6. Limpeza (Instrutor)

> **Requisição**: `DELETE /courses/93425141-aa16-4096-93bb-ae3832b9d017`

> **Resposta**: Status `204`

✅ **[SUCESSO]** Excluir Curso

## Finalização

