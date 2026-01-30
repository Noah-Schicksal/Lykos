/**
 * UI Helper Utility
 */
export const AppUI = {
    renderCartCount: () => {
        const badge = document.getElementById('cart-count-badge');
        if (!badge)
            return;
        const count = 0;
        badge.textContent = count.toString();
        badge.style.display = count > 0 ? 'flex' : 'none';
    },
    apiFetch: async (url, options = {}) => {
        console.log(`[API] ${url}`, options);
        const headers = {
            'Content-Type': 'application/json',
        };
        if (options.headers) {
            Object.assign(headers, options.headers);
        }
        try {
            const response = await fetch(url, { ...options, headers });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || data.error || 'Erro na requisição');
            }
            return data;
        }
        catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    showMessage: (msg, type) => {
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
    promptModal: async (title, msg) => {
        return confirm(`${title}\n\n${msg}`);
    }
};
