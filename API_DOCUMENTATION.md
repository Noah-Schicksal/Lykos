# 📘 Documentação Completa da API

Esta documentação fornece uma referência detalhada para integração com a API do sistema de cursos. Todos os exemplos utilizam `async/await` e seguem padrões modernos de JavaScript.

---

## ⚙️ Configuração Inicial do Frontend

Para consumir a API, recomenda-se criar um arquivo de configuração ou uma função utilitária para centralizar as requisições.

### Definição da URL Base
Se o frontend estiver hospedado na mesma origem (ex: pasta `public`), a base pode ser relativa. Se estiver separado (ex: React/Vue em `localhost:5173`), deve ser absoluta.

```javascript
// config.js

// Opção A: API Externa (Desenvolvimento Local/Servidor Dedicado)
export const API_BASE_URL = "http://localhost:3333";

// Opção B: API na Mesma Origem (Produção/Proxy)
// export const API_BASE_URL = "/api"; 
```

### Função Helper de Requisição (Recomendado)
Esta função padroniza o envio de Tokens JWT, Headers e tratamento de erros. Use-a em todos os exemplos abaixo.

```javascript
// utils/api.js
import { API_BASE_URL } from './config.js';

/**
 * Função genérica para chamadas à API
 * @param {string} endpoint - Ex: "/auth/login"
 * @param {object} options - Opções do fetch (method, body, etc)
 * @param {boolean} isMultipart - Defina true para upload de arquivos
 */
export async function apiRequest(endpoint, { method = 'GET', body, token } = {}, isMultipart = false) {
  const headers = {};

  // Adiciona Token se fornecido
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Configura Headers para JSON (se não for Multipart)
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    method,
    headers,
  };

  // Processa o Body
  if (body) {
    config.body = isMultipart ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Tenta fazer parse do JSON
    let data;
    try {
        data = await response.json();
    } catch (e) {
        data = null; // Resposta sem corpo (ex: 204 No Content)
    }

    if (!response.ok) {
      throw {
        status: response.status,
        message: data?.error || data?.message || 'Erro na requisição',
        data
      };
    }

    return data;
  } catch (error) {
    console.error(`Erro na API [${method} ${endpoint}]:`, error);
    throw error;
  }
}
```

---

## 🔐 Autenticação (Auth)

### 1. Registrar Estudante
Cria uma conta de aluno.
- **Endpoint**: `POST /auth/register/student`
- **Acesso**: Público

```javascript
async function registerStudent(name, email, password) {
  try {
    const result = await apiRequest('/auth/register/student', {
      method: 'POST',
      body: { name, email, password }
    });
    console.log('Aluno criado:', result.data);
    return result;
  } catch (error) {
    alert('Erro ao registrar: ' + error.message);
  }
}
```

### 2. Registrar Instrutor
Cria uma conta de instrutor.
- **Endpoint**: `POST /auth/register/instructor`
- **Acesso**: Público

```javascript
async function registerInstructor(name, email, password) {
  return await apiRequest('/auth/register/instructor', {
    method: 'POST',
    body: { name, email, password }
  });
}
```

### 3. Login
Autentica e retorna o Token JWT. Salve este token para futuras requisições.
- **Endpoint**: `POST /auth/login`
- **Acesso**: Público

```javascript
async function login(email, password) {
  try {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password }
    });

    const { token, user } = response.data;
    
    // Armazenar Token Seguramente
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));

    return user;
  } catch (error) {
    console.error('Login falhou:', error);
  }
}
```

---

## 👤 Perfil do Usuário

### 4. Obter Meus Dados
- **Endpoint**: `GET /users/me`
- **Acesso**: Privado (Qualquer Token)

```javascript
async function getMyProfile() {
  const token = localStorage.getItem('authToken');
  const profile = await apiRequest('/users/me', { token });
  return profile.data;
}
```

### 5. Atualizar Perfil
- **Endpoint**: `PUT /users/me`
- **Acesso**: Privado

```javascript
async function updateProfile(newName, newEmail) {
  const token = localStorage.getItem('authToken');
  return await apiRequest('/users/me', {
    method: 'PUT',
    token,
    body: { name: newName, email: newEmail }
  });
}
```

---

## 📚 Cursos (Público & Aluno)

