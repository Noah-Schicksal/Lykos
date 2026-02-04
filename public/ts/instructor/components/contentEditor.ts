import { el, icon, fragment } from '../utils/dom.js';
import type { Module, Class } from '../state/instructorState.js';

export function renderContentTree(modules: Module[]): HTMLElement {
  const container = el('div', { className: 'content-tree' });

  if (modules.length === 0) {
    container.appendChild(renderEmptyModules());
  } else {
    modules.forEach(module => {
      container.appendChild(renderModule(module));
    });
  }

  container.appendChild(renderAddModuleSection());

  return container;
}

function renderEmptyModules(): HTMLElement {
  const emptyDiv = el('div', { className: 'empty-modules-placeholder' },
    el('p', { className: 'text-muted' }, 'Nenhum módulo criado.')
  );
  emptyDiv.style.textAlign = 'center';
  emptyDiv.style.padding = '2rem';
  emptyDiv.style.border = '1px dashed var(--dash-border)';
  emptyDiv.style.borderRadius = '0.5rem';
  emptyDiv.style.marginBottom = '1rem';
  return emptyDiv;
}

function renderAddModuleSection(): HTMLElement {
  const input = el('input', {
    type: 'text',
    id: 'new-module-title',
    className: 'tree-input',
    placeholder: 'Ex: Introdução ao JavaScript, Módulo 1, etc...'
  }) as HTMLInputElement;
  input.style.marginBottom = '0';
  input.style.flex = '1';

  const btn = el('button', {
    className: 'btn-primary-dash',
    'data-action': 'create-module'
  },
    el('span', { className: 'material-symbols-outlined', style: 'vertical-align: middle; font-size: 1rem;' }, 'add'),
    ' Criar Módulo'
  );
  btn.style.width = 'auto';
  btn.style.padding = '0.75rem 1.5rem';
  btn.style.whiteSpace = 'nowrap';

  return el('div', { className: 'add-module-section' },
    el('div', { className: 'add-module-header' },
      icon('add_circle'),
      el('h3', null, 'Adicionar Novo Módulo')
    ),
    el('p', { className: 'add-module-hint' }, 'Crie um módulo para organizar as aulas do seu curso'),
    el('div', { className: 'add-module-form' }, input, btn)
  );
}

function renderModule(module: Module): HTMLElement {
  const classes = module.classes || [];

  const editableTitle = el('span', {
    contenteditable: 'true',
    className: 'editable-title',
    'data-module-id': module.id,
    title: 'Clique para editar'
  }, module.title);

  const editHint = el('span', { className: 'material-symbols-outlined' }, 'edit');
  editHint.style.fontSize = '1rem';
  editHint.style.opacity = '0.5';
  editHint.style.cursor = 'help';
  editHint.title = 'Clique no título para editar';

  const deleteBtn = el('button', {
    className: 'tree-btn-icon',
    'data-action': 'delete-module',
    'data-id': module.id,
    title: 'Excluir Módulo'
  }, icon('delete'));

  const classList = el('div', { className: 'tree-class-list' },
    ...classes.map(cls => renderClass(cls)),
    el('button', {
      className: 'btn-add-inline',
      'data-action': 'create-class',
      'data-module-id': module.id
    },
      el('span', { className: 'material-symbols-outlined', style: 'vertical-align: middle; font-size: 1rem;' }, 'add'),
      ' Adicionar Aula'
    )
  );

  return el('div', { className: 'tree-module-node' },
    el('div', { className: 'tree-module-header' },
      el('div', { className: 'tree-module-title' },
        icon('folder'),
        editableTitle,
        editHint
      ),
      deleteBtn
    ),
    classList
  );
}

