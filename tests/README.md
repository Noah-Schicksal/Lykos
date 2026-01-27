# 🧪 Testes - Guia Rápido

Guia rápido para entender e executar os testes unitários do projeto.

## 📊 Status dos Testes

| Serviço | Testes | Status | Cobertura |
|---------|--------|--------|-----------|
| CategoryService | 10 | ✅ Completo | 100% |
| AuthService | 3+ | ✅ Existente | ~80% |
| Outros Serviços | - | ⏳ Pendente | - |

## 🚀 Começar Rapidamente

```bash
# Instalar dependências (se não feito)
npm install

# Executar todos os testes
npm test

# Executar testes em modo watch (reexecuta ao salvar)
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage

# Executar um arquivo específico
npm test -- tests/unit/services/categoryService.test.ts
```

## 📁 Estrutura de Testes

```
tests/
├── setup/testSetup.ts              # Setup global (env vars, mocks globais)
├── mocks/mockRepositories.ts       # Factories de mocks reutilizáveis
├── jest.d.ts                       # Tipos globais do Jest
├── tsconfig.json                   # Config TypeScript para testes
└── unit/services/
    ├── authService.test.ts         # Testes de autenticação
    └── categoryService.test.ts     # Testes de categorias
```

## 📝 Padrão de Teste (AAA)

Todos os testes seguem **Arrange-Act-Assert**:

```typescript
it('should do something', async () => {
  // ARRANGE: Preparar dados e mocks
  const input = 'Test Data';
  mockRepository.findByName.mockReturnValue(null);

  // ACT: Executar a ação
  const result = await service.create(input);

  // ASSERT: Verificar resultados
  expect(result.name).toBe(input);
  expect(mockRepository.save).toHaveBeenCalled();
});
```

## 🔧 Usando Mocks

### Importar Mocks

```typescript
import { 
  createMockCategoryRepository,
  mockCategory,
  mockCategoryTwo 
} from '../../mocks/mockRepositories';
```

### Configurar Mocks em beforeEach

```typescript
beforeEach(() => {
  mockCategoryRepository = createMockCategoryRepository();
  categoryService = new CategoryService(mockCategoryRepository);
  jest.clearAllMocks();
});
```

### Métodos Comuns de Mock

```typescript
// Retornar valor (síncrono)
mockRepository.findById.mockReturnValue(mockCategory);

// Retornar Promise (assíncrono)
mockRepository.findById.mockResolvedValue(mockCategory);

// Lançar erro
mockRepository.delete.mockImplementation(() => {
  throw new Error('Delete failed');
});

// Verificar chamadas
expect(mockRepository.save).toHaveBeenCalled();
expect(mockRepository.save).toHaveBeenCalledWith(mockCategory);
expect(mockRepository.save).toHaveBeenCalledTimes(1);
expect(mockRepository.save).not.toHaveBeenCalled();
```

## ✅ Testes Disponíveis

### CategoryService (10 testes)

```typescript
describe('create')
  ✓ should create a new category when name does not exist
  ✓ should throw ApplicationError when category name already exists

describe('list')
  ✓ should return all categories
  ✓ should return empty array when no categories exist

describe('update')
  ✓ should update category when it exists and new name is unique
  ✓ should throw ApplicationError when category does not exist
  ✓ should throw ApplicationError when new name already exists for another category
  ✓ should allow updating with same name (same ID)

describe('delete')
  ✓ should delete category when it exists
  ✓ should throw ApplicationError when category does not exist

describe('ApplicationError')
  ✓ should be an instance of Error
```

## 📊 Executar e Interpretar Resultados

### Sucesso
```
 PASS  tests/unit/services/categoryService.test.ts (1.234 s)
  CategoryService
    ✓ create (45 ms)
    ✓ list (12 ms)
    ...
```

### Falha
```
 FAIL  tests/unit/services/categoryService.test.ts
  ● CategoryService › create › should create new category

  expect(received).toEqual(expected)
  Expected: "Expected Category"
  Received: "Got Something Else"

  at src/services/categoryService.ts:15:23
```

### Modo Watch
```
PASS  tests/unit/services/categoryService.test.ts
Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
Snapshots:   0 total
Time:        1.234 s
```

## 🐛 Troubleshooting Comum

### Problema: Teste fica pendurado (timeout)

**Causa**: Método async não retorna Promise  
**Solução**: Verificar se `await` está sendo usado

```typescript
// ❌ Errado
it('should do something', () => {  // Falta async
  const result = await service.create('test');
});

// ✅ Certo
it('should do something', async () => {  // async adicionado
  const result = await service.create('test');
});
```

### Problema: Mock não está sendo chamado

**Causa**: Mock não foi configurado com `mockReturnValue`  
**Solução**: Configurar mock antes de usar

```typescript
// ❌ Errado
mockRepository.findById.mockReturnValue(mockCategory);
const result = service.update('123', 'New Name');  // Mock não foi usado!

// ✅ Certo
const result = service.update('123', 'New Name');
expect(mockRepository.findById).toHaveBeenCalled();
```

### Problema: Teste passa mas deveria falhar

**Causa**: Asserção nunca foi executada  
**Solução**: Verificar se há `expect()` realmente

```typescript
// ❌ Errado - sem expect
it('should create category', () => {
  const result = service.create('Test');
  // Falta: expect(result).toBeDefined();
});

// ✅ Certo - com expect
it('should create category', () => {
  const result = service.create('Test');
  expect(result).toBeDefined();
});
```

## 📈 Melhorar Cobertura

Para adicionar testes a um novo serviço:

1. **Criar arquivo de teste**
   ```bash
   touch tests/unit/services/newService.test.ts
   ```

2. **Copiar template**
   ```typescript
   describe('NewService', () => {
     let service: NewService;
     let mockRepository: any;

     beforeEach(() => {
       mockRepository = createMockNewRepository();
       service = new NewService(mockRepository);
       jest.clearAllMocks();
     });

     describe('methodName', () => {
       it('should do something', () => {
         // Arrange
         // Act
         // Assert
       });
     });
   });
   ```

3. **Executar testes**
   ```bash
   npm test -- tests/unit/services/newService.test.ts
   ```

## 📚 Referências Rápidas

- **Jest Docs**: https://jestjs.io/
- **Jest Expect**: https://jestjs.io/docs/expect
- **Mock Functions**: https://jestjs.io/docs/mock-functions
- **Async Testing**: https://jestjs.io/docs/asynchronous

## 🎓 Próximos Testes a Implementar

- [ ] CourseService
- [ ] ModuleService
- [ ] ClassService
- [ ] EnrollmentService
- [ ] ReviewService
- [ ] CartService
- [ ] StudentService
- [ ] UserService

---

**Última Atualização**: 27 de Janeiro de 2026
