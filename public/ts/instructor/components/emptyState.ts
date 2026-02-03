import { el } from '../utils/dom.js';

export interface EmptyStateOptions {
  icon?: string;
  title?: string;
  description?: string;
}

const defaults: Required<EmptyStateOptions> = {
  icon: '📚',
  title: 'Nenhum curso selecionado',
  description: 'Crie um novo curso ou selecione um da barra lateral para começar.',
};

export function renderEmptyState(options?: EmptyStateOptions): HTMLElement {
  const { icon, title, description } = { ...defaults, ...options };

  return el('div', { className: 'empty-state' },
    el('div', { className: 'empty-state-icon' }, icon),
    el('h2', { className: 'empty-state-title' }, title),
    el('p', { className: 'empty-state-description' }, description)
  );
}
