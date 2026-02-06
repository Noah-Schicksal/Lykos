/**
 * User Drawer component - lateral drawer with profile and navigation
 */

import { el, icon } from '../utils/dom.js';

export function renderUserDrawer(): HTMLElement {
    const drawer = el('div', { id: 'user-drawer', className: 'user-drawer' },
        // Header
        el('div', { className: 'user-drawer-header' },
            el('button', { id: 'menu-drawer-btn', className: 'btn-icon menu-toggle-btn' },
                icon('menu')
            )
        ),

        // Content
        el('div', { className: 'user-drawer-content' },
            // Back to Home
            el('div', { className: 'drawer-section' },
                el('a', {
                    href: '/inicio',
                    className: 'drawer-item',
                    style: 'background: var(--primary-gradient); color: white; font-weight: 600;'
                },
                    icon('home'),
                    'Voltar para Home'
                )
            ),

            // Profile Section
            el('div', { className: 'drawer-section' },
                el('button', { id: 'drawer-profile-toggle', className: 'drawer-section-header' },
                    el('span', { className: 'drawer-section-title' },
                        icon('person'),
                        'Perfil'
                    ),
                    icon('expand_more', 'drawer-chevron')
                ),
                el('div', { id: 'drawer-profile-panel', className: 'drawer-accordion-panel' },
                    // View Mode
                    el('div', { id: 'drawer-profile-view' },
                        el('div', { className: 'drawer-profile-info' },
                            el('div', { className: 'drawer-avatar' },
                                icon('account_circle')
                            ),
                            el('div', { className: 'drawer-info-row' },
                                el('p', { id: 'drawer-user-name', className: 'drawer-user-name' }, 'Nome do Usuário')
                            ),
                            el('div', { className: 'drawer-info-row' },
                                el('span', { className: 'drawer-info-label' }, 'EMAIL'),
                                el('p', { id: 'drawer-user-email', className: 'drawer-user-email' }, 'email@exemplo.com')
                            ),
                            el('div', { className: 'drawer-info-row' },
                                el('span', { className: 'drawer-info-label' }, 'FUNÇÃO'),
                                el('span', { id: 'drawer-user-role', className: 'drawer-role-badge' }, 'Aluno')
                            )
                        ),
                        el('div', { className: 'drawer-profile-actions' },
                            el('button', { id: 'drawer-edit-profile', className: 'drawer-btn primary' },
                                icon('edit'),
                                'Editar Perfil'
                            ),
                            el('button', { id: 'drawer-delete-account', className: 'drawer-btn danger' },
                                icon('delete'),
                                'Excluir Conta'
                            )
                        )
                    ),

                    // Edit Mode
                    el('div', { id: 'drawer-profile-edit', className: 'hidden', style: 'padding: 0 0.5rem' },
                        el('div', { style: 'display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;' },
                            el('h4', { style: 'margin: 0; color: var(--text-primary)' }, 'Editar Perfil'),
                            el('button', { id: 'drawer-cancel-edit', className: 'btn-icon', type: 'button' },
                                icon('close')
                            )
                        ),
                        el('form', { id: 'profile-edit-form', novalidate: true },
                            el('div', { className: 'form-group' },
                                el('label', { className: 'form-label', style: 'font-size: 0.7rem' }, 'Nome'),
                                (() => {
                                    const input = document.createElement('input');
                                    input.id = 'edit-name';
                                    input.type = 'text';
                                    input.className = 'form-input';
                                    input.placeholder = 'Seu nome';
                                    input.style.fontSize = '0.85rem';
                                    return input;
                                })()
                            ),
                            el('div', { className: 'form-group' },
                                el('label', { className: 'form-label', style: 'font-size: 0.7rem' }, 'Email'),
                                (() => {
                                    const input = document.createElement('input');
                                    input.id = 'edit-email';
                                    input.type = 'email';
                                    input.className = 'form-input';
                                    input.placeholder = 'seu@email.com';
                                    input.style.fontSize = '0.85rem';
                                    return input;
                                })()
                            ),
                            el('div', { className: 'form-group' },
                                el('label', { className: 'form-label', style: 'font-size: 0.7rem' }, 'Nova Senha'),
                                el('div', { className: 'password-wrapper' },
                                    (() => {
                                        const input = document.createElement('input');
                                        input.id = 'edit-password';
                                        input.type = 'password';
                                        input.className = 'form-input';
                                        input.placeholder = 'Opcional';
                                        input.style.fontSize = '0.85rem';
                                        return input;
                                    })(),
                                    el('button', { type: 'button', className: 'btn-toggle-password', 'data-target': 'edit-password' },
                                        icon('visibility')
                                    )
                                )
                            ),
                            el('button', { type: 'submit', className: 'drawer-btn primary', style: 'width: 100%; justify-content: center; margin-top: 1rem' },
                                'Salvar'
                            )
                        )
                    )
                )
            ),

            // Management Section (Instructors only)
            el('div', { id: 'drawer-management-section', className: 'drawer-section hidden' },
                el('div', { className: 'drawer-section-label' }, 'Gerenciamento'),
                el('a', { href: '/professor', className: 'drawer-item' },
                    icon('dashboard'),
                    'Painel do Professor'
                ),
                el('button', { id: 'drawer-categories-toggle', className: 'drawer-section-header' },
                    el('span', { className: 'drawer-section-title' },
                        icon('category'),
                        'Categorias'
                    ),
                    icon('expand_more', 'drawer-chevron')
                ),
                el('div', { id: 'drawer-categories-panel', className: 'drawer-accordion-panel' },
                    el('form', { id: 'category-create-form', className: 'category-form' },
                        el('div', { className: 'form-group' },
                            el('label', { className: 'form-label' }, 'Nome da Nova Categoria'),
                            el('div', { className: 'category-input-group' },
                                (() => {
                                    const input = document.createElement('input');
                                    input.id = 'new-category-name';
                                    input.type = 'text';
                                    input.className = 'form-input';
                                    input.placeholder = 'ex: Dev Web';
                                    input.required = true;
                                    return input;
                                })(),
                                el('button', { type: 'submit', className: 'btn-add' },
                                    icon('add')
                                )
                            )
                        )
                    ),
                    el('div', { className: 'drawer-categories-wrapper' },
                        el('label', { className: 'form-label' }, 'Categorias Existentes'),
                        el('div', { id: 'categories-list', className: 'categories-list' },
                            el('p', { className: 'loading-text' }, 'Carregando...')
                        )
                    )
                )
            ),

            // My Learning Section
            el('div', { className: 'drawer-section' },
                el('div', { className: 'drawer-section-label' }, 'Meu Aprendizado'),
                el('a', { href: '/estudante', className: 'drawer-item' },
                    icon('school'),
                    'Meus Cursos'
                )
            )
        ),

        // Footer
        el('div', { className: 'user-drawer-footer' },
            el('button', { id: 'drawer-logout', className: 'drawer-btn logout' },
                icon('logout'),
                'Sair'
            )
        )
    );

    return drawer;
}

export function renderDrawerOverlay(): HTMLElement {
    return el('div', { className: 'drawer-overlay' });
}
