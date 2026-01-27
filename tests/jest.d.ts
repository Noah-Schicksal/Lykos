/**
 * Tipos Globais - Jest
 * Fornece tipos para funções de teste do Jest sem depender de @types/jest
 * 
 * @see https://jestjs.io/docs/getting-started#using-typescript
 */

declare global {
  /**
   * Matchers disponíveis em expect()
   */
  interface Matchers<R> {
    toEqual(expected: any): R;
    toHaveBeenCalled(): R;
    toHaveBeenCalledWith(...args: any[]): R;
    toHaveBeenCalledTimes(times: number): R;
    toThrow(expected?: any): R;
    toBe(expected: any): R;
    toBeInstanceOf(expected: any): R;
    toBeDefined(): R;
    toBeNull(): R;
    toBeUndefined(): R;
    toBeTruthy(): R;
    toBeFalsy(): R;
    toHaveProperty(property: string): R;
    toContain(item: any): R;
    toHaveLength(length: number): R;
    not: Matchers<R>;
  }

  /**
   * Resultado de expect() com suporte a .rejects
   */
  interface ExpectResult<T = any> extends Matchers<void> {
    rejects: Matchers<Promise<void>>;
  }

  /**
   * Interface para expect
   */
  interface Expect {
    <T>(value: T | Promise<T>): ExpectResult<T>;
    objectContaining(obj: any): any;
  }

  /**
   * Mock function interface
   */
  interface JestMock {
    mockReturnValue(value: any): this;
    mockResolvedValue(value: any): this;
    mockRejectedValue(value: any): this;
    mockImplementation(fn: (...args: any[]) => any): this;
    mock: {
      calls: any[][];
      results: Array<{ type: string; value: any }>;
    };
  }

  /**
   * Namespace jest com utilitários
   */
  namespace jest {
    function fn(implementation?: (...args: any[]) => any): JestMock;
    function clearAllMocks(): void;
  }

  /**
   * Função describe
   */
  interface DescribeFunction {
    (name: string, fn: () => void): void;
    skip(name: string, fn: () => void): void;
    only(name: string, fn: () => void): void;
  }

  /**
   * Função it
   */
  interface ItFunction {
    (name: string, fn: () => void | Promise<void>): void;
    skip(name: string, fn: () => void | Promise<void>): void;
    only(name: string, fn: () => void | Promise<void>): void;
    todo(name: string): void;
  }

  // Global test functions
  // Declarações já existem em outro lugar, comentadas para evitar conflitos
  // const describe: DescribeFunction;
  // const it: ItFunction;
  // const expect: Expect;
  // function beforeEach(fn: () => void | Promise<void>): void;
  // function afterEach(fn: () => void | Promise<void>): void;
  // function beforeAll(fn: () => void | Promise<void>): void;
  // function afterAll(fn: () => void | Promise<void>): void;
}

export {};
