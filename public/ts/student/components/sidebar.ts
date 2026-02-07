/**
 * Sidebar Component - Navigation sidebar for student dashboard
 */

import { el, icon } from '../utils/dom.js';

export function renderSidebar(): HTMLElement {
    return el('aside', { id: 'sidebar', className: 'sidebar' },
        el('div', { className: 'sidebar-content' },
            // Branding
            el('div', { className: 'brand' },
                // Sidebar Toggle Button
                el('button', { id: 'sidebar-toggle-btn', className: 'menu-btn', 'aria-label': 'Alternar menu' },
                    icon('menu')
                ),
                el('a', { href: '/inicio', className: 'brand-logo' },
                    el('img', { src: 'assets/logo.svg', alt: 'Lykos Logo' })
                )
            ),

            // Nav Menu
            el('nav', { className: 'nav-menu' },
                el('a', { href: '#', id: 'nav-courses', className: 'nav-item active' },
                    icon('school'),
                    el('span', { className: 'nav-text' }, 'Meus Cursos')
                ),
                el('a', { href: '#', id: 'nav-certificates', className: 'nav-item' },
                    icon('verified'),
                    el('span', { className: 'nav-text' }, 'Certificados')
                )
            )
        ),

        // Sidebar Footer
        el('div', { className: 'sidebar-footer' },
            el('div', { className: 'sidebar-user-card' },
                el('div', { className: 'sidebar-user-avatar' },
                    icon('account_circle')
                ),
                el('div', { className: 'sidebar-user-info' },
                    el('p', { className: 'sidebar-user-name', id: 'sidebar-user-name' }, 'Aluno'),
                    el('p', { className: 'sidebar-user-role' }, 'Estudante')
                ),
                el('button', { className: 'sidebar-user-menu-btn', id: 'sidebar-avatar-btn', 'aria-label': 'Voltar para o início' },
                    icon('home')
                )
            )
        )
    );
}

export function updateSidebarUser(userName: string): void {
    const nameElement = document.getElementById('sidebar-user-name');
    if (nameElement) {
        nameElement.textContent = userName;
    }
}

export function setActiveNavItem(view: 'courses' | 'certificates'): void {
    const navCourses = document.getElementById('nav-courses');
    const navCertificates = document.getElementById('nav-certificates');

    if (navCourses && navCertificates) {
        if (view === 'courses') {
            navCourses.classList.add('active');
            navCertificates.classList.remove('active');
        } else {
            navCourses.classList.remove('active');
            navCertificates.classList.add('active');
        }
    }
}
