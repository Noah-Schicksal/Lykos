/**
 * Certificate Modal Component - Display certificate in modal
 */

import { el, icon } from '../utils/dom.js';

export function renderCertificateModal(): HTMLElement {
    return el('div', { id: 'certificate-modal', className: 'modal-overlay hidden' },
        el('div', { className: 'modal-content certificate-modal' },
            el('div', { className: 'modal-header' },
                el('h3', { className: 'modal-title' }, 'Certificado de Conclusão'),
                el('button', { id: 'close-cert-modal', className: 'btn-close-modal', 'aria-label': 'Fechar' },
                    icon('close')
                )
            ),
            el('div', { className: 'modal-body' },
                el('iframe', {
                    id: 'certificate-iframe',
                    className: 'certificate-iframe',
                    src: '',
                    title: 'Certificado'
                })
            ),
            el('div', { className: 'modal-footer' },
                el('button', { id: 'btn-modal-print', className: 'btn-primary' },
                    icon('print'),
                    el('span', null, 'Imprimir')
                )
            )
        )
    );
}
