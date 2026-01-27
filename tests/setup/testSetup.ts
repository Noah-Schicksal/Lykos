// Suppress console logs BEFORE any imports to catch dotenv logs
const originalConsoleLog = console.log;
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: console.warn,
  error: console.error,
};

beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_secret_key';
  process.env.JWT_EXPIRES_IN = '1h';
});

afterAll(() => {
  // Restore console.log if needed
  // console.log = originalConsoleLog;
});
