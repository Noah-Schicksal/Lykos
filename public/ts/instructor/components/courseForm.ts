import { el, icon } from '../utils/dom.js';
import type { Course, Category } from '../state/instructorState.js';
import { setupCurrencyMask } from '../utils/dom.js';

function formGroup(labelText: string, input: HTMLElement): HTMLElement {
  return el('div', { className: 'form-group' },
    el('label', { className: 'form-label' }, labelText),
    input
  );
}

function textInput(id: string, placeholder: string, value: string, required = false): HTMLInputElement {
  const input = el('input', {
    id,
    type: 'text',
    className: 'form-input',
    placeholder,
    value,
  }) as HTMLInputElement;
  if (required) input.required = true;
  return input;
}

function numberInput(id: string, placeholder: string, value: string, min?: string): HTMLInputElement {
  const input = el('input', {
    id,
    type: 'number',
    className: 'form-input',
    placeholder,
    value,
  }) as HTMLInputElement;
  if (min) input.min = min;
  return input;
}

function textareaInput(id: string, placeholder: string, value: string, rows: number, required = false): HTMLTextAreaElement {
  const textarea = el('textarea', {
    id,
    className: 'form-input',
    placeholder,
    rows: String(rows),
  }, value) as HTMLTextAreaElement;
  if (required) textarea.required = true;
  return textarea;
}

function categorySelect(categories: Category[], selectedId?: string): HTMLSelectElement {
  const select = el('select', {
    id: 'course-category',
    className: 'form-input',
    required: true,
  },
    el('option', { value: '' }, 'Selecione uma categoria...'),
    ...categories.map(cat =>
      el('option', { value: cat.id, selected: selectedId === cat.id ? true : false }, cat.name)
    ),
    el('option', { value: '__new_category__' }, '+ Nova Categoria')
  ) as HTMLSelectElement;
  return select;
}

export function renderCourseForm(
  course?: Course,
  categories: Category[] = [],
): HTMLElement {
  const isEdit = !!course;
  const title = isEdit ? 'Editar Curso' : 'Novo Curso';

  const priceInput = textInput('course-price', '0,00', formatPrice(course?.price), true);

  const form = el('form', { id: 'course-inline-form', className: 'form-panel' },
    el('input', { type: 'hidden', id: 'course-id', value: course?.id || '' }),

    formGroup('Título do Curso *',
      textInput('course-title', 'ex: Desenvolvimento Avançado em React', course?.title || '', true)
    ),

    formGroup('Descrição *',
      textareaInput('course-description', 'Descreva seu curso...', course?.description || '', 5, true)
    ),

    el('div', { className: 'form-row' },
      formGroup('Preço (R$) *', priceInput),
      formGroup('Categoria *', categorySelect(categories, course?.categoryId)),
      formGroup('Máximo de Alunos',
        numberInput('course-max-students', 'Ilimitado', course?.maxStudents?.toString() || '', '1')
      )
    ),

    renderImageUpload(course?.coverImage),

    !isEdit ? renderVideoUpload() : null,

    el('div', { className: 'form-actions' },
      el('button', { type: 'button', id: 'btn-cancel-form', className: 'btn-secondary-dash' }, 'Cancelar'),
      el('button', { type: 'submit', className: 'btn-primary-dash' }, 'Salvar Curso')
    )
  );

  setupCurrencyMask(priceInput as HTMLInputElement);

  return el('div', null,
    el('div', { className: 'content-header' },
      el('h2', { className: 'page-title' }, title)
    ),
    form
  );
}

function renderImageUpload(coverImage?: string): HTMLElement {
  const previewContainer = el('div', { id: 'cover-preview-container' });

  if (coverImage) {
    const previewImg = el('img', {
      src: coverImage,
      alt: 'Cover',
      className: 'cover-preview-img'
    }) as HTMLImageElement;
    previewImg.style.maxWidth = '200px';
    previewImg.style.maxHeight = '150px';
    previewImg.style.marginTop = '10px';
    previewImg.style.marginBottom = '10px';
    previewImg.style.borderRadius = '8px';
    previewImg.style.objectFit = 'cover';
    previewContainer.appendChild(previewImg);
  }

  return formGroup('Imagem de Capa',
    el('div', { className: 'file-upload' },
      el('input', {
        id: 'course-cover',
        type: 'file',
        accept: 'image/*,.webp',
        className: 'form-input'
      }),
      previewContainer
    )
  );
}

function renderVideoUpload(): HTMLElement {
  const hint = el('p', { className: 'text-muted' },
    'Se selecionado, uma aula de introdução será criada automaticamente com este vídeo.'
  );
  hint.style.fontSize = '0.8rem';
  hint.style.marginTop = '0.5rem';

  return el('div', { className: 'form-group file-upload-wrapper' },
    el('label', { className: 'form-label' }, 'Vídeo de Introdução (Opcional)'),
    el('div', { className: 'file-upload' },
      el('input', {
        id: 'course-video-intro',
        type: 'file',
        accept: 'video/mp4',
        className: 'form-input'
      }),
      hint
    )
  );
}

function formatPrice(price?: number): string {
  if (!price) return '';
  return price.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
