# Testes unitários das Services

Resumo dos testes implementados para `reviewService`, `moduleService` e `classService`.

## Arquivos adicionados
- `tests/unit/services/reviewService.test.ts`
- `tests/unit/services/moduleService.test.ts`
- `tests/unit/services/classService.test.ts`

## Testes implementados

### reviewService
- `addOrUpdateReview - create when enrolled and no existing review` — verifica que um review é criado quando o usuário está matriculado e não existe avaliação anterior.
- `addOrUpdateReview - update when existing review found` — verifica que o método atualiza uma avaliação existente (chama `setRating` e `setComment` e `reviewRepository.update`).
- `addOrUpdateReview - throws when user not enrolled` — verifica que lança erro quando o usuário não está matriculado.

### moduleService
- `create - success when course exists and instructor matches` — cria módulo com `orderIndex` automático e chama `moduleRepository.save`.
- `create - throws when course not found` — lança erro quando o curso não existe.

### classService
- `create - success when module exists and instructor matches` — cria aula quando módulo e permissão do instrutor estão corretos.
- `getMaterial - student with enrollment gets relative path` — retorna caminho relativo do material quando aluno matriculado.
- `getMaterial - student without enrollment throws` — lança erro quando aluno não está matriculado.

## Como executar os testes
Executar a suíte de testes unitários:

```bash
npm test -- tests/unit --runInBand
```

Ou executar apenas os testes de services:

```bash
npm test -- tests/unit/services --runInBand
```

## Observações
- Os testes usam mocks simples dos repositórios e não tocam no banco de dados.
- Se desejar, posso:
  - adicionar mais casos (autorização, erros de repositório, bordas);
  - extrair factories/helpers de criação de entidades de teste;
  - rodar os testes aqui e ajustar eventuais falhas de import/typing.
