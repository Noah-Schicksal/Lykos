/**
 * Helper to create a DOM element with attributes and children.
 * @param {string} tag - The HTML tag name.
 * @param {Object} attributes - Object of attribute key-values (class, id, src, etc).
 * @param {...(HTMLElement|string)} children - Child elements or text strings.
 * @returns {HTMLElement} The created element.
 */
export function createElement(tag, attributes = {}, ...children) {
    const element = document.createElement(tag);

    // Set attributes
    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset' && typeof value === 'object') {
            for (const [dataKey, dataValue] of Object.entries(value)) {
                element.dataset[dataKey] = dataValue;
            }
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
            const eventName = key.substring(2).toLowerCase();
            element.addEventListener(eventName, value);
        } else {
            element.setAttribute(key, value);
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
