import { el, fragment } from '../utils/dom.js';

export function renderModals(): DocumentFragment {
  return fragment(
    renderConfirmModal(),
    renderCategoryModal()
  );
}

function renderConfirmModal(): HTMLElement {
  return el('div', { id: 'delete-confirm-modal', className: 'modal-overlay' },
    el('div', { className: 'modal-box' },
      el('h3', { className: 'modal-title' }, 'Confirmar Exclusão'),
      el('p', { id: 'modal-msg', className: 'modal-message' },
        'Tem certeza que deseja excluir? Esta ação não pode ser desfeita.'
      ),
      el('div', { className: 'modal-actions' },
        el('button', { id: 'btn-modal-cancel', className: 'btn-secondary-dash' }, 'Cancelar'),
        el('button', { id: 'btn-modal-confirm', className: 'btn-danger' }, 'Sim, Excluir')
      )
    )
  );
}

function renderCategoryModal(): HTMLElement {
  return el('div', { id: 'category-modal', className: 'modal-overlay' },
    el('div', { className: 'modal-box' },
      el('h3', { className: 'modal-title' }, 'Nova Categoria'),
      el('p', { className: 'modal-message' }, 'Digite o nome da nova categoria:'),
      el('div', { className: 'form-group' },
        el('input', {
          type: 'text',
          id: 'modal-category-name',
          className: 'form-input',
          placeholder: 'Nome da categoria',
          maxlength: '50'
        })
      ),
      el('div', { className: 'modal-actions' },
        el('button', { id: 'btn-cat-modal-cancel', className: 'btn-secondary-dash' }, 'Cancelar'),
        el('button', { id: 'btn-cat-modal-save', className: 'btn-primary-dash' }, 'Criar Categoria')
      )
    )
  );
}

export async function showDeleteConfirm(
  title: string,
  message: string,
): Promise<boolean> {
  return new Promise((resolve) => {
    const modal = document.getElementById('delete-confirm-modal');
    const titleEl = modal?.querySelector('.modal-title') as HTMLElement | null;
    const msgEl = document.getElementById('modal-msg');
    const btnCancel = document.getElementById('btn-modal-cancel');
    const btnConfirm = document.getElementById('btn-modal-confirm');

    if (!modal || !btnCancel || !btnConfirm) {
      resolve(window.confirm(message));
      return;
    }

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;

    modal.classList.add('active');

    const close = (result: boolean) => {
      modal.classList.remove('active');
      resolve(result);
      btnCancel.onclick = null;
      btnConfirm.onclick = null;
    };

    btnCancel.onclick = () => close(false);
    btnConfirm.onclick = () => close(true);
  });
}

export async function showCategoryModal(): Promise<string | null> {
  return new Promise((resolve) => {
    const modal = document.getElementById('category-modal');
    const input = document.getElementById(
      'modal-category-name',
    ) as HTMLInputElement | null;
    const btnCancel = document.getElementById('btn-cat-modal-cancel');
    const btnSave = document.getElementById('btn-cat-modal-save');

    if (!modal || !input || !btnCancel || !btnSave) {
      const name = window.prompt('Nome da categoria:');
      resolve(name);
      return;
    }

    input.value = '';
    modal.classList.add('active');
    input.focus();

    const close = (result: string | null) => {
      modal.classList.remove('active');
      resolve(result);
      btnCancel.onclick = null;
      btnSave.onclick = null;
      input.onkeypress = null;
    };

    btnCancel.onclick = () => close(null);
    btnSave.onclick = () => {
      const value = input.value.trim();
      close(value || null);
    };

    input.onkeypress = (e) => {
      if (e.key === 'Enter') {
        const value = input.value.trim();
        close(value || null);
      }
    };
  });
}
