/**
 * Auth Card Component - Profile view and authentication UI
 */

import { el, icon } from '../utils/dom.js';

export function renderAuthCard(): HTMLElement {
    return el('div', { id: 'auth-card-container', className: 'auth-container' },
        el('div', { className: 'auth-card student-auth-card' },
            // Dashboard View (for logged users accessing student features)
            el('div', { id: 'auth-dashboard-view', className: 'auth-view' },
                el('div', { className: 'auth-header' },
                    el('h3', { className: 'auth-title' }, 'Minha Conta'),
                    el('button', { id: 'btn-close-auth', className: 'btn-close-auth', 'aria-label': 'Fechar' },
                        icon('close')
                    )
                ),
                el('div', { className: 'dashboard-actions' },
                    el('button', { id: 'btn-view-profile', className: 'dashboard-action-btn' },
                        icon('person'),
                        el('span', null, 'Ver Perfil')
                    ),
                    el('button', { id: 'btn-my-learning', className: 'dashboard-action-btn' },
                        icon('school'),
                        el('span', null, 'Meus Cursos')
                    ),
                    el('button', { id: 'btn-instructor-dash', className: 'dashboard-action-btn dashboard-action-instructor' },
                        icon('dashboard'),
                        el('span', null, 'Dashboard Instrutor')
                    )
                )
            ),

            // Profile View
            el('div', { id: 'auth-profile-view', className: 'auth-view', style: 'display: none;' },
                el('div', { className: 'auth-header' },
                    el('button', { id: 'btn-back-from-profile', className: 'btn-back', 'aria-label': 'Voltar' },
                        icon('arrow_back')
                    ),
                    el('h3', { className: 'auth-subtitle' }, 'Meu Perfil')
                ),
                el('div', { className: 'profile-info' },
                    el('div', { className: 'profile-avatar' },
                        icon('account_circle', 'avatar-icon')
                    ),
                    el('div', { className: 'profile-details' },
                        el('p', { className: 'profile-name', id: 'profile-name' }, 'Nome do Usuário'),
                        el('p', { className: 'profile-email', id: 'profile-email' }, 'email@exemplo.com'),
                        el('p', { className: 'profile-role', id: 'profile-role' }, 'Estudante')
                    )
                ),
                el('div', { className: 'profile-actions' },
                    el('button', { id: 'btn-edit-profile', className: 'btn-secondary' }, 'Editar Perfil'),
                    el('button', { id: 'btn-delete-account', className: 'btn-danger' }, 'Excluir Conta')
                )
            ),

            // Profile Edit View
            el('div', { id: 'auth-profile-edit', className: 'auth-view', style: 'display: none;' },
                el('div', { className: 'auth-header' },
                    el('button', { id: 'btn-back-from-edit', className: 'btn-back', 'aria-label': 'Voltar' },
                        icon('arrow_back')
                    ),
                    el('h3', { className: 'auth-subtitle' }, 'Editar Perfil')
                ),
                el('form', { id: 'profile-edit-form', className: 'auth-form' },
                    el('div', { className: 'form-group' },
                        el('label', { htmlFor: 'edit-name' }, 'Nome Completo'),
                        el('input', { type: 'text', id: 'edit-name', className: 'form-input', required: true })
                    ),
                    el('div', { className: 'form-group' },
                        el('label', { htmlFor: 'edit-email' }, 'Email'),
                        el('input', { type: 'email', id: 'edit-email', className: 'form-input', required: true })
                    ),
                    el('div', { className: 'form-group' },
                        el('label', { htmlFor: 'edit-password' }, 'Nova Senha (opcional)'),
                        el('input', { type: 'password', id: 'edit-password', className: 'form-input', placeholder: 'Deixe em branco para manter a atual' })
                    ),
                    el('div', { className: 'form-actions' },
                        el('button', { type: 'button', id: 'btn-cancel-edit', className: 'btn-secondary' }, 'Cancelar'),
                        el('button', { type: 'submit', className: 'btn-primary' }, 'Salvar Alterações')
                    )
                )
            )
        )
    );
}
