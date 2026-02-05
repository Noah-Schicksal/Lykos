import { el } from '../utils/dom.js';

export interface EmptyStateOptions {
  icon?: string;
  title?: string;
  description?: string;
}

const defaults: Required<EmptyStateOptions> = {
  icon: '',
  title: 'Nenhum curso selecionado',
  description: 'Crie um novo curso ou selecione um da barra lateral para começar.',
};

export function renderEmptyState(options?: EmptyStateOptions): HTMLElement {
  const { icon, title, description } = { ...defaults, ...options };

  const container = el('div', { className: 'empty-state' });
  
  // Only add icon element if icon is provided
  if (icon) {
    container.appendChild(el('div', { className: 'empty-state-icon' }, icon));
  }
  
  container.appendChild(el('h2', { className: 'empty-state-title' }, title));
  container.appendChild(el('p', { className: 'empty-state-description' }, description));
  
  return container;
}
