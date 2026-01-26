# Log de Teste Completo da API

Data: 26/01/2026, 07:54:48


## Inicialização

ℹ️ **[INFO]** Iniciando Servidor de Teste na porta 3001...
✅ **[SUCESSO]** Servidor iniciado com sucesso.

## 1. Autenticação

> **Requisição**: `POST /auth/register/student`
> Corpo: ```json
{
  "name": "Estudante 1769424888261",
  "email": "student_1769424888261@test.com",
  "password": "Password123!"
}
```

> **Resposta**: Status `201`
> Corpo: ```json
{
  "data": {
    "id": "5132af22-6378-4a31-80ca-dbc0e3d3a09e",
    "name": "Estudante 1769424888261",
    "email": "student_1769424888261@test.com",
    "role": "STUDENT",
    "createdAt": "2026-01-26T10:54:48.312Z"
  },
  "message": "Estudante registrado com sucesso"
}
```

✅ **[SUCESSO]** Registro de Estudante
> **Requisição**: `POST /auth/register/instructor`
> Corpo: ```json
{
  "name": "Instrutor 1769424888261",
  "email": "instructor_1769424888261@test.com",
  "password": "Password123!"
}
```

> **Resposta**: Status `201`
> Corpo: ```json
{
  "data": {
    "id": "5a16df34-46e0-48f0-b4b1-d20da18d3877",
    "name": "Instrutor 1769424888261",
    "email": "instructor_1769424888261@test.com",
    "role": "INSTRUCTOR",
    "createdAt": "2026-01-26T10:54:48.365Z"
  },
  "message": "Instrutor registrado com sucesso"
}
```

✅ **[SUCESSO]** Registro de Instrutor
> **Requisição**: `POST /auth/login`
> Corpo: ```json
{
  "email": "student_1769424888261@test.com",
  "password": "Password123!"
}
```

> **Resposta**: Status `200`
> Corpo: ```json
{
  "data": {
    "user": {
      "id": "5132af22-6378-4a31-80ca-dbc0e3d3a09e",
      "name": "Estudante 1769424888261",
      "email": "student_1769424888261@test.com",
      "role": "STUDENT"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRXN0dWRhbnRlIDE3Njk0MjQ4ODgyNjEiLCJpZCI6IjUxMzJhZjIyLTYzNzgtNGEzMS04MGNhLWRiYzBlM2QzYTA5ZSIsInJvbGUiOiJTVFVERU5UIiwiaWF0IjoxNzY5NDI0ODg4LCJleHAiOjE3Njk0Mjg0ODh9.JMG6Fe7ipXvzRZwUftshoMQU5u4mdhdqH_6UCkltUqE"
  },
  "message": "Login realizado com sucesso"
}
```

✅ **[SUCESSO]** Login Estudante
> **Requisição**: `POST /auth/login`
> Corpo: ```json
{
  "email": "instructor_1769424888261@test.com",
  "password": "Password123!"
}
```

> **Resposta**: Status `200`
> Corpo: ```json
{
  "data": {
    "user": {
      "id": "5a16df34-46e0-48f0-b4b1-d20da18d3877",
      "name": "Instrutor 1769424888261",
      "email": "instructor_1769424888261@test.com",
      "role": "INSTRUCTOR"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSW5zdHJ1dG9yIDE3Njk0MjQ4ODgyNjEiLCJpZCI6IjVhMTZkZjM0LTQ2ZTAtNDhmMC1iNGIxLWQyMGRhMThkMzg3NyIsInJvbGUiOiJJTlNUUlVDVE9SIiwiaWF0IjoxNzY5NDI0ODg4LCJleHAiOjE3Njk0Mjg0ODh9.96uoNhyS6p8CDGzzehxi8jPkqK4VGbQhM5zMzw3CabQ"
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
  "title": "Curso 1769424888261",
  "description": "Descrição do curso de teste",
  "price": 99.99,
  "categoryId": "ede3e696-536a-4272-aac0-4cbfd98442b6"
}
```

> **Resposta**: Status `201`
> Corpo: ```json
{
  "data": {
    "id": "43e22fe0-c976-4eb3-a08f-17e66e2f5708",
    "title": "Curso 1769424888261",
    "description": "Descrição do curso de teste",
    "price": 99.99,
    "instructorId": "5a16df34-46e0-48f0-b4b1-d20da18d3877",
    "categoryId": "ede3e696-536a-4272-aac0-4cbfd98442b6",
    "isActive": true,
    "createdAt": "2026-01-26T10:54:48.476Z"
  },
  "message": "Curso criado com sucesso"
}
```

✅ **[SUCESSO]** Criar Curso
> **Requisição**: `POST /courses/43e22fe0-c976-4eb3-a08f-17e66e2f5708/modules`
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
    "id": "a09f81b0-0d3f-4a49-b908-3b3543de6e46",
    "title": "Módulo 1: Intro",
    "courseId": "43e22fe0-c976-4eb3-a08f-17e66e2f5708",
    "orderIndex": 1,
    "createdAt": "2026-01-26T10:54:48.480Z"
  },
  "message": "Módulo criado com sucesso"
}
```

✅ **[SUCESSO]** Criar Módulo
> **Requisição**: `POST /modules/a09f81b0-0d3f-4a49-b908-3b3543de6e46/classes`
> Corpo: ```json
{
  "title": "Aula 1: Olá Mundo",
  "description": "Primeira aula",
  "videoUrl": "https://youtube.com/watch?v=123",
  "orderIndex": 1
}
```

⚠️ **[ERRO]** Erro na Requisição: fetch failed
❌ **[FALHA]** Criar Aula
> **Requisição**: `GET /courses/authored`

⚠️ **[ERRO]** Erro na Requisição: fetch failed
❌ **[FALHA]** Listar Cursos do Instrutor (Authored)
> **Requisição**: `POST /auth/register/instructor`
> Corpo: ```json
{
  "name": "Other Instr 1769424888261",
  "email": "other_1769424888261@test.com",
  "password": "Password123!"
}
```

⚠️ **[ERRO]** Erro na Requisição: fetch failed
> **Requisição**: `POST /auth/login`
> Corpo: ```json
{
  "email": "other_1769424888261@test.com",
  "password": "Password123!"
}
```

> **Resposta**: Status `408`

⚠️ **[ERRO]** Erro Fatal no Teste: Cannot read properties of undefined (reading 'token')

## Finalização

