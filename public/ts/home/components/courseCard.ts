import { el, icon } from '../utils/dom.js';
import { formatPrice } from '../utils/format.js';
import { Course } from '../../modules/courses.js';

/**
 * Renders a single course card
 */
export function renderCourseCard(course: Course): HTMLElement {
  const card = el('div', { className: 'card-base group cursor-pointer' });
  card.setAttribute('data-course-id', course.id);

  // Handle Image URL
  let imageUrl = course.coverImageUrl;
  let hasImage = false;
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
    imageUrl = '/' + imageUrl;
    hasImage = true;
  } else if (imageUrl) {
    hasImage = true;
  }

  const priceFormatted = formatPrice(course.price);
  const categoryName = course.category?.name || 'Sem Categoria';

  // Check enrollment status
  const isEnrolled = (course as any).isEnrolled === true;

  // Check if logged user is the course owner
  const userStr = localStorage.getItem('auth_user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isOwner =
    currentUser &&
    currentUser.id &&
    (course.instructorId === currentUser.id ||
      course.instructor?.id === currentUser.id);

  // Build card content
  card.appendChild(
    buildCardImage(
      hasImage,
      imageUrl,
      course.title,
      categoryName,
      isEnrolled,
      isOwner,
    ),
  );
  card.appendChild(buildCardBody(course, priceFormatted, isEnrolled, isOwner));

  return card;
}

function buildCardImage(
  hasImage: boolean,
  imageUrl: string | undefined,
  title: string,
  categoryName: string,
  isEnrolled: boolean,
  isOwner: boolean,
): HTMLElement {
  const container = el('div', { className: 'card-img-container' });

  if (hasImage && imageUrl) {
    const img = el('img', {
      alt: title,
      className: 'card-img',
      src: imageUrl,
    });
    img.onerror = function () {
      (this as HTMLImageElement).style.display = 'none';
      container.innerHTML = '';
      container.appendChild(buildPlaceholder());
      container.appendChild(
        el('div', { className: 'badge-tag bg-tag-primary' }, categoryName),
      );
    };
    container.appendChild(img);
  } else {
    container.appendChild(buildPlaceholder());
  }

  container.appendChild(
    el('div', { className: 'badge-tag bg-tag-primary' }, categoryName),
  );

  if (isEnrolled && !isOwner) {
    const badge = el(
      'div',
      {
        style:
          'position: absolute; top: 10px; right: 10px; background: #10b981; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold;',
      },
      'MATRICULADO',
    );
    container.appendChild(badge);
  }

  return container;
}

function buildPlaceholder(): HTMLElement {
  return el(
    'div',
    { className: 'card-img-placeholder' },
    icon('image'),
    el('span', { style: 'font-size: 0.75rem; opacity: 0.7;' }, 'Sem imagem'),
  );
}

function buildCardBody(
  course: Course,
  priceFormatted: string,
  isEnrolled: boolean,
  isOwner: boolean,
): HTMLElement {
  const body = el('div', { className: 'card-body' });

  // Title
  const titleEl = el(
    'h3',
    { className: 'card-title', title: course.title },
    course.title,
  );
  body.appendChild(titleEl);

  // Instructor
  const instructor = el(
    'div',
    { className: 'card-instructor' },
    el(
      'span',
      null,
      `Criado por: ${course.instructor?.name || 'Instrutor Desconhecido'}`,
    ),
  );
  body.appendChild(instructor);

  // Rating
  const rating = el(
    'div',
    {
      className: 'card-rating',
      style:
        'display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; margin-bottom: 0.5rem;',
    },
    el(
      'span',
      {
        className: 'material-symbols-outlined',
        style:
          "font-size: 1rem; color: #fbbf24; font-variation-settings: 'FILL' 1;",
      },
      'star',
    ),
    el(
      'span',
      { style: 'font-weight: 600; color: var(--text-primary);' },
      ((course as any).averageRating || 0).toFixed(1),
    ),
  );
  body.appendChild(rating);

  // Slots (only if not enrolled)
  if (!isEnrolled) {
    const slotsText =
      course.maxStudents === undefined || course.maxStudents === null
        ? '∞ Vagas ilimitadas'
        : `Vagas: ${course.maxStudents} / ${course.enrolledCount || 0}`;

    const slots = el(
      'div',
      {
        style:
          'font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;',
      },
      icon('group', 'font-size: 0.9rem; vertical-align: middle;'),
      ' ' + slotsText,
    );
    body.appendChild(slots);
  }

  // Footer
  const footer = el('div', { className: 'card-footer' });

  if (!isEnrolled) {
    footer.appendChild(el('span', { className: 'card-price' }, priceFormatted));
  } else {
    footer.appendChild(el('div'));
  }

  footer.appendChild(buildActionButton(course.id, isEnrolled, isOwner));
  body.appendChild(footer);

  return body;
}

function buildActionButton(
  courseId: string,
  isEnrolled: boolean,
  isOwner: boolean,
): HTMLElement {
  if (isOwner) {
    return el(
      'div',
      {
        className: 'owner-badge',
        style: `
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        border-radius: 0.5rem;
        height: 2rem;
        padding: 0 0.6rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.3rem;
        margin-left: auto;
        font-weight: 600;
        font-size: 0.7rem;
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        cursor: default;
      `,
        title: 'Você é o criador deste curso',
      },
      el(
        'span',
        { className: 'material-symbols-outlined', style: 'font-size: 0.9rem;' },
        'verified',
      ),
      el('span', null, 'CRIADOR'),
    );
  }

  if (isEnrolled) {
    return el(
      'a',
      {
        className: 'btn-icon btn-play-course',
        href: `/estudante/aula/${courseId}`,
        style: `
        background: #10b981;
        color: white;
        border-radius: 0.5rem;
        width: auto;
        height: 2rem;
        padding: 0 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-left: auto;
        font-weight: bold;
        font-size: 0.8rem;
        text-decoration: none;
      `,
        title: 'Você já possui este curso - Clique para assistir',
      },
      el(
        'span',
        {
          className: 'material-symbols-outlined',
          style: 'font-size: 1.25rem;',
        },
        'check_circle',
      ),
      el('span', null, 'Obtido'),
    );
  }

  return el(
    'button',
    {
      className: 'btn-icon btn-add-cart',
      'data-course-id': courseId,
      style: `
      background: var(--primary);
      color: var(--bg-dark);
      border-radius: 0.5rem;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: auto;
    `,
      title: 'Adicionar ao Carrinho',
    },
    el(
      'span',
      { className: 'material-symbols-outlined', style: 'font-size: 1.25rem;' },
      'shopping_cart',
    ),
  );
}
