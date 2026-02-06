/**
 * Certificate Handlers - Certificate modal management
 */

export function setupCertificateHandlers(): void {
    const modal = document.getElementById('certificate-modal');
    const closeBtn = document.getElementById('close-cert-modal');
    const printBtn = document.getElementById('btn-modal-print');

    closeBtn?.addEventListener('click', () => {
        modal?.classList.add('hidden');
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal?.classList.add('hidden');
        }
    });

    printBtn?.addEventListener('click', () => {
        const iframe = document.getElementById('certificate-iframe') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }
    });

    // Setup listeners for certificate cards
    setupCertificateCardListeners();
}

export function setupCertificateCardListeners(): void {
    const cards = document.querySelectorAll('.certificate-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const hash = (card as HTMLElement).dataset.hash;
            const title = (card as HTMLElement).dataset.title;
            const date = (card as HTMLElement).dataset.date;

            if (hash && title && date) {
                openCertificateModal(hash, title, date);
            }
        });
    });
}

export function openCertificateModal(hash: string, title: string, date: string): void {
    const modal = document.getElementById('certificate-modal');
    const iframe = document.getElementById('certificate-iframe') as HTMLIFrameElement;

    if (iframe) {
        iframe.src = `certificate.html?hash=${hash}&embed=true`;
    }

    modal?.classList.remove('hidden');
}
