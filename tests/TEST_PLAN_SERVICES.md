# Plano de Testes Unitários: CartService e StudentService

Este plano detalha a estratégia para implementar testes unitários para `CartService` e `StudentService`, seguindo o padrão já estabelecido no projeto (Jest, injeção de dependência via construtor, e mocks de repositórios).

## 1. Criação de Mocks Necessários

Para isolar os serviços, precisamos criar mocks para os repositórios que ainda não possuem mocks definidos em `tests/mocks`.

### Arquivos a criar em `tests/mocks/`:

1.  **`mockCartRepository.ts`**:
    *   Métodos a mockar: `getCartItems`, `exists`, `save`, `delete`, `clearCart`.
2.  **`mockEnrollmentRepository.ts`**:
    *   Métodos a mockar: `findEnrollment`, `save`, `findStudentEnrollments`, `countCourseClasses`, `countCompletedClasses`, `getCompletedClassIds`, `updateCertificateHash`.
3.  **`mockModuleRepository.ts`**:
    *   Métodos a mockar: `findByCourseId`, `findById`.
4.  **`mockClassRepository.ts`**:
    *   Métodos a mockar: `findByModule`.

*Nota: `mockCourseRepository` já existe e será reutilizado.*

---

## 2. Estrutura dos Arquivos de Teste

Seguiremos o padrão `describe` aninhado para cada método do serviço.

### Padrão Geral (Exemplo):
```typescript
describe('NomeService', () => {
    let service: NomeService;
    let mockRepo1: jest.Mocked<Repo1>;
    // ... outros mocks

    beforeEach(() => {
        mockRepo1 = createMockRepo1();
        // ... criar outros mocks
        service = new NomeService(mockRepo1, ...);
        jest.clearAllMocks();
    });

    describe('methodName', () => {
        it('should ... when ...', async () => {
            // Arrange
            // Act
            // Assert
        });
    });
});
```

---

## 3. Casos de Teste Detalhados

### 3.1 CartService (`src/services/cartService.ts`)

Dependências: `CartRepository`, `EnrollmentRepository`, `CourseRepository`.

#### `getCart(userId)`
*   **Caso de Sucesso**: Deve retornar DTO com lista de itens e total calculado corretamente.
    *   *Setup*: `mockCartRepo.getCartItems` retorna lista mockada.
*   **Carrinho Vazio**: Deve retornar lista vazia e total 0.

#### `addToCart(userId, courseId)`
*   **Caso de Sucesso**: Deve salvar item no carrinho e retornar o item.
    *   *Setup*: Curso existe, não matriculado, não está no carrinho.
*   **Erro - Curso Inexistente**: Deve lançar `ApplicationError('Curso não encontrado')`.
    *   *Setup*: `mockCourseRepo.findById` retorna null.
*   **Erro - Já Matriculado**: Deve lançar `ApplicationError('Aluno já matriculado neste curso')`.
    *   *Setup*: `mockEnrollmentRepo.findEnrollment` retorna objeto enrollment.
*   **Erro - Já no Carrinho**: Deve lançar `ApplicationError('Curso já está no carrinho')`.
    *   *Setup*: `mockCartRepo.exists` retorna true.

#### `removeFromCart(userId, courseId)`
*   **Caso de Sucesso**: Deve chamar `mockCartRepo.delete`.

#### `checkout(userId)`
*   **Caso de Sucesso**: Deve converter itens do carrinho em matrículas, limpar o carrinho e retornar resumo.
    *   *Setup*: Carrinho com itens.
    *   *Verificação*: `mockEnrollmentRepo.save` chamado para cada item. `mockCartRepo.clearCart` chamado.
*   **Caso Parcial (Race Condition)**: Se usuário já matriculado em um dos itens (verificado dentro do loop), deve pular a criação daquela matrícula específica.
*   **Erro - Carrinho Vazio**: Deve lançar `ApplicationError('Carrinho vazio')`.

---

### 3.2 StudentService (`src/services/studentService.ts`)

Dependências: `EnrollmentRepository`, `CourseRepository`, `ModuleRepository`, `ClassRepository`.

#### `listMyCourses(userId, page, limit)`
*   **Caso de Sucesso**: Deve retornar lista de cursos com progresso calculado.
    *   *Setup*: `mockEnrollmentRepo.findStudentEnrollments` retorna lista. Para cada um, mocks de count retornam valores (ex: 5 completed / 10 total = 50% progresso).
*   **Paginação**: Verificar se `meta` retorna corretamente os dados de paginação.

#### `getCourseDetails(userId, courseId)`
*   **Caso de Sucesso**: Deve retornar detalhes do curso, módulos e status das aulas.
    *   *Setup*: Matriculado, curso existe. Repos de modulo e aula retornam dados. `getCompletedClassIds` retorna Set com ids.
    *   *Verificação*: Aula com ID presente no Set deve ter `completed: true`.
*   **Erro - Não Matriculado**: Deve lançar `ApplicationError('Aluno não matriculado neste curso')`.
*   **Erro - Curso Não Encontrado**: Deve lançar `ApplicationError('Curso não encontrado')` (caso edge onde tem matrícula mas curso sumiu).

#### `issueCertificate(userId, courseId, studentName)`
*   **Caso de Sucesso**: Deve gerar hash, salvar no enrollment e retornar certificado.
    *   *Setup*: Matriculado, progresso 100% (completed == total > 0). Certificado ainda não emitido.
*   **Erro - Não Matriculado**: Deve lançar `ApplicationError('Matrícula não encontrada')`.
*   **Erro - Já Emitido**: Deve lançar `ApplicationError('Certificado já emitido')` se `enrollment.certificateHash` já existir.
*   **Erro - Progresso Incompleto**: Deve lançar `ApplicationError('Curso não concluído...')` se completed < total.

---

## 4. Próximos Passos (Ordem de Execução)

1.  Criar os mocks faltantes em `tests/mocks/`.
2.  Criar `tests/unit/services/cartService.test.ts` implementando os casos acima.
3.  Criar `tests/unit/services/studentService.test.ts` implementando os casos acima.
4.  Rodar `npm test` para validar.
