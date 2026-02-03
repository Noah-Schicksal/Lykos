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
  const input = el('input', {
    type: 'text',
    className: `tree-input ${isUploaded ? 'uploaded' : ''}`,
    placeholder: 'URL do Vídeo (Youtube/Vimeo ou MP4)',
    value: isUploaded ? '✅ Vídeo Interno (.mp4)' : (cls.videoUrl || ''),
    'data-class-id': cls.id,
    'data-field': 'videoUrl',
    id: `video-url-${cls.id}`
  }) as HTMLInputElement;

  if (isUploaded) {
    input.readOnly = true;
    input.style.cursor = 'default';
    input.style.background = 'rgba(16, 185, 129, 0.05)';
    input.style.borderColor = 'rgba(16, 185, 129, 0.2)';
  } else {
    input.style.flex = '1';
  }

  const uploadIcon = el('span', { className: 'material-symbols-outlined' }, 'movie');
  uploadIcon.style.fontSize = '1.2rem';

  const fileInput = el('input', {
    type: 'file',
    accept: 'video/mp4',
    'data-action': 'upload-video',
    'data-class-id': cls.id,
    style: 'display: none;'
  });

  const uploadLabel = el('label', {
    className: 'btn-icon-small',
    title: 'Upload Vídeo (MP4)'
  }, uploadIcon, fileInput);
  applyUploadButtonStyle(uploadLabel);

  return el('div', { className: 'tree-input-row' }, input, uploadLabel);
}

function renderMaterialInputRow(cls: Class, isUploaded: boolean): HTMLElement {
  const input = el('input', {
    type: 'text',
    className: `tree-input ${isUploaded ? 'uploaded' : ''}`,
    placeholder: 'URL Material (Docs/PDF)',
    value: isUploaded ? '✅ Material de Apoio Carregado' : (cls.materialUrl || ''),
    'data-class-id': cls.id,
    'data-field': 'materialUrl',
    id: `material-url-${cls.id}`
  }) as HTMLInputElement;

  if (isUploaded) {
    input.readOnly = true;
    input.style.cursor = 'default';
    input.style.background = 'rgba(16, 185, 129, 0.05)';
    input.style.borderColor = 'rgba(16, 185, 129, 0.2)';
  } else {
    input.style.flex = '1';
  }

  const uploadIcon = el('span', { className: 'material-symbols-outlined' }, 'upload_file');
  uploadIcon.style.fontSize = '1.2rem';

  const fileInput = el('input', {
    type: 'file',
    'data-action': 'upload-material',
    'data-class-id': cls.id,
    style: 'display: none;'
  });

  const uploadLabel = el('label', {
    className: 'btn-icon-small',
    title: 'Upload Arquivo'
  }, uploadIcon, fileInput);
  applyUploadButtonStyle(uploadLabel);

  return el('div', { className: 'tree-input-row' }, input, uploadLabel);
}

function applyUploadButtonStyle(label: HTMLElement): void {
  label.style.cursor = 'pointer';
  label.style.border = '1px solid var(--border-light)';
  label.style.borderRadius = '4px';
  label.style.padding = '6px';
  label.style.display = 'flex';
  label.style.alignItems = 'center';
  label.style.justifyContent = 'center';
  label.style.background = 'var(--bg-card, rgba(94, 23, 235, 0.05))';
  label.style.flexShrink = '0';
}
