/**
 * DOM Utility functions for course-detail components
 * Reutilizable helper functions for creating and manipulating DOM elements
 */

type ElementAttributes = {
    className?: string;
    id?: string;
    type?: string;
    href?: string;
    src?: string;
    alt?: string;
    placeholder?: string;
    value?: string;
    disabled?: boolean;
    required?: boolean;
    style?: string;
    title?: string;
    'data-id'?: string;
    'data-rating'?: string;
    'data-page'?: string;
    'aria-label'?: string;
    [key: string]: string | boolean | undefined;
};

/**
 * Create an HTML element with attributes and children
 */
export function el(
    tag: string,
    attrs?: ElementAttributes | null,
    ...children: (Node | string | null | undefined)[]
): HTMLElement {
    const element = document.createElement(tag);

    if (attrs) {
        for (const [key, value] of Object.entries(attrs)) {
            if (value === undefined || value === null) continue;

            if (key === 'className') {
                element.className = value as string;
            } else if (key === 'style' && typeof value === 'string') {
                element.style.cssText = value;
            } else if (typeof value === 'boolean') {
                if (value) {
                    element.setAttribute(key, '');
                }
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
 * Create a text node
 */
export function text(content: string): Text {
    return document.createTextNode(content);
}

/**
 * Clear all children from an element
 */
export function clearChildren(element: HTMLElement | null): void {
    if (!element) return;
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 * Create a Material Symbols icon span
 */
export function icon(name: string, additionalClass?: string): HTMLSpanElement {
    const span = document.createElement('span');
    span.className = additionalClass
        ? `material-symbols-outlined ${additionalClass}`
        : 'material-symbols-outlined';
    span.textContent = name;
    return span;
}

/**
 * Set innerHTML safely (use only with trusted content)
 */
export function setHTML(element: HTMLElement | null, html: string): void {
    if (element) {
        element.innerHTML = html;
    }
}

/**
 * Hide an element
 */
export function hide(element: HTMLElement | null): void {
    if (element) {
        element.classList.add('hidden');
    }
}

/**
 * Show an element
 */
export function show(element: HTMLElement | null): void {
    if (element) {
        element.classList.remove('hidden');
    }
}

/**
 * Toggle element visibility
 */
export function toggle(element: HTMLElement | null, visible?: boolean): void {
    if (!element) return;
    if (visible === undefined) {
        element.classList.toggle('hidden');
    } else {
        element.classList.toggle('hidden', !visible);
    }
}
