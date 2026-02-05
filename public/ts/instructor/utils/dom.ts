export function setText(elementId: string, text: string): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
  }
}

export function setHTML(elementId: string, html: string): void {
  console.warn('setHTML() is deprecated due to XSS vulnerability. Use el() instead.');
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = html;
  }
}

export function getById(elementId: string): HTMLElement | null {
  return document.getElementById(elementId);
}

export function querySelector<T extends HTMLElement>(selector: string): T | null {
  return document.querySelector(selector) as T | null;
}

export function querySelectorAll<T extends HTMLElement>(selector: string): T[] {
  return Array.from(document.querySelectorAll(selector)) as T[];
}

export function addClass(element: HTMLElement | null, className: string): void {
  if (element) {
    element.classList.add(className);
  }
}

export function removeClass(element: HTMLElement | null, className: string): void {
  if (element) {
    element.classList.remove(className);
  }
}

export function toggleClass(element: HTMLElement | null, className: string): void {
  if (element) {
    element.classList.toggle(className);
  }
}

export function hasClass(element: HTMLElement | null, className: string): boolean {
  return element?.classList.contains(className) ?? false;
}

export function setupCurrencyMask(input: HTMLInputElement): void {
  const format = () => {
    let value = input.value.replace(/\D/g, ''); 
    if (!value) {
      input.value = '';
      return;
    }
    const amount = parseInt(value, 10) / 100;
    input.value = amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  input.addEventListener('input', format);
}

export function parseBRLPrice(priceStr: string): number {
  const rawValue = priceStr.replace(/\./g, '').replace(',', '.');
  return rawValue ? parseFloat(rawValue) : 0;
}

export function customConfirm(
  title: string,
  message: string,
): Promise<boolean> {
  return new Promise((resolve) => {
    const modal = document.getElementById('delete-confirm-modal');
    const titleEl = modal?.querySelector('.modal-title');
    const msgEl = document.getElementById('modal-msg');
    const btnCancel = document.getElementById('btn-modal-cancel');
    const btnConfirm = document.getElementById('btn-modal-confirm');

    if (!modal || !btnCancel || !btnConfirm) {
      resolve(window.confirm(message));
      return;
    }

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;

    modal.classList.add('active');

    const close = (result: boolean) => {
      modal.classList.remove('active');
      resolve(result);
      btnCancel.onclick = null;
      btnConfirm.onclick = null;
    };

    btnCancel.onclick = () => close(false);
    btnConfirm.onclick = () => close(true);
  });
}

export function preserveScroll(element: HTMLElement): () => void {
  const scrollTop = element.scrollTop;
  return () => {
    element.scrollTop = scrollTop;
  };
}

export function clearChildren(element: HTMLElement | null): void {
  if (element) {
    element.replaceChildren();
  }
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options?: {
    id?: string;
    className?: string | string[];
    textContent?: string;
  },
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);

  if (options) {
    if (options.id) element.id = options.id;
    if (options.className) {
      if (typeof options.className === 'string') {
        element.className = options.className;
      } else {
        element.classList.add(...options.className);
      }
    }
    if (options.textContent) element.textContent = options.textContent;
  }

  return element;
}

export function htmlToElement(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const element = wrapper.firstElementChild;
  if (!element) {
    throw new Error('Unable to parse HTML string');
  }
  return element as HTMLElement;
}

type EventHandler = (e: Event) => void;
type AttrValue = string | boolean | number | EventHandler;

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, AttrValue> | null,
  ...children: (Node | string | null | undefined)[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);

  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value == null || value === false) continue;

      if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.slice(2).toLowerCase();
        element.addEventListener(eventName, value as EventListener);
      } else if (key === 'className') {
        element.className = String(value);
      } else if (key === 'dataset') {
        Object.assign(element.dataset, value);
      } else if (typeof value === 'boolean') {
        element.setAttribute(key, '');
      } else {
        element.setAttribute(key, String(value));
      }
    }
  }

  for (const child of children) {
    if (child == null) continue;
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  }

  return element;
}

export function text(content: string): Text {
  return document.createTextNode(content);
}

export function fragment(...children: (Node | string | null | undefined)[]): DocumentFragment {
  const frag = document.createDocumentFragment();
  for (const child of children) {
    if (child == null) continue;
    if (typeof child === 'string') {
      frag.appendChild(document.createTextNode(child));
    } else {
      frag.appendChild(child);
    }
  }
  return frag;
}

export function icon(name: string, className?: string): HTMLSpanElement {
  return el('span', { className: `material-symbols-outlined ${className || ''}`.trim() }, name);
}
