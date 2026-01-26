# Relatório de Auditoria de Segurança e Confiabilidade da API

**Data:** 26/01/2026
**Status:** Concluído
**Versão do Código:** 1.0.0 (Baseado na implementação atual)

## 1. Visão Geral
Este relatório apresenta uma análise rigorosa da segurança, confiabilidade e potenciais vulnerabilidades da API do projeto "Desafio 2". A análise abrangeu autenticação, autorização, validação de dados, manipulação de arquivos e configuração do servidor.

## 2. Pontos Positivos (Fortalezas)
Identificamos diversas práticas robustas de segurança já implementadas:

*   **Autenticação Robusta**: Utilização de **JWT (JSON Web Tokens)** para gestão de sessões stateless. Suporte a tokens via HttpOnly Cookies (embora a prioridade atual seja Header).
*   **Proteção de Senhas**: Uso de **Bcrypt** com fator de custo (salts) 10 para hash de senhas. Senhas nunca são salvas em texto plano.
*   **Proteção contra SQL Injection**: Uso consistente de *prepared statements* via `better-sqlite3` em todos os repositórios (`CourseRepository`, `UserRepository`, etc.), sanitizando inputs automaticamente.
*   **Controle de Acesso (RBAC)**: Middleware `roleMiddleware` implementado corretamente para segregar ações de ALUNOS e INSTRUTORES.
*   **Segurança de Arquivos (Storage)**:
    *   Uso de `randomUUID` para renomear arquivos, prevenindo sobrescrita e previsibilidade de nomes.
    *   Caminhos sanitizados via `path.join` e regex para evitar ataques de *Path Traversal*.
    *   Acesso público estático bloqueado; arquivos sensíveis servidos apenas via endpoint protegido com validação de matrícula/propriedade (`ClassController.getMaterial`).
*   **Tratamento de Erros**: Middleware centralizado (`errorHandler`) evita vazamento de *stack traces* em produção e padroniza as respostas de erro.

## 3. Vulnerabilidades e Pontos de Atenção
Abaixo listamos as áreas que necessitam de melhorias, classificadas por prioridade.

### 🔴 Prioridade ALTA (Crítico)

1.  **Ausência de Rate Limiting (Limitação de Taxa)** (SOLVED)
    *   **Risco**: A API está vulnerável a ataques de força bruta (brute-force) nas rotas de login e ataques de negação de serviço (DoS) por exaustão de recursos.
    *   **Local**: Todas as rotas, especialmente `/auth/login`.
    *   **Recomendação**: Implementar `express-rate-limit` para limitar requisições por IP.

2.  **Validação de Input Manual e Frágil** (SOLVED)
    *   **Risco**: Os controladores (`CourseController`, `UserController`) extraem e validam dados manualmente (`req.body`). Isso é propenso a erros, não trata tipos inesperados (ex: array onde se espera string) e permitiu bugs recentes (ex: erro de parsing de preço no multipart).
    *   **Recomendação**: Adotar uma biblioteca de validação de schema como **Zod** ou **Joi** para garantir que todos os dados de entrada sigam um contrato estrito antes de chegar ao controller.

3.  **Logs de Debug em Produção (Vazamento de Dados)** (SOLVED)
    *   **Risco**: Foi identificado código (`CourseController.ts`, `AuthMiddleware`) com logs que podem vazar dados sensíveis (PII, tokens) nos logs do servidor.
    *   **Recomendação**: Todos os `console.log` de debug foram removidos.


### 🟠 Prioridade MÉDIA (Importante)

4.  **Falta de Headers de Segurança (Helmet)** (SOLVED)
    *   **Risco**: A aplicação não define headers HTTP de segurança (HSTS, X-Frame-Options, X-XSS-Protection), deixando clientes vulneráveis a ataques como Clickjacking e XSS.
    *   **Recomendação**: Instalar e configurar o middleware `helmet`.

5.  **Configuração de CORS Ausente** (SOLVED)
    *   **Risco**: Bloqueio de frontends legítimos ou permissividade excessiva.
    *   **Recomendação**: `cors` instalado e configurado com whitelist via `.env`.


6.  **Validação de Arquivos Limitada** (SOLVED)
    *   **Risco**: O upload verifica apenas a extensão do arquivo. Um atacante pode renomear um `.exe` malicioso para `.jpg` e enviá-lo. Embora o servidor não execute o arquivo, isso é má prática.
    *   **Recomendação**: Validar o *MIME Type* real do arquivo usando "Magic Numbers" (bibliotecas como `file-type` ou `mmmagic`).

### 🟡 Prioridade BAIXA (Melhoria Contínua)

7.  **Gerenciamento de Segredos (.env)**
    *   **Observação**: O projeto usa `dotenv`, o que é bom. Certifique-se de que o arquivo `.env` está no `.gitignore`.
    *   **Recomendação**: Validar a presença de todas as variáveis de ambiente críticas no startup da aplicação (fail-fast).

8.  **Estrutura de *Dependency Injection***
    *   **Observação**: Os controladores instanciam serviços diretamente (`new Service()`). Isso dificulta testes unitários isolados (mocking).
    *   **Recomendação**: Usar injeção de dependência via construtor de forma mais rigorosa ou um container de DI.

## 4. Plano de Ação Recomendado

Sugiro a seguinte ordem de implementação para blindar a API:

### Fase 1: Correções Imediatas
1.  **Limpar Logs**: Remover `console.log` residuais dos controladores (`CourseController`).
2.  **Rate Limiting**: Adicionar middleware de limite de fluxo global e específico para login.
3.  **Helmet**: Ativar headers de segurança básicos.

### Fase 2: Robustez
4.  **Validação com Zod**: Criar schemas para as rotas principais (`createUser`, `createCourse`, `login`).
5.  **CORS**: Configurar política de origens cruzadas.

### Fase 3: Refinamento
6.  **Validação de Upload**: Melhorar checagem de tipos de arquivos.
7.  **Testes**: Adicionar testes de carga simples para validar o Rate Limiting.

---
**Conclusão**: A base do projeto é sólida e segue bons padrões de arquitetura (Repository Pattern, Services). As vulnerabilidades encontradas são comuns em estágios iniciais de desenvolvimento e podem ser mitigadas com esforço moderado, elevando significantemente o nível de segurança da aplicação.
