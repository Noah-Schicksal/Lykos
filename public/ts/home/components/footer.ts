import { el, icon } from '../utils/dom.js';

/**
 * Renders the footer
 */
export function renderFooter(): HTMLElement {
  return el(
    'footer',
    { className: 'home-footer' },
    el(
      'div',
      { className: 'home-footer-content' },
      el(
        'p',
        { className: 'home-footer-text' },
        '© 2026 Lykos. Todos os direitos reservados.',
      ),
    ),
  );
}
