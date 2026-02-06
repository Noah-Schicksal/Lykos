import { el, icon } from '../utils/dom.js';
import { formatPrice } from '../utils/format.js';

export interface CartItemData {
  courseId: string;
  title: string;
  price: number;
  coverImageUrl?: string;
}

/**
 * Renders the cart sidebar
 */
export function renderCartSidebar(): HTMLElement {
  return el(
    'div',
    { id: 'cart-modal', className: 'cart-sidebar' },
    el(
      'div',
      { className: 'cart-sidebar-header' },
      el(
        'h3',
        { className: 'cart-sidebar-title' },
        icon('shopping_cart'),
        ' Seu Carrinho',
      ),
      el(
        'button',
        { id: 'close-cart-btn', className: 'btn-icon' },
        icon('close'),
      ),
    ),
    el(
      'div',
      { id: 'cart-items-list', className: 'cart-sidebar-content' },
      el('div', { className: 'cart-empty-msg' }, 'Seu carrinho está vazio.'),
    ),
    el(
      'div',
      { className: 'cart-sidebar-footer' },
      el(
        'div',
        { className: 'cart-total-row' },
        el('span', null, 'Total:'),
        el(
          'span',
          { id: 'cart-total-price', className: 'cart-total-price' },
          'R$ 0,00',
        ),
      ),
      el(
        'button',
        { id: 'btn-cart-checkout', className: 'btn-checkout', disabled: true },
        'Finalizar Compra',
      ),
    ),
  );
}

/**
 * Updates cart sidebar content
 */
export function updateCartSidebar(
  items: CartItemData[],
  onRemove: (courseId: string) => void,
): void {
  const container = document.getElementById('cart-items-list');
  const totalEl = document.getElementById('cart-total-price');
  const checkoutBtn = document.getElementById(
    'btn-cart-checkout',
  ) as HTMLButtonElement;

  if (!container) return;

  container.innerHTML = '';

  if (items.length === 0) {
    container.appendChild(
      el('div', { className: 'cart-empty-msg' }, 'Seu carrinho está vazio.'),
    );
    if (totalEl) totalEl.textContent = 'R$ 0,00';
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  let total = 0;

  items.forEach((item) => {
    total += item.price;

    const itemEl = el(
      'div',
      { className: 'cart-item', 'data-course-id': item.courseId },
      el(
        'div',
        { className: 'cart-item-info' },
        el('span', { className: 'cart-item-title' }, item.title),
        el('span', { className: 'cart-item-price' }, formatPrice(item.price)),
      ),
      el(
        'button',
        {
          className: 'btn-icon btn-remove-cart',
          'data-course-id': item.courseId,
          title: 'Remover do carrinho',
        },
        icon('delete'),
      ),
    );

    const removeBtn = itemEl.querySelector('.btn-remove-cart');
    removeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      onRemove(item.courseId);
    });

    container.appendChild(itemEl);
  });

  if (totalEl) totalEl.textContent = formatPrice(total);
  if (checkoutBtn) checkoutBtn.disabled = false;
}

/**
 * Updates the cart badge count
 */
export function updateCartBadge(count: number): void {
  const badge = document.getElementById('cart-count-badge');
  if (badge) {
    badge.textContent = count.toString();
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

/**
 * Sets up cart sidebar handlers
 */
export function setupCartSidebarHandlers(onCheckout: () => void): void {
  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartModal = document.getElementById('cart-modal');
  const checkoutBtn = document.getElementById('btn-cart-checkout');

  const toggleCart = () => {
    cartModal?.classList.toggle('open');
  };

  cartToggleBtn?.addEventListener('click', toggleCart);
  closeCartBtn?.addEventListener('click', toggleCart);

  // Close on overlay click
  cartModal?.addEventListener('click', (e) => {
    if (e.target === cartModal) {
      cartModal.classList.remove('open');
    }
  });

  checkoutBtn?.addEventListener('click', () => {
    if (!checkoutBtn.hasAttribute('disabled')) {
      onCheckout();
    }
  });
}