### 6. Listar Todos os Cursos
Suporta paginação e filtro por categoria.
- **Endpoint**: `GET /courses`
- **Query Params**:
  - `page`: Número da página (padrão 1).
  - `limit`: Itens por página (padrão 10).
  - `category`: ID da categoria (opcional).

```javascript
async function listCourses(page = 1, categoryId = null) {
  let url = `/courses?page=${page}&limit=10`;
  if (categoryId) url += `&category=${categoryId}`;

  const response = await apiRequest(url);
  
  console.log(`Página ${response.meta.currentPage} de ${response.meta.totalPages}`);
  return response.data; // Array de cursos
}
```

### 7. Obter Detalhes do Curso
Retorna informações completas do curso.
- **Endpoint**: `GET /courses/:id`

```javascript
async function getCourseDetails(courseId) {
  const response = await apiRequest(`/courses/${courseId}`);
  return response.data;
}
```

### 8. Exibir Capa do Curso (Imagem)
Acesso público à imagem. Use diretamente na tag `<img>`.
- **Endpoint**: `GET /courses/:id/cover`

**Exemplo em React/HTML:**
```jsx
// Como é um arquivo binário/stream, use a URL diretamente
const CourseCard = ({ course }) => (
  <div className="card">
    <img 
      src={`${API_BASE_URL}/courses/${course.id}/cover`} 
      alt={course.title} 
      onError={(e) => e.target.src = '/default-cover.png'}
    />
    <h3>{course.title}</h3>
  </div>
);
```

### 9. Listar Módulos do Curso
Retorna a grade curricular (módulos e aulas).
- **Endpoint**: `GET /courses/:id/modules`

```javascript
async function getCourseModules(courseId) {
  const response = await apiRequest(`/courses/${courseId}/modules`);
  return response.data; // Array de módulos com aulas aninhadas
}
```

---

## 👨‍🏫 Gestão de Cursos (Instrutor)

### 10. Listar Meus Cursos Criados
- **Endpoint**: `GET /courses/authored`
- **Acesso**: Instrutor

```javascript
async function getMyAuthoredCourses() {
  const token = localStorage.getItem('authToken');
  const response = await apiRequest('/courses/authored', { token });
  return response.data;
}
```

### 11. Criar Novo Curso (Com Capa)
Requer `FormData` para enviar a imagem.
- **Endpoint**: `POST /courses`
- **Acesso**: Instrutor

```javascript
async function createCourse(courseData, imageFile) {
  const token = localStorage.getItem('authToken');
  
  // Usar FormData para envio de arquivos
  const formData = new FormData();
  formData.append('title', courseData.title);
  formData.append('description', courseData.description);
  formData.append('price', courseData.price); // Ex: 99.90
  formData.append('categoryId', courseData.categoryId); // ID da categoria
  
  if (imageFile) {
    formData.append('coverImage', imageFile); // Arquivo do input type="file"
  }

  // isMultipart = true evita que o helper defina 'Content-Type: application/json'
  return await apiRequest('/courses', {
    method: 'POST',
    token,
    body: formData
  }, true);
}
```

### 12. Adicionar Módulo
- **Endpoint**: `POST /courses/:courseId/modules`
- **Acesso**: Instrutor

```javascript
async function addModule(courseId, title, orderIndex) {
  const token = localStorage.getItem('authToken');
  return await apiRequest(`/courses/${courseId}/modules`, {
    method: 'POST',
    token,
    body: { title, orderIndex }
  });
}
```

### 13. Adicionar Aula ao Módulo
- **Endpoint**: `POST /modules/:moduleId/classes`
- **Acesso**: Instrutor

```javascript
async function addClass(moduleId, classData) {
  const token = localStorage.getItem('authToken');
  const body = {
    title: classData.title,
    description: classData.description,
    videoUrl: classData.videoUrl, // URL do YouTube/Vimeo
    orderIndex: classData.orderIndex // Ex: 1
  };

  return await apiRequest(`/modules/${moduleId}/classes`, {
    method: 'POST',
    token,
    body
  });
}
```

### 14. Upload de Material de Aula (PDF/Arquivos)
Envia um arquivo complementar para uma aula específica.
- **Endpoint**: `POST /classes/:classId/upload`
- **Acesso**: Instrutor

