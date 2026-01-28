# 📄 Relatório de Decisão Técnica: Estratégia de Desenvolvimento Centralizado

**Data:** 27/01/2026
**Assunto:** Justificativa para adoção de fluxo de desenvolvimento unificado (Single-Developer Workflow) na fase de estruturação da API.

---

## 1. Contexto Executivo

Este documento detalha os motivos técnicos e estratégicos que levaram à decisão de concentrar o desenvolvimento do núcleo (Core) da API em um único fluxo de trabalho contínuo, ao invés de fragmentá-lo em tarefas paralelas para múltiplos desenvolvedores simultâneos.

Embora o escopo do projeto comporte uma equipe de 6 pessoas, a natureza da **Arquitetura Adotada (Layered Architecture com Domain-Driven Design)** e a necessidade de **Integridade de Segurança** tornaram o desenvolvimento colaborativo simultâneo um risco à estabilidade e consistência do produto final, dado o prazo exíguo.

---

## 2. Fatores Técnicos Determinantes

### 2.1. A Cadeia de Dependência Rígida (Strict Dependency Chain)
Diferente de arquiteturas de microsserviços onde módulos são isolados, esta API opera como um **Monólito Modular Altamente Acoplado**.
- **O Problema**: Para criar uma funcionalidade simples (ex: "Matricular Aluno"), é necessário tocar em 5 camadas sincronizadas:
    1.  `Entity` (Regra de Negócio)
    2.  `Repository` (SQL)
    3.  `Service` (Lógica)
    4.  `Controller` (Http)
    5.  `Routes` (Middleware)
- **O Risco Colaborativo**: Se um desenvolvedor altera a Entidade `User` enquanto outro trabalha no `AuthService`, o código quebra imediatamente. O custo de sincronização (Merge Conflicts) seria superior ao tempo de produção.

### 2.2. Consistência do Domínio Rico (Rich Model Integrity)
Adotamos um padrão onde as entidades (`User.ts`, `Course.ts`) possuem métodos de auto-validação e proteção de invariantes.
- **Cenário de Equipe**: Com 6 desenvolvedores, é comum que metade use validação na Entidade e a outra metade no Controller (Padrão Anêmico). Isso geraria um código "Frankenstein" inseguro.
- **Decisão**: Um único autor garante que **todas** as entidades sigam estritamente o mesmo padrão de segurança e encapsulamento.

### 2.3. O Desafio do Estado Compartilhado (SQLite)
O projeto utiliza **SQLite**, um banco de dados baseado em arquivo local.
- **Impedimento**: Não existe um servidor de banco centralizado para desenvolvimento.
- **Conflito**: Se 6 pessoas testam localmente e alteram o esquema do banco (`init.ts`) simultaneamente, a gestão de versões do arquivo binário `.sqlite` ou dos scripts de migração se torna caótica sem uma infraestrutura de DevOps complexa (que não teríamos tempo de configurar).

### 2.4. Segurança Holística (Security Cross-Cutting Concerns)
A segurança não é um módulo isolado, ela permeia tudo através de *Middlewares* (`authMiddleware`, `roleMiddleware`, `rateLimit`).
- **Justificativa**: A implementação desses guardiões precisa ser atômica. Se um desenvolvedor esquece de aplicar o `roleMiddleware` em uma rota crítica porque "achou que outro faria", cria-se uma vulnerabilidade grave. A centralização garantiu cobertura de 100% das rotas sensíveis.

---

## 3. Análise de Eficiência (Brooks's Law)

Referenciando a famosa "Lei de Brooks" (*The Mythical Man-Month*): *"Adicionar força de trabalho a um projeto de software atrasado (ou acelerado) o torna mais atrasado."*

Para um ciclo de desenvolvimento de **apenas 1 dia**:
1.  **Overhead de Comunicação**: O tempo gasto explicando a arquitetura (MVC+Services+DDD) para 5 membros, revisando PRs e resolvendo conflitos consumiria cerca de 60-70% do tempo disponível.
2.  **Context Switching**: Manter o modelo mental de todo o sistema na cabeça de um único engenheiro permite refatorações globais em minutos (ex: "Mudar como o ID é gerado em todas as tabelas"). Em equipe, isso exigiria reuniões e aprovações.

---

## 4. Conclusão

A decisão de desenvolver a API de forma centralizada não foi uma exclusão da equipe, mas uma **Estratégia de Gestão de Crise e Qualidade**.

Optou-se por entregar um **Núcleo Arquitetural Sólido, Padronizado e Seguro**, pronto para que, **agora**, a equipe possa atuar na:
- Criação de Testes Unitários de ponta (cada um testa um módulo).
- Construção do Frontend (consumindo a API estável).
- Documentação e Auditoria.

**O resultado é uma API que parece ter levado semanas para ser construída, entregue em 24h.**
