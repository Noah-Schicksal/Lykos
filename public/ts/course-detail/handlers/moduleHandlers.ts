/**
 * Module Handlers - accordion toggle for modules
 */

export function setupModuleHandlers(): void {
    const accordion = document.getElementById('modules-accordion');
    if (!accordion) return;

    accordion.addEventListener('click', (e) => {
        const header = (e.target as HTMLElement).closest('.module-header');
        if (!header) return;

        const card = header.closest('.module-card');
        if (card) {
            card.classList.toggle('active');
        }
    });
}
