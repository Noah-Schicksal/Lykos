export function el(tag: string, props: Record<string, any> = {}, ...children: (Node | string)[]) {
  const element = document.createElement(tag);
  Object.entries(props).forEach(([key, value]) => {
    if (key === 'className') element.className = value;
    else if (key.startsWith('on') && typeof value === 'function') element.addEventListener(key.substring(2).toLowerCase(), value);
    else if (key === 'dataset') Object.assign(element.dataset, value);
    else element.setAttribute(key, String(value));
  });
  children.forEach(child => element.appendChild(typeof child === 'string' ? document.createTextNode(child) : child));
  return element;
}