/**
 * UI Helper Utility
 */

export interface UIHelper {
  apiFetch: (url: string, options?: RequestInit) => Promise<any>;
  showMessage: (msg: string, type: 'success' | 'error' | 'info') => void;
  promptModal: (title: string, msg: string) => Promise<boolean>;
  applyPriceMask: (input: HTMLInputElement) => void;
  getPriceValue: (input: HTMLInputElement) => number;
}

export const AppUI: UIHelper = {
  apiFetch: async (url: string, options: RequestInit = {}) => {
    console.log(`[API] ${url}`, options);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    // Auth Token Fallback (if cookies fail)
    const token = localStorage.getItem('auth_token');
    if (token) {
      console.log('[API] Using Fallback Token from localStorage');
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.log('[API] No Fallback Token found in localStorage');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies in requests
      });

      // Handle 204 No Content (no response body)
      if (response.status === 204) {
        return null;
      }

      const data = await response.json();

      if (!response.ok) {
        // Handle Session Expiry - only if user was actually logged in
        if (response.status === 401) {
          // Check if user was logged in (token is in HTTP-only cookie)
          const hadSession = localStorage.getItem('auth_user');
          if (hadSession) {
            console.warn('[API] Session expired');
            window.dispatchEvent(new CustomEvent('session-expired'));
          } else {
            console.log('[API] Unauthorized (no active session)');
          }
        }
        throw new Error(data.message || data.error || 'Erro na requisição');
      }
      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  },

  showMessage: (msg: string, type: 'success' | 'error' | 'info') => {
    // 1. Ensure Toast Container Exists
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    // 2. Create Toast Element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Icon based on type
    let icon = '';
    if (type === 'success')
      icon = '<span class="material-symbols-outlined">check_circle</span>';
    if (type === 'error')
      icon = '<span class="material-symbols-outlined">error</span>';
    if (type === 'info')
      icon = '<span class="material-symbols-outlined">info</span>';

    toast.innerHTML = `
            ${icon}
            <span>${msg}</span>
        `;

    // 3. Append to Container
    container.appendChild(toast);

    // 4. Auto-remove
    setTimeout(() => {
      toast.classList.add('toast-out');
      toast.addEventListener('animationend', () => {
        toast.remove();
        if (container?.childNodes.length === 0) {
          // Optional: remove container if empty, but keeping it is fine
        }
      });
    }, 3000); // 3 seconds
  },

  promptModal: async (title: string, msg: string) => {
    return confirm(`${title}\n\n${msg}`);
  },

  /**
   * Aplica máscara de preço estilo bancário (digita da direita para esquerda)
   * Exemplo: 1 → R$ 0,01 | 12 → R$ 0,12 | 123 → R$ 1,23
   */
  applyPriceMask: (input: HTMLInputElement) => {
    // Armazena o valor numérico (em centavos)
    let numericValue = 0;

    const formatDisplay = (valueInCents: number) => {
      const formatted = (valueInCents / 100).toFixed(2).replace('.', ',');
      return `R$ ${formatted}`;
    };

    const handleInput = (e: Event) => {
      const currentValue = input.value;

      // Remove tudo que não é dígito
      const digits = currentValue.replace(/\D/g, '');

      if (digits === '') {
        numericValue = 0;
        input.value = 'R$ 0,00';
        return;
      }

      // Converte para número (em centavos)
      numericValue = parseInt(digits, 10);

      // Limita a 9 dígitos (max R$ 9.999.999,99)
      if (numericValue > 999999999) {
        numericValue = 999999999;
      }

      // Formata e exibe
      input.value = formatDisplay(numericValue);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      // Permite: Backspace, Delete, Tab, Escape, Enter, setas
      if (
        [
          'Backspace',
          'Delete',
          'Tab',
          'Escape',
          'Enter',
          'ArrowLeft',
          'ArrowRight',
        ].includes(key) ||
        // Permite Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(key.toLowerCase()))
      ) {
        if (key === 'Backspace' || key === 'Delete') {
          e.preventDefault();
          // Remove o último dígito (divide por 10)
          numericValue = Math.floor(numericValue / 10);
          input.value = formatDisplay(numericValue);
        }
        return;
      }

      // Bloqueia tudo que não é número
      if (!/^\d$/.test(key)) {
        e.preventDefault();
        return;
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const pastedText = e.clipboardData?.getData('text') || '';
      const digits = pastedText.replace(/\D/g, '');

      if (digits) {
        numericValue = Math.min(parseInt(digits, 10), 999999999);
        input.value = formatDisplay(numericValue);
      }
    };

    // Inicializa com R$ 0,00
    input.value = 'R$ 0,00';
    input.setAttribute('data-price-cents', '0');

    // Event listeners
    input.addEventListener('input', handleInput);
    input.addEventListener('keydown', handleKeyDown);
    input.addEventListener('paste', handlePaste);

    // Armazena o valor numérico no dataset para recuperação
    input.addEventListener('input', () => {
      input.setAttribute('data-price-cents', numericValue.toString());
    });

    // Focus: seleciona tudo para facilitar digitação
    input.addEventListener('focus', () => {
      setTimeout(() => input.select(), 10);
    });
  },

  /**
   * Recupera o valor numérico (em reais) de um input com máscara
   */
  getPriceValue: (input: HTMLInputElement): number => {
    const cents = parseInt(input.getAttribute('data-price-cents') || '0', 10);
    return cents / 100;
  },
};
