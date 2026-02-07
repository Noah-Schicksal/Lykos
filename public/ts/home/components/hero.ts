import { el } from '../utils/dom.js';

/**
 * Renders the hero section
 */
export function renderHero(): HTMLElement {
  return el(
    'header',
    { className: 'hero' },
    el(
      'div',
      { className: 'hero-container' },
      el('div', { className: 'hero-glow' }),
      el(
        'h1',
        { className: 'hero-title' },
        'Ensino e Aprendizado ',
        el('span', { className: 'text-gradient' }, 'Conectados'),
      ),
      el(
        'p',
        { className: 'hero-description' },
        'Aprenda com especialistas ou crie seus próprios cursos de forma simples e prática.',
      ),
    ),
  );
}
