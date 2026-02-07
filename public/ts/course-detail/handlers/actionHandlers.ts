/**
 * Action Handlers - buy, add to cart, share actions
 */

import { Cart } from '../../modules/cart.js';
import { AppUI } from '../../utils/ui.js';
import { Course } from '../../modules/courses.js';
import {
    updateSidebarForEnrolled,
    updateSidebarForCreator,
    showActionButtons
} from '../components/sidebar.js';
import { loadCartItems } from './cartHandlers.js';

let actionButtonsInitialized = false;

export function setupActionButtons(courseId: string): void {
    if (actionButtonsInitialized) return;

    const btnBuyNow = document.getElementById('btn-buy-now');
    const btnAddToCart = document.getElementById('btn-add-to-cart');

    if (btnAddToCart) {
        const newBtnAddToCart = btnAddToCart.cloneNode(true) as HTMLElement;
        btnAddToCart.parentNode?.replaceChild(newBtnAddToCart, btnAddToCart);

        newBtnAddToCart.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const btn = e.currentTarget as HTMLButtonElement;
            if (btn.disabled) return;
            btn.disabled = true;

            try {
                if (!localStorage.getItem('auth_user')) {
                    AppUI.showMessage('Por favor, faça login para adicionar ao carrinho.', 'info');
                    return;
                }

                await Cart.add(courseId);
            } finally {
                setTimeout(() => {
                    btn.disabled = false;
                }, 1000);
            }
        });
    }

    if (btnBuyNow) {
        const newBtnBuyNow = btnBuyNow.cloneNode(true) as HTMLElement;
        btnBuyNow.parentNode?.replaceChild(newBtnBuyNow, btnBuyNow);

        newBtnBuyNow.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const btn = e.currentTarget as HTMLButtonElement;
            if (btn.disabled) return;
            btn.disabled = true;

            try {
                if (!localStorage.getItem('auth_user')) {
                    AppUI.showMessage('Por favor, faça login para comprar.', 'info');
                    return;
                }

                const success = await Cart.add(courseId, false);
                if (success) {
                    AppUI.showMessage('Curso adicionado! Finalize sua compra no carrinho.', 'success');

                    const cartModal = document.getElementById('cart-modal');
                    if (cartModal) {
                        cartModal.classList.add('show');
                        document.body.style.overflow = 'hidden';
                        loadCartItems();
                    }
                }
            } finally {
                setTimeout(() => {
                    btn.disabled = false;
                }, 1000);
            }
        });
    }

    actionButtonsInitialized = true;
}

export function setupShareButton(): void {
    const btnShare = document.getElementById('btn-share-course');

    if (btnShare) {
        btnShare.addEventListener('click', async () => {
            const courseUrl = window.location.href;
            try {
                await navigator.clipboard.writeText(courseUrl);
                AppUI.showMessage('Link copiado para a área de transferência!', 'success');
            } catch (error) {
                const textArea = document.createElement('textarea');
                textArea.value = courseUrl;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.select();

                try {
                    document.execCommand('copy');
                    AppUI.showMessage('Link copiado para a área de transferência!', 'success');
                } catch (err) {
                    AppUI.showMessage('Erro ao copiar link', 'error');
                }

                document.body.removeChild(textArea);
            }
        });
    }
}

export function checkIfUserIsCreator(course: Course): void {
    const authUser = localStorage.getItem('auth_user');

    // First check if user is enrolled
    if (course.isEnrolled) {
        updateSidebarForEnrolled();
        return;
    }

    if (!authUser) {
        showActionButtons();
        return;
    }

    try {
        const user = JSON.parse(authUser);
        const isCreator = course.instructor?.id === user.id;

        if (isCreator) {
            updateSidebarForCreator();
        } else {
            showActionButtons();
        }
    } catch (error) {
        console.error('Error checking creator status:', error);
        showActionButtons();
    }
}
