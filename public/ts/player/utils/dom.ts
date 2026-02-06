/**
 * DOM Utilities for Player
 */

type ElementAttributes = {
  [key: string]: string | boolean | EventListener;
};

/**
 * Create an HTML element with attributes and children
 */
export function el(
  tag: string,
  attrs?: ElementAttributes | null,
  ...children: (HTMLElement | string | null | undefined)[]
): HTMLElement {
  const element = document.createElement(tag);

  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(
          key.slice(2).toLowerCase(),
          value as EventListener,
        );
      } else if (key === 'className') {
        element.className = value as string;
      } else if (typeof value === 'boolean') {
        if (value) element.setAttribute(key, '');
      } else {
        element.setAttribute(key, value as string);
      }
    }
  }

  for (const child of children) {
    if (child === null || child === undefined) continue;
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  }

  return element;
}

/**
 * Create a Material Symbols icon
 */
export function icon(name: string, className?: string): HTMLElement {
  const span = document.createElement('span');
  span.className = `material-symbols-outlined${className ? ' ' + className : ''}`;
  span.textContent = name;
  return span;
}

/**
 * Clear all children from an element
 */
export function clearChildren(element: HTMLElement): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Format time in seconds to MM:SS
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}
