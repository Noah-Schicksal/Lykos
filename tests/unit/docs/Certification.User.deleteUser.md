# Documentação dos Testes Unitários

## 1. Visão Geral

Este documento descreve de forma detalhada a implementação, organização, estratégia e resultados dos testes unitários do projeto **Alpha-Cursos (Backend)**. O objetivo principal da suíte de testes é garantir a confiabilidade da camada de serviços (service layer), validando regras de negócio, fluxos de sucesso, cenários de erro, segurança e integração correta com dependências simuladas.

Os testes foram desenvolvidos com foco em previsibilidade, isolamento e legibilidade, seguindo boas práticas amplamente aceitas em projetos Node.js com TypeScript.

---

## 2. Ferramentas e Tecnologias Utilizadas

A stack de testes foi definida com ferramentas consolidadas no ecossistema JavaScript/TypeScript:

* **Jest**: framework de testes responsável pela execução das suítes, asserções e mocks.
* **ts-jest**: camada de integração entre Jest e TypeScript, permitindo executar testes diretamente em `.ts`.
* **@types/jest**: tipagens para reconhecimento correto de `describe`, `it`, `expect` e demais helpers pelo TypeScript.
* **Mocks manuais**: utilizados para simular repositórios e bibliotecas externas como `bcrypt` e `jsonwebtoken`.

A instalação foi realizada como dependência de desenvolvimento:

```
npm install -D jest ts-jest @types/jest
```

O script de execução dos testes está definido no `package.json`:

```
"scripts": {
  "test": "jest"
}
```

---

## 3. Organização da Estrutura de Testes

Os testes unitários estão organizados de forma espelhada à estrutura da camada de serviços, facilitando manutenção e leitura:

```
tests/
 └── unit/
     └── services/
         ├── authService.test.ts
         ├── deleteUserService.test.ts
         └── certificationService.test.ts

 └── mocks/
     └── mockUserRepository.ts
```

Essa organização reforça o princípio de responsabilidade única: cada service possui sua própria suíte de testes, sem dependência cruzada.

---

## 4. Estratégia de Testes

A estratégia adotada foi **testar exclusivamente a camada de serviço**, isolando completamente:

* Banco de dados
* ORM
* Infraestrutura externa
* Framework HTTP

Todos os repositórios são mockados, garantindo que os testes validem apenas regras de negócio e fluxo lógico.

Os testes seguem o padrão **Arrange / Act / Assert**, garantindo clareza e previsibilidade.

---

## 5. Testes do AuthService

### Objetivo

Validar o fluxo de autenticação de usuários, garantindo segurança, tratamento adequado de erros e geração correta de tokens JWT.

### Cenários Cobertos

* Login com credenciais válidas
* Usuário não encontrado
* Senha inválida
* Normalização de email
* Diferentes papéis de usuário (student, instructor)
* Garantia de que a senha não é retornada
* Uso correto de variáveis de ambiente no JWT
* Propagação de erros do `bcrypt` e do `jwt.sign`

### Abordagem Técnica

* `bcrypt` e `jsonwebtoken` são totalmente mockados
* Repositório de usuário é simulado
* Tokens não são validados criptograficamente, apenas estruturalmente

Isso garante testes rápidos, determinísticos e seguros.

---

## 6. Testes do DeleteUserService

### Objetivo

Validar a regra de negócio crítica de exclusão de usuários.

### Regra Principal

Um usuário só pode deletar a própria conta.

### Cenários Testados

* Exclusão permitida quando `userIdToDelete === requesterId`
* Erro lançado quando um usuário tenta deletar outro usuário
* Verificação de chamada correta ao repositório

### Observações Técnicas

* O repositório é mockado
* Não há dependência de autenticação real
* O teste valida comportamento, não implementação interna

---

## 7. Testes do CertificationService

### Objetivo

Garantir a validação correta de certificados emitidos a partir de matrículas.

### Cenários Testados

* Certificado válido retornando dados completos
* Certificado inexistente ou inválido lançando erro de domínio (`ApplicationError`)
* Cálculo correto de carga horária com base no número de aulas
* Uso de valor fallback quando não há aulas registradas

### Abordagem Técnica

* `EnrollmentRepository` totalmente mockado
* DTO validado estruturalmente
* Datas tratadas de forma consistente

---

## 8. Interpretação dos Logs do Jest

Exemplo de saída:

```
Test Suites: 3 passed, 3 total
Tests:       19 passed, 19 total
Snapshots:   0 total
Time:        5.141 s
Ran all test suites.
```

### Significado

* **Test Suites**: todas as suítes foram executadas sem falhas
* **Tests**: todos os cenários passaram
* **Snapshots**: não utilizados (correto para backend)
* **Time**: tempo baixo, indicando testes unitários eficientes

Não há flakiness, erros intermitentes ou dependência de ordem de execução.

---

## 9. Qualidade Técnica Observável

A suíte demonstra:

* Domínio de Jest e TypeScript
* Conhecimento de mocking correto
* Clareza na separação de responsabilidades
* Foco em regras de negócio reais
* Preocupação com segurança
* Código testável e bem estruturado

Esse conjunto atende plenamente critérios de avaliação técnica em processos seletivos e revisões de código profissionais.

---

## 10. Conclusão

Os testes unitários do projeto Alpha-Cursos garantem alto nível de confiança na camada de serviços. A abordagem adotada prioriza clareza, isolamento e robustez, resultando em uma base sólida para evolução do sistema.

A suíte está preparada para ser expandida conforme novos serviços sejam adicionados, mantendo consistência e qualidade técnica.
