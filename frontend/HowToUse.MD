# Estrutura do Projeto e Guia de Desenvolvimento

Este documento fornece uma visão geral da estrutura do projeto e instruções passo a passo para criar novas páginas, componentes e utilizar os utilitários existentes.

## 📂 Estrutura de Diretórios

O código fonte está localizado na pasta `src` e segue a seguinte organização:

- **src/pages/**: Contém a lógica específica de cada página (scripts de entrada).
  - Ex: `src/pages/login/index.ts`
- **src/templates/**: Contém os arquivos HTML base para cada página.
  - Ex: `src/templates/login.html`
- **src/shared/**: Código compartilhado entre diferentes partes da aplicação.
  - **components/**: Componentes de UI reutilizáveis (Classes TS).
    - Ex: `CourseCard.ts`
  - **styles/**: Estilos globais e variáveis CSS.
    - Ex: `global.css`
  - **utils/**: Funções utilitárias.
    - Ex: `dom.ts` (helper para criação de elementos DOM)

## 🚀 Como Criar uma Nova Página

O projeto é uma Multi-Page Application (MPA). Para adicionar uma nova página (ex: "perfil"), você precisa seguir 3 passos principais:

### 1. Criar o Template HTML
Crie um arquivo HTML na pasta `src/templates/`.
**Arquivo:** `src/templates/perfil.html`
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Meu Perfil</title>
</head>
<body>
    <div id="app"></div>
</body>
</html>
```

### 2. Criar o Entry Point (TypeScript)
Crie uma pasta com o nome da página em `src/pages/` e um arquivo `index.ts` dentro dela.
**Arquivo:** `src/pages/perfil/index.ts`
```typescript
import '../../shared/styles/global.css'; // Importa estilos globais
import { el } from '../../shared/utils/dom';

const app = document.getElementById('app');

const title = el('h1', { className: 'page-title' }, 'Meu Perfil');
app?.appendChild(title);
```

### 3. Registrar no Webpack
Abra o arquivo `webpack.config.js` na raiz do projeto e registre a nova página em dois lugares:

**No objeto `entry`:**
```javascript
entry: {
    // ... outras páginas
    perfil: './src/pages/perfil/index.ts', // Adicione esta linha
},
```

**No array `plugins`:**
Adicione uma chamada para `createPage`:
```javascript
plugins: [
    // ...
    createPage('perfil'), // Adicione esta linha
    // ...
],
```

Após reiniciar o servidor (`npm start`), sua página estará acessível em `http://localhost:3000/perfil.html`.

---

## 🧩 Criando Novos Componentes

Os componentes são classes TypeScript que retornam elementos DOM gerados pelo utilitário `el`.

### Utilitário `el` (`src/shared/utils/dom.ts`)
Esta função facilita a criação de elementos HTML de forma programática.
**Sintaxe:** `el(tag, propriedades, ...filhos)`

### Exemplo de Criação de Componente
**Arquivo:** `src/shared/components/Botao.ts`
```typescript
import { el } from '../utils/dom';

export class Botao {
    constructor(private props: { text: string; onClick: () => void }) {}

    render(): HTMLElement {
        return el('button', 
            { 
                className: 'btn', 
                onClick: this.props.onClick 
            }, 
            this.props.text
        ) as HTMLElement;
    }
}
```

### Utilizando o Componente
```typescript
import { Botao } from '../../shared/components/Botao';

const meuBotao = new Botao({ 
    text: 'Clique Aqui', 
    onClick: () => alert('Clicou!') 
});

document.body.appendChild(meuBotao.render());
```

---

## 🎨 CSS e Estilização
### Utilize a metodologia BEM (Block Element Modifier) para evitar conflito
```
/* Bloco */
.meu-componente {
  border: 1px solid var(--gray-200);
  padding: 1rem;
}

/* Elemento */
.meu-componente__titulo {
  color: var(--primary-color);
  font-size: 1.5rem;
}
```
### Estilos Globais 
O arquivo `src/shared/styles/global.css` contém variáveis CSS (cores, fontes) e resets globais.
```css
:root {
    --primary: #007bff;
    --bg: #f4f4f4;
}
```
Para usar essas variáveis em componentes ou outros arquivos CSS:
```css
.minha-classe {
    background-color: var(--primary);
}
```

### Adicionando CSS
Você pode criar arquivos CSS específicos para componentes ou páginas e importá-los diretamente no arquivo TypeScript correspondente:
```typescript
import './style.css';
```
O Webpack se encarregará de processar e injetar os estilos.
