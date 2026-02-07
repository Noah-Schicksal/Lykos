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

export function clearChildren(element: HTMLElement | null): void {
    if (element) {
        element.replaceChildren();
    }
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
