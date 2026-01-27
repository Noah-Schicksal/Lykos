/**
 * Setup Global de Testes
 * 
 * Este arquivo é executado antes de todos os testes.
 * Responsável por:
 * - Configurar variáveis de ambiente para testes
 * - Limpar logs do console para saída limpa
 * - Inicializar dados globais
 * 
 * @see jest.config.js setupFilesAfterEnv
 */

// Declarações para evitar erros de tipagem em tempo de checagem TypeScript
declare const global: any;
declare const process: any;

// Suprimir console logs antes de qualquer import para pegar logs do dotenv
const originalConsoleLog = console.log;
const originalConsoleDebug = console.debug;
const originalConsoleInfo = console.info;

// Durante a execução dos testes, o objeto global 'jest' estará disponível.
// Para evitar erros de compilação/typing quando o arquivo for lido fora do
// contexto do Jest, acessamos via `global as any` e só sobrescrevemos quando
// o runtime do Jest estiver presente.
if ((global as any).jest) {
  const g = global as any;
  console.log = g.jest.fn();
  console.debug = g.jest.fn();
  console.info = g.jest.fn();
}

/**
 * Configurações executadas antes de todos os testes
 */
beforeAll(() => {
  // Define ambiente de testes
  process.env.NODE_ENV = 'test';
  
  // JWT Secret para testes
  process.env.JWT_SECRET = 'test_secret_key_12345';
  
  // JWT Expiration para testes
  process.env.JWT_EXPIRES_IN = '1h';
  
  // Database path para testes (pode ser :memory: ou arquivo específico)
  process.env.DB_PATH = ':memory:';
});

/**
 * Configurações após todos os testes (cleanup)
 */
afterAll(() => {
  // Restaurar implementações originais do console
  console.log = originalConsoleLog;
  console.debug = originalConsoleDebug;
  console.info = originalConsoleInfo;

  // Limpar variáveis de ambiente
  delete process.env.JWT_SECRET;
  delete process.env.JWT_EXPIRES_IN;
  delete process.env.DB_PATH;
});

export {};
