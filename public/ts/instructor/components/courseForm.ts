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

  // Usa categoryId ou category.id como fallback
  const selectedCategoryId = course?.categoryId || course?.category?.id;

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
      formGroup('Categoria *', categorySelect(categories, selectedCategoryId)),
      formGroup('Máximo de Alunos',
        numberInput('course-max-students', 'Ilimitado', course?.maxStudents?.toString() || '', '1')
      )
    ),

    renderImageUpload(course?.coverImageUrl || course?.coverImage),

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
  const fileInput = el('input', {
    id: 'course-cover',
    type: 'file',
    accept: 'image/*,.webp',
  }) as HTMLInputElement;
  fileInput.style.display = 'none';

  // Dropzone - área de upload vazia (estilo consistente com upload de vídeo das aulas)
  const dropZone = el('div', { 
    className: 'media-dropzone',
    id: 'cover-dropzone',
    style: coverImage ? 'display: none;' : ''
  },
    el('div', { className: 'media-dropzone-content' },
      icon('add_photo_alternate'),
      el('span', { className: 'media-dropzone-text' }, 'Arraste uma imagem ou clique para selecionar'),
      el('span', { className: 'media-dropzone-hint' }, 'PNG, JPG ou WebP • 1280×720 recomendado • Máx 5MB')
    )
  );

  // Card de sucesso - quando já tem imagem
  const uploadedCard = el('div', { 
    className: 'media-card media-card-success media-card-image', 
    id: 'cover-uploaded-card',
    style: coverImage ? '' : 'display: none;'
  },
    el('div', { className: 'media-card-preview' },
      el('img', {
        src: coverImage || '',
        alt: 'Capa do curso',
        className: 'media-card-thumb',
        id: 'cover-preview-img'
      })
    ),
    el('div', { className: 'media-card-icon' }, icon('check_circle')),
    el('div', { className: 'media-card-content' },
      el('span', { className: 'media-card-title', id: 'cover-filename' }, coverImage ? 'Imagem de capa' : ''),
      el('span', { className: 'media-card-subtitle', id: 'cover-info' }, 'Capa definida')
    ),
    el('button', {
      type: 'button',
      className: 'media-card-action',
      id: 'btn-remove-cover',
      title: 'Remover imagem'
    }, icon('delete'))
  );

  const wrapper = el('div', { className: 'media-input-wrapper' },
    el('div', { className: 'media-input-label' },
      icon('image'),
      el('span', null, 'Imagem de Capa')
    ),
    fileInput,
    dropZone,
    uploadedCard
  );

  // Events - Dropzone
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', (e) => { 
    e.preventDefault(); 
    dropZone.classList.add('dragover'); 
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer?.files?.length) {
      fileInput.files = e.dataTransfer.files;
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  // Event - File input change
  fileInput.addEventListener('change', () => {
    if (fileInput.files?.[0]) {
      const file = fileInput.files[0];
      
      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        import('../../utils/ui.js').then(({ AppUI }) => {
          AppUI.showMessage('A imagem deve ter no máximo 5MB', 'error');
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const previewImg = uploadedCard.querySelector('#cover-preview-img') as HTMLImageElement;
        const filenameEl = uploadedCard.querySelector('#cover-filename');
        const infoEl = uploadedCard.querySelector('#cover-info');
        
        if (previewImg) previewImg.src = ev.target?.result as string;
        if (filenameEl) filenameEl.textContent = file.name;
        if (infoEl) {
          const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
          infoEl.textContent = `${sizeMB} MB`;
        }
        
        dropZone.style.display = 'none';
        uploadedCard.style.display = 'flex';
        delete (fileInput as any)._cleared;
      };
      reader.readAsDataURL(file);
    }
  });

  // Event - Remove button
  uploadedCard.querySelector('#btn-remove-cover')?.addEventListener('click', () => {
    fileInput.value = '';
    uploadedCard.style.display = 'none';
    dropZone.style.display = '';
    (fileInput as any)._cleared = true;
  });

  return wrapper;
}

function formatPrice(price?: number): string {
  if (!price) return '';
  return price.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