function renderClass(cls: Class): HTMLElement {
  const isVideoUploaded = cls.videoUrl && (
    cls.videoUrl.startsWith('/storage') ||
    (cls.videoUrl.startsWith('/classes/') && cls.videoUrl.endsWith('/video'))
  );

  const isMaterialUploaded = cls.materialUrl && (
    cls.materialUrl.startsWith('/storage') ||
    (cls.materialUrl.startsWith('/classes/') && cls.materialUrl.endsWith('/material'))
  );

  const editableTitle = el('span', {
    contenteditable: 'true',
    className: 'editable-title',
    'data-class-id': cls.id,
    title: 'Clique para editar'
  }, cls.title);

  const titleIcon = el('span', { className: 'material-symbols-outlined' }, 'article');
  titleIcon.style.fontSize = '1rem';

  const editHint = el('span', { className: 'material-symbols-outlined' }, 'edit');
  editHint.style.fontSize = '0.875rem';
  editHint.style.opacity = '0.5';
  editHint.style.cursor = 'help';
  editHint.title = 'Clique no título para editar';

  const closeIcon = el('span', { className: 'material-symbols-outlined' }, 'close');
  closeIcon.style.fontSize = '1rem';

  const deleteBtn = el('button', {
    className: 'tree-btn-icon',
    'data-action': 'delete-class',
    'data-id': cls.id,
    title: 'Excluir Aula'
  }, closeIcon);

  return el('div', { className: 'tree-class-item' },
    el('div', { className: 'tree-class-header' },
      el('div', { className: 'tree-class-title' },
        titleIcon,
        editableTitle,
        editHint
      ),
      deleteBtn
    ),
    el('div', { className: 'tree-input-group' },
      renderVideoInputRow(cls, !!isVideoUploaded),
      renderMaterialInputRow(cls, !!isMaterialUploaded)
    )
  );
}

function renderVideoInputRow(cls: Class, isUploaded: boolean): HTMLElement {
  const fileInput = el('input', {
    type: 'file',
    accept: 'video/mp4',
    'data-action': 'upload-video',
    'data-class-id': cls.id,
  }) as HTMLInputElement;
  fileInput.style.display = 'none';

  // Se tem vídeo interno uploaded
  if (isUploaded) {
    const uploadedCard = el('div', { className: 'media-card media-card-success' },
      el('div', { className: 'media-card-icon' }, icon('check_circle')),
      el('div', { className: 'media-card-content' },
        el('span', { className: 'media-card-title' }, 'Vídeo carregado'),
        el('span', { className: 'media-card-subtitle' }, 'Arquivo MP4')
      ),
      el('button', {
        type: 'button',
        className: 'media-card-action',
        'data-action': 'remove-video',
        'data-class-id': cls.id,
        title: 'Remover vídeo'
      }, icon('delete'))
    );
    return el('div', { className: 'media-input-wrapper' }, fileInput, uploadedCard);
  }

  // Dropzone para upload
  const dropZone = el('div', { 
    className: 'media-dropzone',
    'data-class-id': cls.id,
    'data-type': 'video'
  },
    el('div', { className: 'media-dropzone-content' },
      icon('movie'),
      el('span', { className: 'media-dropzone-text' }, 'Arraste um vídeo ou clique para selecionar'),
      el('span', { className: 'media-dropzone-hint' }, 'MP4 • Máx 500MB')
    )
  );

  // Event handlers
  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'video/mp4') {
        fileInput.files = files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });

  return el('div', { className: 'media-input-wrapper' },
    el('div', { className: 'media-input-label' },
      icon('movie'),
      el('span', null, 'Vídeo')
    ),
    fileInput,
    dropZone
  );
}

function renderMaterialInputRow(cls: Class, isUploaded: boolean): HTMLElement {
  const fileInput = el('input', {
    type: 'file',
    accept: '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar',
    'data-action': 'upload-material',
    'data-class-id': cls.id,
  }) as HTMLInputElement;
  fileInput.style.display = 'none';

  // Se tem material uploaded
  if (isUploaded) {
    const uploadedCard = el('div', { className: 'media-card media-card-success' },
      el('div', { className: 'media-card-icon' }, icon('check_circle')),
      el('div', { className: 'media-card-content' },
        el('span', { className: 'media-card-title' }, 'Material carregado'),
        el('span', { className: 'media-card-subtitle' }, 'Arquivo de apoio')
      ),
      el('button', {
        type: 'button',
        className: 'media-card-action',
        'data-action': 'remove-material',
        'data-class-id': cls.id,
        title: 'Remover material'
      }, icon('delete'))
    );
    return el('div', { className: 'media-input-wrapper' }, fileInput, uploadedCard);
  }

  // Dropzone para upload
  const dropZone = el('div', { 
    className: 'media-dropzone',
    'data-class-id': cls.id,
    'data-type': 'material'
  },
    el('div', { className: 'media-dropzone-content' },
      icon('description'),
      el('span', { className: 'media-dropzone-text' }, 'Arraste um arquivo ou clique para selecionar'),
      el('span', { className: 'media-dropzone-hint' }, 'PDF, DOC, PPT, XLS, ZIP')
    )
  );

  // Event handlers
  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      fileInput.files = files;
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  return el('div', { className: 'media-input-wrapper' },
    el('div', { className: 'media-input-label' },
      icon('description'),
      el('span', null, 'Material')
    ),
    fileInput,
    dropZone
  );
}
