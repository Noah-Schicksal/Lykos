import { el, icon } from '../utils/dom.js';

/**
 * Renders the course details modal
 */
export function renderCourseModal(): HTMLElement {
  return el(
    'div',
    { id: 'course-modal', className: 'course-modal hidden' },
    el('div', { className: 'course-modal-overlay' }),
    el(
      'div',
      { className: 'course-modal-content' },
      el(
        'button',
        { id: 'close-modal', className: 'course-modal-close' },
        icon('close'),
      ),
      el(
        'div',
        { className: 'course-modal-body' },
        // Course Image
        el(
          'div',
          { className: 'course-modal-image-container' },
          el('img', {
            id: 'modal-course-img',
            src: '',
            alt: 'Course',
            className: 'course-modal-image',
          }),
          el(
            'div',
            { className: 'course-modal-badge', id: 'modal-course-category' },
            'Categoria',
          ),
        ),
        // Course Info
        el(
          'div',
          { className: 'course-modal-info' },
          el(
            'h2',
            { id: 'modal-course-title', className: 'course-modal-title' },
            'Título do Curso',
          ),
          el(
            'div',
            { className: 'course-modal-meta' },
            el(
              'div',
              { className: 'course-modal-meta-item' },
              icon('person'),
              el('span', { id: 'modal-course-instructor' }, 'Instrutor'),
            ),
            el(
              'div',
              { className: 'course-modal-meta-item' },
              icon('calendar_today'),
              el('span', { id: 'modal-course-date' }, 'Data'),
            ),
            el(
              'div',
              { className: 'course-modal-meta-item' },
              icon('groups'),
              el('span', { id: 'modal-course-slots' }, 'Vagas'),
            ),
          ),
          el(
            'p',
            { id: 'modal-course-desc', className: 'course-modal-description' },
            'Descrição do curso...',
          ),
          // Modules List
          el(
            'div',
            { className: 'course-modal-modules' },
            el(
              'h3',
              { className: 'course-modal-modules-title' },
              icon('list'),
              ' Módulos do Curso',
            ),
            el(
              'div',
              { id: 'modal-modules-list', className: 'modules-list' },
              el('p', { className: 'loading-msg' }, 'Carregando módulos...'),
            ),
          ),
          // Actions
          el(
            'div',
            { className: 'course-modal-actions' },
            el(
              'div',
              { className: 'course-modal-price' },
              el('span', { className: 'price-label' }, 'Preço:'),
              el(
                'span',
                { id: 'modal-course-price', className: 'price-value' },
                'R$ 0,00',
              ),
            ),
            el(
              'button',
              { id: 'modal-add-cart-btn', className: 'btn-modal-cart' },
              icon('shopping_cart'),
              ' Adicionar ao Carrinho',
            ),
          ),
        ),
      ),
    ),
  );
}

/**
 * Shows the course modal with data
 */
export function showCourseModal(courseData: {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  instructor: string;
  date: string;
  slots: string;
  imageUrl?: string;
}): void {
  const modal = document.getElementById('course-modal');
  if (!modal) return;

  const img = document.getElementById('modal-course-img') as HTMLImageElement;
  const title = document.getElementById('modal-course-title');
  const desc = document.getElementById('modal-course-desc');
  const price = document.getElementById('modal-course-price');
  const category = document.getElementById('modal-course-category');
  const instructor = document.getElementById('modal-course-instructor');
  const date = document.getElementById('modal-course-date');
  const slots = document.getElementById('modal-course-slots');
  const cartBtn = document.getElementById('modal-add-cart-btn');

  if (img) img.src = courseData.imageUrl || '';
  if (title) title.textContent = courseData.title;
  if (desc) desc.textContent = courseData.description;
  if (price) price.textContent = courseData.price;
  if (category) category.textContent = courseData.category;
  if (instructor) instructor.textContent = courseData.instructor;
  if (date) date.textContent = courseData.date;
  if (slots) slots.textContent = courseData.slots;
  if (cartBtn) cartBtn.setAttribute('data-course-id', courseData.id);

  modal.classList.remove('hidden');
}

/**
 * Hides the course modal
 */
export function hideCourseModal(): void {
  const modal = document.getElementById('course-modal');
  modal?.classList.add('hidden');
}

/**
 * Sets up course modal handlers
 */
export function setupCourseModalHandlers(): void {
  const modal = document.getElementById('course-modal');
  const closeBtn = document.getElementById('close-modal');
  const overlay = modal?.querySelector('.course-modal-overlay');

  closeBtn?.addEventListener('click', hideCourseModal);
  overlay?.addEventListener('click', hideCourseModal);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal?.classList.contains('hidden')) {
      hideCourseModal();
    }
  });
}
