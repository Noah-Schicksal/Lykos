/**
 * Certificates View Component - Display student's earned certificates
 */

import { el, icon, clearChildren } from '../utils/dom.js';
import type { Course } from '../state/studentState.js';

export function renderCertificatesView(): HTMLElement {
    return el('section', { id: 'certificates-view', className: 'content-section hidden' },
        // Certificates grid
        el('div', { id: 'certificates-grid', className: 'certificates-grid' },
            el('div', { className: 'col-span-full py-10 text-center' },
                el('p', { className: 'text-slate-500' }, 'Carregando certificados...')
            )
        )
    );
}

export function updateCertificatesList(courses: Course[]): void {
    const grid = document.getElementById('certificates-grid');
    if (!grid) return;

    clearChildren(grid);

    const completedWithCert = courses.filter(c => c.progress === 100 && c.certificateHash);

    if (completedWithCert.length === 0) {
        grid.appendChild(
            el('div', { className: 'col-span-full py-20 text-center bg-surface-dark border border-white/5 rounded-xl' },
                el('span', { className: 'material-symbols-outlined text-6xl text-slate-700 mb-4' }, 'workspace_premium'),
                el('p', { className: 'text-slate-500 text-lg' }, 'Você ainda não possui certificados disponíveis.'),
                el('p', { className: 'text-slate-600 text-sm' }, 'Conclua 100% de um curso para desbloquear seu certificado.')
            )
        );
        return;
    }

    completedWithCert.forEach(course => {
        grid.appendChild(renderCertificateCard(course));
    });
}

export function renderCertificateCard(course: Course): HTMLElement {
    const date = course.enrolledAt
        ? new Date(course.enrolledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Data não disponível';

    return el('div', {
        className: 'certificate-card',
        'data-hash': course.certificateHash || '',
        'data-title': course.title,
        'data-date': date
    },
        el('div', { className: 'cert-card-header' },
            el('div', { className: 'cert-card-icon' },
                icon('workspace_premium')
            )
        ),
        el('div', { className: 'cert-card-info' },
            el('h3', { className: 'cert-card-title' }, course.title),
            el('span', { className: 'cert-card-date' }, `Emitido em ${date}`)
        ),
        el('div', { className: 'cert-card-footer' },
            el('span', { className: 'cert-card-hash' }, `${course.certificateHash?.substring(0, 8)}...`),
            el('span', { className: 'btn-view-cert' }, 'download')
        )
    );
}
