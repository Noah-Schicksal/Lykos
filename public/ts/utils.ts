/**
 * Helper to create a DOM element with attributes and children.
 * @param tag - The HTML tag name.
 * @param attributes - Object of attribute key-values (class, id, src, etc).
 * @param children - Child elements or text strings.
 * @returns The created element.
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    attributes: Partial<HTMLElement> & Record<string, any> = {},
    ...children: (Node | string | (Node | string)[])[]
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);

    // Set attributes
    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'className') {
            element.className = value as string;
        } else if (key === 'dataset' && typeof value === 'object') {
            for (const [dataKey, dataValue] of Object.entries(value)) {
                element.dataset[dataKey] = dataValue as string;
            }
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
            const eventName = key.substring(2).toLowerCase();
            element.addEventListener(eventName, value as EventListener);
        } else {
            element.setAttribute(key, value as string);
        }
    }

    // Append children
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            element.appendChild(child);
        } else if (Array.isArray(child)) {
            // Handle array of children
            child.forEach(c => {
                if (typeof c === 'string') {
                    element.appendChild(document.createTextNode(c));
                } else if (c instanceof Node) {
                    element.appendChild(c);
                }
            });
        }
    });

    return element;
}

/**
 * Loads a CSS file dynamically.
 * @param path - Path to the CSS file.
 */
export function loadCSS(path: string): void {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    document.head.appendChild(link);
}