```javascript
async function uploadMaterial(classId, fileObject) {
  const token = localStorage.getItem('authToken');
  
  const formData = new FormData();
  formData.append('file', fileObject); // Somente PDF, Imagens, Vídeos simples

  return await apiRequest(`/classes/${classId}/upload`, {
    method: 'POST',
    token,
    body: formData
  }, true);
}
```

---

## 🛒 Compras e Matrícula (Aluno)

### 15. Comprar Curso (Checkout)
Adiciona ao carrinho e finaliza a compra. O fluxo atual simplifica adicionando e fazendo checkout em passos distintos.

**Passo A: Adicionar ao Carrinho**
- **Endpoint**: `POST /cart`
```javascript
async function addToCart(courseId) {
  const token = localStorage.getItem('authToken');
  await apiRequest('/cart', {
    method: 'POST',
    token,
    body: { courseId }
  });
}
```

**Passo B: Finalizar Compra**
- **Endpoint**: `POST /checkout`
```javascript
async function checkout() {
  const token = localStorage.getItem('authToken');
  const response = await apiRequest('/checkout', {
    method: 'POST',
    token,
    body: {} // Corpo vazio
  });
  console.log('Matrícula realizada!', response.data);
}
```

---

## 🎓 Painel do Aluno

### 16. Meus Cursos (Dashboard)
Lista cursos onde o aluno está matriculado e seu progresso.
- **Endpoint**: `GET /my-courses`
- **Acesso**: Aluno

```javascript
async function getMyEnrollments() {
  const token = localStorage.getItem('authToken');
  const response = await apiRequest('/my-courses', { token });
  return response.data; // Inclui campo 'progress' (0-100)
}
```

### 17. Acessar Material de Aula (Download Seguro)
Como o acesso é protegido, você não pode usar um link `<a>` simples. Você deve baixar o blob ou usar um token na URL se implementar essa lógica. A API atual valida via Header Authorization.

**Método Recomendado: Download via Blob**
- **Endpoint**: `GET /classes/:id/material`

```javascript
async function downloadMaterial(classId, fileName) {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}/material`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Acesso negado ao material');

    // Converter para Blob
    const blob = await response.blob();
    
    // Criar Link Temporário para Download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'material_aula.pdf'; // Nome sugerido
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    
  } catch (err) {
    console.error('Erro no download:', err);
  }
}
```

### 18. Marcar Aula com Concluída
Atualiza o progresso do aluno.
- **Endpoint**: `POST /classes/:id/progress`
- **Acesso**: Aluno

```javascript
async function markClassComplete(classId) {
  const token = localStorage.getItem('authToken');
  await apiRequest(`/classes/${classId}/progress`, {
    method: 'POST',
    token,
    body: { completed: true }
  });
}
```

### 19. Emitir Certificado
Disponível apenas se o progresso for 100%.
- **Endpoint**: `POST /courses/:id/certificate` (Verifique rota exata em `studentRoutes`)

```javascript
async function getCertificate(courseId) {
  const token = localStorage.getItem('authToken');
  const response = await apiRequest(`/student/courses/${courseId}/certificate`, {
    method: 'POST',
    token
  });
  return response.data; // Dados do certificado
}
```

---

## ⭐ Avaliações e Categorias

### 20. Listar Categorias
- **Endpoint**: `GET /categories`

```javascript
async function getCategories() {
  const res = await apiRequest('/categories');
  return res.data;
}
```

### 21. Avaliar Curso
- **Endpoint**: `POST /courses/:id/reviews`

```javascript
async function reviewCourse(courseId, rating, comment) {
  const token = localStorage.getItem('authToken');
  await apiRequest(`/courses/${courseId}/reviews`, {
    method: 'POST',
    token,
    body: { rating, comment }
  });
}
```

---

## 🔒 Segurança (Notas para o Desenvolvedor)

1.  **Rate Limiting**: A API limita requisições de Login a **5 tentativas por 15 minutos**. Se receber `429 Too Many Requests`, aguarde.
2.  **Tokens**: O token JWT expira (padrão 1h ou 24h). O frontend deve tratar erros `401 Unauthorized` e redirecionar para Login.
3.  **Uploads**: Imagens e arquivos são validados por assinatura binária. Renomear `.exe` para `.jpg` **falhará**. Envie apenas arquivos legítimos.
